<script setup lang="ts">
import { archiveInfo } from "@/api/processData/processArchives";
import VDetailDialog from "@/components/VDetailDialog/VDetailDialog.vue";
import { FormInstance } from "element-plus";
import { ref } from "vue";
import axios from "axios";
import { getToken } from "@/utils/auth";
import { defaultConfig } from "@/utils/http";
import { Download, View } from "@element-plus/icons-vue";
import { nodeListRes, nodeList } from "@/api/processData/processNode";
import dayjs from "dayjs";
import OfficePreview from "@/components/OfficePreview/index.vue";

const loading = ref(false);

const formRef = ref<FormInstance>();

const formData = ref({
  craftArchiveId: 0,
  craftArchiveCode: "",
  craftArchiveName: "",
  creator: "",
  version: "",
  createDate: "",
  attachmentPath: []
});

const visible = ref(false);
const activeName = ref("first");
const attachmentPaths = ref([]);

const nodeData = ref<nodeListRes>({
  nodeName: "",
  craftArchiveName: "",
  craftArchiveId: null,
  pageNum: 1,
  pageSize: 10000
});
const nodeDataList = ref([]);
const nodelist = async () => {
  const { data } = await nodeList({
    ...nodeData.value,
    craftArchiveId: formData.value.craftArchiveId
  });
  nodeDataList.value = data.rows;
};
const handleOpened = async (id: number) => {
  if (!id) {
    return;
  }
  attachmentPaths.value = [];
  visible.value = true;
  const { data } = await archiveInfo(id);

  if (data.attachmentPath) {
    data.attachmentPath?.forEach(item => {
      attachmentPaths.value.push({
        name: getShortFileName(item),
        path: item
      });
    });
  } else {
    attachmentPaths.value = [];
  }
  formData.value = data;
};

const handleTabChange = async val => {
  switch (val) {
    case "first":
      break;
    case "second":
      await nodelist();
      break;
    case "third":
      break;
    default:
      break;
  }
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
    .get(`${defaultConfig.baseURL}/file/preview`+item.path, {
      // params: {
      //   fileName: item.path
      // },
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
}

// 预览是否打开
const previewVisible = ref(false);

const previewVisibleUrl = ref("");

const getPreviewUrl = item => {
  // if (!item.path.includes("/upload/")) {
  //   item.path = "upload/" + item.path;
  // }
  // 对url进行编码
  if (item.path[0] === "/") {
    item.path = item.path.substring(1);
  }
  previewVisibleUrl.value = item.path;
  previewVisible.value = true;
};

function handleClosed() {
  formRef.value?.resetFields();
  activeName.value = "first";
}

defineExpose({
  handleOpened
});
</script>

<template>
  <v-detail-dialog
    style="z-index: 999991"
    :fixed-body-height="false"
    use-body-scrolling
    title="查看工艺档案"
    v-model="visible"
    :loading="loading"
    :disable-footer="true"
    @cancel="cancelConfirm"
    @opened="handleOpened"
    @closed="handleClosed"
  >
    <el-tabs
      v-model="activeName"
      class="demo-tabs"
      @tab-change="handleTabChange"
    >
      <el-tab-pane label="基础信息" name="first">
        <el-form :model="formData" label-width="120px" ref="formRef">
          <el-row>
            <el-col :span="12">
              <el-form-item label="工艺编号：">
                <el-input
                  v-model="formData.craftArchiveCode"
                  autocomplete="off"
                  placeholder="请输入文档编号"
                  readonly
                  style="width: 300px"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="工艺名称：">
                <el-input
                  v-model="formData.craftArchiveName"
                  autocomplete="off"
                  placeholder="请输入工艺名称"
                  readonly
                  style="width: 300px"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="版本：">
                <el-input
                  v-model="formData.version"
                  placeholder="请输入版本"
                  autocomplete="off"
                  readonly
                  style="width: 300px"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="工艺制定人员：">
                <el-input
                  v-model="formData.creator"
                  placeholder="请输入工艺制定人员"
                  autocomplete="off"
                  readonly
                  style="width: 300px"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="创建时间：">
            <el-input
              v-model="formData.createDate"
              placeholder="请输入创建时间"
              autocomplete="off"
              readonly
              style="width: 300px"
            />
          </el-form-item>
          <el-form-item label="文档：">
            <div class="file_list">
              <div
                v-for="(item, index) in attachmentPaths"
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
      </el-tab-pane>
      <el-tab-pane label="工艺节点" name="second">
        <el-table :data="nodeDataList" style="width: 100%">
          <el-table-column prop="craftNodeId" label="节点编号" align="center" />
          <el-table-column prop="nodeName" label="工艺节点" align="center" />
          <el-table-column
            prop="requiredTime"
            label="所需时间"
            align="center"
          />
          <el-table-column
            prop="isHighRisk"
            label="是否为高风险"
            align="center"
          >
            <template #default="{ row }">
              <span>{{ row.isHighRisk ? "是" : "否" }}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </v-detail-dialog>
  <v-detail-dialog
    style="z-index: 999999"
    :fixed-body-height="true"
    use-body-scrolling
    title="查看附件"
    v-model="previewVisible"
    :loading="loading"
    :disable-footer="true"
    @cancel="previewVisible = false"
    @opened="previewVisible = true"
    @closed="previewVisible = false"
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
