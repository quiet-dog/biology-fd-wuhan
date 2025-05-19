<script setup lang="ts">
import { notificationInfo } from "@/api/notificationCenter";
import VDetailDialog from "@/components/VDetailDialog/VDetailDialog.vue";
import { FormInstance } from "element-plus";
import { ref } from "vue";
import axios from "axios";
import { getToken } from "@/utils/auth";
import { defaultConfig } from "@/utils/http";

const loading = ref(false);

const formRef = ref<FormInstance>();

const formData = ref({
  importance: 0,
  notificationContent: "",
  notificationId: 0,
  notificationTitle: "",
  notificationType: "",
  readStatus: 0,
  readTime: "",
  sendTime: ""
});

const visible = ref(false);
const attachmentPaths = ref([]);
const handleOpened = async (id: number) => {
  if (!id) {
    return;
  }
  attachmentPaths.value = [];
  visible.value = true;
  const { data } = await notificationInfo(id);
  data.attachmentPath?.forEach(item => {
    axios
      .get(`${defaultConfig.baseURL}/file/preview`+item, {
        // params: {
        //   fileName: item
        // },
        headers: { Authorization: `Bearer ${getToken().token}` },
        responseType: "arraybuffer" // 获取文件流
      })
      .then(response => {
        const blob = new Blob([response.data]);
        const fileURL = window.URL.createObjectURL(blob);
        const fileName = item.split("/").pop();
        attachmentPaths.value.push({
          name: fileName, // 文件名
          url: fileURL // 生成的 URL
        });
      })
      .catch(error => {
        console.error("Error fetching image preview:", error);
      });
  });
  formData.value = {
    ...data,
    readStatus: data.readStatus == 0 ? "未读" : "已读"
  };
};

function cancelConfirm() {
  visible.value = false;
}
const handleClosed = () => {
  formRef.value?.resetFields();
  emits("list");
};

const emits = defineEmits(["list"]);
defineExpose({
  handleOpened
});
</script>

<template>
  <v-detail-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    title="查看通知中心"
    v-model="visible"
    :loading="loading"
    :disableFooter="true"
    @cancel="cancelConfirm"
    @opened="handleOpened"
    @closed="handleClosed"
  >
    <el-form :model="formData" label-width="120px" ref="formRef">
      <el-row>
        <el-col :span="12">
          <el-form-item label="编号：">
            <el-input
              v-model="formData.notificationId"
              autocomplete="off"
              readonly
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="标题：">
            <el-input
              v-model="formData.notificationTitle"
              autocomplete="off"
              readonly
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="通知内容：">
        <el-input
          v-model="formData.notificationContent"
          autocomplete="off"
          :rows="2"
          readonly
          type="textarea"
          style="width: 760px"
        />
      </el-form-item>
      <el-row>
        <el-col :span="12">
          <el-form-item label="类型：">
            <el-input
              v-model="formData.notificationType"
              autocomplete="off"
              readonly
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="发送时间：">
            <el-input
              v-model="formData.sendTime"
              autocomplete="off"
              readonly
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-form-item label="状态：">
          <el-input
            v-model="formData.readStatus"
            autocomplete="off"
            readonly
            style="width: 300px"
          />
        </el-form-item>
      </el-row>
    </el-form>
  </v-detail-dialog>
</template>

<style lang="scss" scoped></style>
