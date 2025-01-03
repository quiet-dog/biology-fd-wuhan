<script setup lang="ts">
import {
  addKnowledgeApi,
  AddKnowledgeCommand,
  KnowledgePageResponse,
  KnowledgeTypeEntity,
  updateKnowledgeApi,
  UpdateKnowledgeCommand
} from "@/api/manage/knowledge";
import VDialog from "@/components/VDialog/VDialog.vue";
import { ElMessage, FormInstance, FormRules } from "element-plus";
import { computed, reactive, ref } from "vue";
import CUplopad from "@/components/CUpload/index.vue";
import { json } from "stream/consumers";

interface Props {
  type: "add" | "update";
  modelValue: boolean;
  row?: KnowledgePageResponse;
  typeOptions: Array<KnowledgeTypeEntity>;
}

const rules: FormRules = {
  title: [
    {
      required: true,
      message: "标题不能为空"
    }
  ],
  // createrName: [
  //   {
  //     required: true,
  //     message: "创建者不能为空"
  //   }
  // ],
  code: [
    {
      required: true,
      message: "编码不能为空"
    }
  ],
  knowledgeType: [
    {
      required: true,
      message: "知识类型不能为空"
    }
  ],
  paths: [
    {
      required: true,
      message: "文档不能为空"
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

const formData = reactive<AddKnowledgeCommand | UpdateKnowledgeCommand>({
  knowledgeId: 0,
  title: "",
  code: "",
  paths: [],
  knowledgeType: "",
  createrName: ""
});

const visible = computed({
  get: () => props.modelValue,
  set(v) {
    emits("update:modelValue", v);
  }
});

const Paths = ref([]);
async function handleConfirm() {
  formRef.value.validate(async callback => {
    if (callback) {
      try {
        loading.value = true;
        if (props.type === "add") {
          await addKnowledgeApi(formData);
        } else if (props.type === "update") {
          await updateKnowledgeApi(formData as UpdateKnowledgeCommand);
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
    Paths.value = [];
    props.row.paths.forEach(item => {
      const fileName = item.split("/").pop();
      Paths.value.push({
        name: fileName,
        url: ""
      });
    });
  }
}

function fileUploadSuccess(v: string[]) {
  formData.paths = v;
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
    :title="type === 'add' ? '新增知识库文档' : '更新知识库文档'"
    v-model="visible"
    :loading="loading"
    @confirm="handleConfirm"
    @cancel="cancelConfirm"
    @opened="handleOpened"
    @closed="handleClosed"
  >
    <el-form :model="formData" label-width="100px" :rules="rules" ref="formRef">
      <el-row>
        <el-col :span="12">
          <el-form-item label="文档编号：" prop="code">
            <el-input
              v-model="formData.code"
              placeholder="请输入文档编号"
              style="width: 300px"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="文档标题：" prop="title">
            <el-input
              v-model="formData.title"
              placeholder="请输入文档标题"
              style="width: 300px"
              clearable
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="类型" prop="knowledgeType">
            <el-select
              v-model="formData.knowledgeType"
              placeholder="请选择类型"
              style="width: 300px"
              clearable
            >
              <el-option label="流程制度" value="流程制度" />
              <el-option label="技术文档" value="技术文档" />
              <el-option label="案例分析" value="案例分析" />
              <el-option label="培训资料" value="培训资料" />
            </el-select>
          </el-form-item>
        </el-col>
        <!-- <el-col :span="12">
          <el-form-item label="创建者：" prop="createrName">
            <el-input
              v-model="formData.createrName"
              style="width: 300px"
              placeholder="请输入创建者"
              clearable
            />
          </el-form-item>
        </el-col> -->
      </el-row>
      <el-form-item label="文档" prop="paths">
        <CUplopad
          :type="type"
          ref="CUplopadRef"
          v-model="formData.paths"
          :file-list="Paths"
        />
      </el-form-item>
    </el-form>
  </v-dialog>
</template>

<style lang="scss" scoped></style>
