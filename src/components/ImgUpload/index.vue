<script setup lang="ts">
import { getToken } from "@/utils/auth";
import { reactive, ref, onMounted, watch } from "vue";
import { Plus } from "@element-plus/icons-vue";
import { defaultConfig } from "@/utils/http";

const model = defineModel<string[]>();

const upload = reactive({
  // 是否显示弹出层（用户导入）
  open: false,
  // 弹出层标题（用户导入）
  title: "",
  // 是否禁用上传
  loading: false,
  // 设置上传的请求头部
  headers: { Authorization: `Bearer ${getToken().token}` },
  // 上传的地址
  url: `${defaultConfig.baseURL}/file/upload?type=minio`
});

const initFile = ref([]);
const emit = defineEmits<{ (e: "update:modelValue", v: string[]) }>();

/** 文件上传成功处理 */
const handleFileSuccess = (response: any) => {
  if (response.code == 0) {
    model.value.push(response.data.fileName);
  }
};

function getUploadFileRef() {
  return uploadFileRef.value;
}
const uploadFileRef = ref();

function onRemove(f) {
  // 如果有response字段
  if (f.response) {
    if (model.value.indexOf(f.response.data.fileName) != -1) {
      model.value.splice(model.value.indexOf(f.response.data.fileName), 1);
    }
    return;
  } else {
    if (model.value.indexOf(f.name) != -1) {
      model.value.splice(model.value.indexOf(f.name), 1);
    }
  }
}

function handlePreview(f) {
  console.log(f);
}

defineExpose({ getUploadFileRef });
</script>

<template>
  <!--     :on-remove="onRemove" -->
  <el-upload
    ref="uploadFileRef"
    :headers="upload.headers"
    :action="upload.url"
    :on-success="handleFileSuccess"
    :on-preview="handlePreview"
    name="file"
    multiple
    list-type="picture-card"
    :on-remove="onRemove"
    :file-list="initFile"
    accept=".jpeg,.jpg,.png,.gif"
  >
    <el-icon><Plus /></el-icon>
  </el-upload>
</template>

<style lang="scss" scoped></style>
