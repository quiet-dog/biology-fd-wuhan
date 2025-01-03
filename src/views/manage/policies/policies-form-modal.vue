<script setup lang="ts">
import {
  addPoliciesApi,
  AddPoliciesCommand,
  PoliciesPageResponse,
  updatePoliciesApi,
  UpdatePoliciesCommand
} from "@/api/manage/policies";
import VDialog from "@/components/VDialog/VDialog.vue";
import { ElMessage, FormInstance, FormRules } from "element-plus";
import { computed, reactive, ref } from "vue";
import CUplopad from "@/components/CUpload/index.vue";

interface Props {
  type: "add" | "update";
  modelValue: boolean;
  row?: PoliciesPageResponse;
}

const rules: FormRules = {
  policiesName: [
    {
      required: true,
      message: "名称不能为空"
    }
  ],
  paths: [
    {
      required: true,
      message: "请上传附件"
    }
  ]
};

const props = defineProps<Props>();

const emits = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (e: "success"): void;
}>();

const loading = ref(false);

const formRef = ref<FormInstance>();
const CUplopadRef = ref();

const Paths = ref([]);
const formData = reactive<AddPoliciesCommand | UpdatePoliciesCommand>({
  policiesCode: "",
  policiesName: "",
  releaseDate: "",
  policiesId: 0,
  paths: [],
  type:"",
});


const typeOptions = reactive([
  {
    value: "国家法律",
    label: "国家法律"
  },
  {
    value: "行政法规",
    label: "行政法规"
  },
  {
    value: "地方性法规",
    label: "地方性法规"
  },
  {
    value: "部门规章",
    label: "部门规章"
  },
  {
    value: "地方政府规章",
    label: "地方政府规章"
  },
])

const visible = computed({
  get: () => props.modelValue,
  set(v) {
    emits("update:modelValue", v);
  }
});

function handleConfirm() {
  console.log("formData.paths",formData.paths);
  formRef.value.validate(async callback => {
    if (callback) {
      try {
        loading.value = true;
        if (props.type === "add") {
          await addPoliciesApi(formData);
        } else if (props.type === "update") {
          await updatePoliciesApi(formData as UpdatePoliciesCommand);
        }
        ElMessage.success("提交成功");
        visible.value = false;
        formRef.value?.resetFields();
        emits("success");
      } catch (e) {
        console.error(e);
        ElMessage.error((e as Error)?.message || "提交失败");
      } finally {
        loading.value = false;
      }
    }
  });
}

function handleOpened() {
  if (props.row) {
    Object.assign(formData, props.row);
    formData.paths = JSON.parse(JSON.stringify(props.row?.paths));
  }
}

function cancelConfirm() {
  visible.value = false;
}
function handleClosed() {
  formRef.value?.resetFields();
  Paths.value = [];
}
</script>

<template>
  <v-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    :title="type === 'add' ? '新增政策法规' : '更新政策法规'"
    v-model="visible"
    :loading="loading"
    @confirm="handleConfirm"
    @cancel="cancelConfirm"
    @opened="handleOpened"
    @closed="handleClosed"
  >
    <el-form :model="formData" label-width="120px" :rules="rules" ref="formRef">
      <el-form-item label="名称" prop="policiesName">
        <el-input
          v-model="formData.policiesName"
          placeholder="请输入名称"
          clearable
        />
      </el-form-item>
       <el-form-item label="类型" prop="type">
         <el-select v-model="formData.type">
          <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="附件" prop="paths">
        <CUplopad
          :type="type"
          ref="CUplopadRef"
          v-model="formData.paths"
          :file-list="Paths"
          limit="1"
        />
      </el-form-item>
    </el-form>
  </v-dialog>
</template>

<style lang="scss" scoped></style>
