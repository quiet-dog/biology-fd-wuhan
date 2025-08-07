<script setup lang="ts">
import { getToken } from "@/utils/auth";
import { reactive, ref } from "vue";
import { defaultConfig } from "@/utils/http";

const props = defineProps({
  show: {
    type: Boolean,
    default: true
  }
});

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

// const successFiles = ref([]);

/** 文件上传成功处理 */
const handleFileSuccess = (response: any) => {
  if (response.code == 0) {
    model.value.push(response.data.fileName);
  }
};

const uploadFileRef = ref();

function getUploadFileRef() {
  return uploadFileRef.value;
}

function onRemove(f) {
  // 如果有response字段
  console.error("onRemove", f,model.value);
  if (f.response) {
    if (model.value.indexOf(f.response.data.fileName) != -1) {
      model.value.splice(model.value.indexOf(f.response.data.fileName), 1);
    }
    return;
  } else {
    // if (model.value.indexOf(f.name) != -1) {
    //   model.value.splice(model.value.indexOf(f.name), 1);
    // }
    model.value = model.value.filter(item => !item.includes(f.name));
  }
}

function handlePreview(f) {
  console.log(f);
}

defineExpose({ getUploadFileRef });
</script>

<template>
  <el-upload
    ref="uploadFileRef"
    accept=".pdf,.doc,.docx,.xls,.xlsx,.zip"
    :headers="upload.headers"
    :action="upload.url"
    :on-success="handleFileSuccess"
    :on-preview="handlePreview"
    name="file"
    multiple
    :on-remove="onRemove"
    :file-list="initFile"
  >
    <el-button type="primary" v-if="props.show">点击上传</el-button>
    <template #tip v-if="props.show">
      <div class="el-upload__tip">
        <span
          >附件支持的格式有: 'doc'、'docx'、'xls'、'xlsx'、'zip'、'pdf'
        </span>
      </div>
    </template>
  </el-upload>
</template>

<style lang="scss" scoped></style>
