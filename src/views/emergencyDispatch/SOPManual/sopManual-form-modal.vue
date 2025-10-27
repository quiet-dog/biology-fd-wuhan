<script setup lang="ts">
import {
  addsopRes,
  addsop,
  renewsopRes,
  renewsop
} from "@/api/emergencyDispatch/SOPManual";
import VDialog from "@/components/VDialog/VDialog.vue";
import { ElMessage, FormInstance, FormRules } from "element-plus";
import { computed, reactive, ref } from "vue";
import CUplopad from "@/components/CUpload/index.vue";

interface Props {
  type: "add" | "update";
  modelValue: boolean;
  row?: renewsopRes;
}

const rules: FormRules = {
  name: [
    {
      required: true,
      message: "SOP名称不能为空"
    }
  ],
  scope: [
    {
      required: true,
      message: "适用范围不能为空"
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

const formData = reactive<addsopRes | renewsopRes>({
  code: "",
  name: "",
  scope: "",
  paths: [],
  sopId: 0
});

const Paths = ref([]);

const visible = computed({
  get: () => props.modelValue,
  set(v) {
    emits("update:modelValue", v);
  }
});

function handleConfirm() {
  formRef.value.validate(async callback => {
    if (callback) {
      try {
        loading.value = true;
        if (props.type === "add") {
          await addsop(formData);
        } else if (props.type === "update") {
          console.log(formData);
          await renewsop(formData as renewsopRes);
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

    // 清空
    formData.paths = [];

    Paths.value = [];

    // @ts-ignore
    props.row.paths.forEach((item, index) => {
      // 判断类型
      if (typeof item === "string") {
        const fileName = item.split("/").pop();
        Paths.value.push({
          name: fileName,
          url: "",
          index
        });
        formData.paths.push(fileName);
      } else {
        // @ts-ignore
        if (item["path"]) {
          // @ts-ignore
          const fileName = item["path"].split("/").pop();

          // 如果文件名称包含_
          if (fileName.includes("_")) {
            // @ts-ignore
            // props.row.paths[index] = fileName;
            formData.paths.push(item["path"]);
            Paths.value.push({
              name: fileName,
              url: "",
              index
            });
          }
        }
      }
    });
  }
}

function cancelConfirm() {
  visible.value = false;
  formRef.value?.resetFields();
  formData.paths = [];
}

function handleClosed() {
  formRef.value?.resetFields();
  Paths.value = [];
  formData.paths = [];
}
</script>

<template>
  <v-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    :title="type === 'add' ? '新增SOP手册' : '编辑SOP手册'"
    v-model="visible"
    :loading="loading"
    @confirm="handleConfirm"
    @cancel="cancelConfirm"
    @closed="handleClosed"
    @opened="handleOpened"
  >
    <el-form :model="formData" label-width="120px" :rules="rules" ref="formRef">
      <el-row>
        <el-col :span="12">
          <el-form-item label="SOP名称：" prop="name">
            <el-input
              v-model="formData.name"
              autocomplete="off"
              placeholder="请输入SOP名称"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="适用范围：" prop="scope">
            <el-input
              v-model="formData.scope"
              autocomplete="off"
              placeholder="请输入适用范围"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="SOP附件：" label-width="120">
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
