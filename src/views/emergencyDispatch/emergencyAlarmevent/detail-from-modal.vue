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
          <el-form-item label="事件名称：" prop="eventName">
            <el-input
              v-model="formData.eventName"
              autocomplete="off"
              readonly
              placeholder="请输入事件名称"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="处理人员：" prop="handleIds">
            <el-select
              placeholder="请选择处理人员"
              multiple
              disabled
              v-model="formData.handleIds"
              style="width: 300px"
            >
              <el-option
                v-for="item in dataList"
                :key="item.personnelId"
                :label="item.name"
                :value="item.personnelId"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="事件内容：" prop="content">
        <el-input
          v-model="formData.content"
          autocomplete="off"
          readonly
          placeholder="请输入事件内容"
          :rows="2"
          type="textarea"
          style="width: 760px"
        />
      </el-form-item>
      <el-form-item label="事件类型：" prop="type">
        <el-input
          v-model="formData.type"
          readonly
          placeholder="请输入事件类型"
        />
      </el-form-item>
      <el-form-item label="处理流程：" prop="processingFlow">
        <el-input
          v-model="formData.processingFlow"
          autocomplete="off"
          readonly
          placeholder="请输入处理流程"
          :rows="2"
          type="textarea"
          style="width: 760px"
        />
      </el-form-item>
      <el-form-item label="报警信息：" prop="emergencyAlarmIds">
        <!-- <el-select
          placeholder="请选择报警信息"
          multiple
          disabled
          v-model="formData.emergencyAlarmIds"
          style="width: 760px"
        >
          <el-option
            v-for="item in dataList2"
            :key="item.emergencyAlarmId"
            :label="`${item.emergencyAlarmId}-${item.type}`"
            :value="item.emergencyAlarmId"
          />
        </el-select> -->

        <div class="file_list">
          <div
            v-for="(item, index) in paths"
            :key="index"
            class="file-item"
            style="width: 100%"
          >
            <el-tooltip :content="item.name" placement="top">
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
  </v-detail-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue";
import { FormInstance } from "element-plus";
import { emergencyEventInfo } from "@/api/emergencyDispatch/emergencyAlarmevent";
import VDetailDialog from "@/components/VDetailDialog/VDetailDialog.vue";
import { personnelList } from "@/api/personnelData/personnelProfile";
import { alarmInformationList } from "@/api/emergencyDispatch/alarmInformation";
import { isArray } from '@pureadmin/utils';
import axios from "axios";
import { defaultConfig } from "@/utils/http";
import { getToken } from "@/utils/auth";
import { Download, View } from "@element-plus/icons-vue";
import OfficePreview from "@/components/OfficePreview/index.vue";

const visible = ref(false);
const loading = ref(false);
const formRef = ref<FormInstance>();

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


const formData = ref({
  eventName: "",
  code: "",
  content: "",
  processingFlow: "",
  handleIds: [],
  emergencyAlarmIds: [],
  type: ""
});

const form = ref({
  name: "",
  department: "",
  post: "",
  education: "",
  contact: "",
  pageSize: 10000,
  pageNum: 1
});
const dataList = ref([]);
const archiveListFun = async () => {
  const { data } = await personnelList(form.value);
  dataList.value = data.rows;
};

const form2 = ref({
  type: "",
  level: "",
  pageSize: 10000,
  pageNum: 1
});
const dataList2 = ref([]);
const archiveListFun2 = async () => {
  const { data } = await alarmInformationList(form2.value);
  dataList2.value = data.rows;
};

const paths = ref([])

const handleOpened = async (id: number) => {
  archiveListFun();
  archiveListFun2();
  if (!id) {
    return;
  }
  visible.value = true;
  const { data } = await emergencyEventInfo(id);
  paths.value = [];
  formData.value = {
    ...data,
    handleIds: data.handlers.map(item => item.personnelId),
    // emergencyAlarmIds: data.emergencyAlarmDTOs.map(
    //   item => item.emergencyAlarmId
    // )
  };
 
  if (Array.isArray(data.emergencyAlarmDTOs)) {
    data.emergencyAlarmDTOs.forEach(item => {
     if(Array.isArray(item.paths)){
       paths.value.push(...item.paths.map(path => ({
         name:getShortFileName(path),
         path:path
       })))
     }
    })
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

const previewVisible = ref(false);
const previewVisibleUrl = ref("");
const getPreviewUrl = item => {
   if (item.path[0] === "/") {
    item.path = item.path.substring(1);
  }
  previewVisibleUrl.value = item.path
  previewVisible.value = true;
};


function cancelConfirm() {
  visible.value = false;
  formRef.value?.resetFields();
}

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
