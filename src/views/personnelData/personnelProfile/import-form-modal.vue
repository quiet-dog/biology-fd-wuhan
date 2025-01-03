<script setup lang="ts">
import VImportDialog from "@/components/VImportDialog/VImportDialog.vue";
import { ref, reactive } from "vue";
import { UploadFilled } from "@element-plus/icons-vue";
import { downloadTemplate,exportPersonnelTemplate } from "@/api/personnelData/personnelProfile";
import { getToken } from "@/utils/auth";
import { ExportDownload } from "@/utils/exportdownload";
import { defaultConfig } from "@/utils/http/index";
import { ElMessage } from "element-plus";

const loading = ref(false);

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
  url: `${defaultConfig.baseURL}/manage/personnel/excel`
});

const uploadRef = ref();

const downloadTemplateClick = () => {
  // downloadTemplate().then(res => {
  //   ExportDownload(res, "人员导入模板");
  // });
  exportPersonnelTemplate().then(res => {
    ExportDownload(res, "人员导入模板");
  });
};

/** 文件上传成功处理 */
const handleFileSuccess = () => {
  ElMessage.success("提交成功");
  uploadRef.value.clearFiles();
  visible.value = false;
  emits("refresh");
};

const onChange = (file: any, fileList: any) => {
  file.value = file.raw;
};

const visible = ref(false);
const handleOpened = () => {
  visible.value = true;
};

const emits = defineEmits(["refresh"]);
defineExpose({
  handleOpened
});
</script>

<template>
  <v-import-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    title="导入人员档案"
    v-model="visible"
    :loading="loading"
    :disableFooter="true"
    @opened="handleOpened"
  >
    <el-form>
      <el-form-item label="导入模板：" label-width="90px">
        <el-button type="primary" @click="downloadTemplateClick"
          >下载模板</el-button
        >
      </el-form-item>
      <el-form-item>
        <el-upload
          ref="uploadRef"
          class="upload-demo"
          accept=".xlsx,.xls"
          style="width: 100%"
          drag
          :headers="upload.headers"
          :action="upload.url"
          :limit="1"
          :on-success="handleFileSuccess"
          :on-change="onChange"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">将文件拖拽此处或点击上传</div>
        </el-upload>
      </el-form-item>
    </el-form>
  </v-import-dialog>
</template>

<style lang="scss" scoped></style>
