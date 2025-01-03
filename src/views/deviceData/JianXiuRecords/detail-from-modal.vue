<script setup lang="ts">
import { inspectionInfo } from "@/api/deviceData/JianXiuRecords";
import VDetailDialog from "@/components/VDetailDialog/VDetailDialog.vue";
import { FormInstance } from "element-plus";
import { ref } from "vue";
import { Download, View } from "@element-plus/icons-vue";
import OfficePreview from "@/components/OfficePreview/index.vue";
import axios from "axios";
import { getToken } from "@/utils/auth";
import { defaultConfig } from "@/utils/http";

const loading = ref(false);

const formRef = ref<FormInstance>();

const formData = ref({
  equipmentCode: "",
  inspectionCode: "",
  inspectionDate: "",
  inspectionContent: "",
  inspector: "",
  faultReason: "",
  inspectionImagePath: [],
  inspectionReportPath: [],
  recordId: 0
});

const visible = ref(false);
const inspectionReportPaths = ref([]);
const inspectionImagePaths = ref([]);
const handleOpened = async (id: number) => {
  if (!id) {
    return;
  }
  visible.value = true;
  const { data } = await inspectionInfo(id);
  inspectionReportPaths.value = [];
  inspectionImagePaths.value = [];
  data.inspectionReportPath?.forEach(item => {
    inspectionReportPaths.value.push({
      name: getShortFileName(item),
      path: item
    });
  });
  data.inspectionImagePath?.forEach(item => {
    axios
      .get(`${defaultConfig.baseURL}/file/preview`, {
        params: {
          fileName: item
        },
        headers: { Authorization: `Bearer ${getToken().token}` },
        responseType: "arraybuffer" // 获取文件流
      })
      .then(response => {
        const blob = new Blob([response.data]);
        const fileURL = window.URL.createObjectURL(blob);
        inspectionImagePaths.value.push(fileURL);
      })
      .catch(error => {
        console.error("Error fetching image preview:", error);
      });
  });
  formData.value = { ...data, equipmentCode: data.equipment.equipmentCode };
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
  if (!item.path.includes("/upload/")) {
    item.path = "/upload/" + item.path;
  }
  previewVisibleUrl.value = item.path;
  previewVisible.value = true;
};

defineExpose({
  handleOpened
});
</script>

<template>
  <v-detail-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    title="查看检修记录"
    v-model="visible"
    :loading="loading"
    :disableFooter="true"
    @cancel="cancelConfirm"
    @opened="handleOpened"
  >
    <el-form :model="formData" label-width="100px" ref="formRef">
      <el-row>
        <el-col :span="12">
          <el-form-item label="检修编号：">
            <el-input
              v-model="formData.recordId"
              placeholder="请输入检修编号"
              autocomplete="off"
              readonly
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="设备编号：">
            <el-input
              v-model="formData.equipmentCode"
              placeholder="请输入设备编号"
              autocomplete="off"
              readonly
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="检修日期：" prop="inspectionDate">
        <el-date-picker
          v-model="formData.inspectionDate"
          value-format="YYYY-MM-DD hh:mm:ss"
          type="date"
          readonly
          style="width: 300px"
          placeholder="请选择检修日期"
        />
      </el-form-item>
      <el-form-item label="检修内容：">
        <el-input
          :rows="2"
          type="textarea"
          v-model="formData.inspectionContent"
          placeholder="请输入检修内容"
          autocomplete="off"
          readonly
          style="width: 760px"
        />
      </el-form-item>
      <el-row>
        <el-col :span="12">
          <el-form-item label="检修人员" prop="inspector">
            <el-input
              v-model="formData.inspector"
              placeholder="请输入检修人员"
              autocomplete="off"
              readonly
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="检修图片：">
        <el-image
          v-for="item in inspectionImagePaths"
          :key="item"
          style="width: 100px; height: 100px; margin-left: 10px"
          :src="item"
        />
      </el-form-item>
      <el-form-item label="检修报告：">
        <div class="file_list">
          <div
            v-for="(item, index) in inspectionReportPaths"
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
  >
    <OfficePreview :file-url="previewVisibleUrl" />
  </v-detail-dialog>
</template>

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
