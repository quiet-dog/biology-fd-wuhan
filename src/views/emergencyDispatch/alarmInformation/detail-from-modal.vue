<template>
  <v-detail-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    title="查看报警信息"
    v-model="visible"
    :loading="loading"
    :disableFooter="true"
    @cancel="cancelConfirm"
    @opened="handleOpened"
  >
    <el-form :model="formData" label-width="100px" ref="formRef">
      <el-row>
        <el-col :span="12">
          <el-form-item label="报警编号：">
            <el-input
              v-model="formData.emergencyAlarmId"
              autocomplete="off"
              placeholder="请输入报警编号"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="报警类型：">
            <el-input
              v-model="formData.type"
              autocomplete="off"
              placeholder="请输入报警类型"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="报警时间：">
            <el-input
              v-model="formData.createTime"
              autocomplete="off"
              placeholder="请输入报警时间"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="报警级别：">
            <el-input
              v-model="formData.level"
              autocomplete="off"
              placeholder="请输入报警级别"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="报警描述：">
        <el-input
          v-model="formData.description"
          autocomplete="off"
          placeholder="请输入报警描述"
          style="width: 730px"
        />
      </el-form-item>
      <el-form-item label="参考文件：">
        <div class="file_list">
          <div
            v-for="(item, index) in Paths"
            :key="index"
            class="file-item"
            style="width: 100%"
          >
            <el-tooltip
              class="box-item"
              effect="dark"
              :content="item.name"
              placement="top"
            >
              <span class="file-name text-ellipsis" style="width: 100%">{{
                item.name
              }}</span>
            </el-tooltip>
            <div class="file-actions">
              <el-button
                type="primary"
                link
                :icon="Download"
                @click.stop="downloadFile(item)"
                >下载</el-button
              >
              <el-button
                type="primary"
                link
                :icon="View"
                @click.stop="getPreviewUrl(item)"
                >预览</el-button
              >
            </div>
          </div>
        </div>
      </el-form-item>
    </el-form>
  </v-detail-dialog>
  <v-detail-dialog
    style="z-index: 999999"
    :fixed-body-height="true"
    use-body-scrolling
    title="查看附件"
    v-model="previewVisible"
    :loading="loading"
    :disable-footer="true"
    @cancel="() => (previewVisible = false)"
  >
    <OfficePreview :file-url="previewVisibleUrl" />
  </v-detail-dialog>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { FormInstance } from "element-plus";
import { alarmInformationInfo } from "@/api/emergencyDispatch/alarmInformation";
import VDetailDialog from "@/components/VDetailDialog/VDetailDialog.vue";
import axios from "axios";
import { getToken } from "@/utils/auth";
import { defaultConfig } from "@/utils/http";
import { Download, View } from "@element-plus/icons-vue";
import OfficePreview from "@/components/OfficePreview/index.vue";

const visible = ref(false);
const loading = ref(false);
const formRef = ref<FormInstance>();

const formData = ref({
  emergencyAlarmId: "",
  code: "",
  type: "",
  version: "",
  creator: "",
  description: "",
  level: "",
  time: "",
  createTime: "",
  paths: []
});

const Paths = ref([]);

const handleOpened = (id: number) => {
  if (!id) {
    return;
  }
  visible.value = true;
  alarmInformationInfo(id).then(res => {
    // @ts-ignore
    formData.value = res.data;
    Paths.value = [];
    console.log(formData.value.paths);
    // @ts-ignore
    formData.value.paths.forEach((item, index) => {
      Paths.value.push({
        name: getShortFileName(item),
        path: item
      });
    });
  });
};

function getShortFileName(fileName: string): string {
  // 找到最后一个下划线和最后一个点的位置
  const lastUnderscoreIndex = fileName.lastIndexOf("_");
  const secondLastUnderscoreIndex = fileName.lastIndexOf(
    "_",
    lastUnderscoreIndex - 1
  );

  // 提取需要的部分
  const extractedName = fileName.substring(
    secondLastUnderscoreIndex + 1, // 倒数第二个下划线后开始
    lastUnderscoreIndex // 到最后一个下划线前
  );
  const fileExtension = fileName.substring(fileName.lastIndexOf("."));
  return `${extractedName}${fileExtension}`;
}

//下载文件
const downloadFile = item => {
  // 如果没有包含 补上
  if (!item.path.includes("/upload/")) {
    item.path = "/upload/" + item.path;
  }

  axios
    .get(`${defaultConfig.baseURL}/file/preview`, {
      params: {
        fileName: item.path
      },
      headers: { Authorization: `Bearer ${getToken().token}` },
      responseType: "arraybuffer" // 获取文件流
    })
    .then(response => {
      const blob = new Blob([response.data]);
      const fileURL = window.URL.createObjectURL(blob);

      // 创建 a 标签下载文件
      const link = document.createElement("a");
      link.href = fileURL;
      link.download = item.name; // 设置文件名
      link.style.display = "none";
      document.body.appendChild(link);

      // 触发下载并移除 a 标签
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(fileURL);
    })
    .catch(error => {
      console.error("Error fetching image preview:", error);
    });
};

function cancelConfirm() {
  visible.value = false;
  formRef.value?.resetFields();
}

// 预览是否打开
const previewVisible = ref(false);

const previewVisibleUrl = ref("");

const getPreviewUrl = item => {
   if (item.path[0] === "/") {
    item.path = item.path.substring(1);
  }
  previewVisibleUrl.value =item.path;
  previewVisible.value = true;
};

defineExpose({
  handleOpened
});
</script>

<style lang="scss" scoped>
.file_list {
  width: 100%;
  .file-item {
    // 改用 file-item class
    width: 300px;
    height: 35px;
    box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color))
      inset;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 5px;
    padding: 0 10px; // 移动padding到父元素
    transition: all 0.3s; // 添加过渡效果

    &:hover {
      // 添加悬停效果
      background-color: var(--el-fill-color-light);
      box-shadow: 0 0 0 1px var(--el-color-primary) inset;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  .file-actions {
    display: flex;
    gap: 8px; // 按钮之间添加间距
  }
}
</style>
