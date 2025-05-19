<script setup lang="ts">
import { dailyInspectionInfo } from "@/api/deviceData/dailyInspectionRecords";
import VDetailDialog from "@/components/VDetailDialog/VDetailDialog.vue";
import { FormInstance } from "element-plus";
import { ref } from "vue";
import ImgUpload from "@/components/ImgUpload/index.vue";
import { defaultConfig } from "@/utils/http";
import { getToken } from "@/utils/auth";
import axios from "axios";

const loading = ref(false);

const formRef = ref<FormInstance>();

const formData = ref({
  inspectionDate: "",
  inspectionCode: "",
  taskDescription: "",
  inspector: "",
  anomalyCount: 1,
  anomalyDescription: "",
  inspectionImagePath: [],
  recordId: 0,
  inspectionResult:""
});
const inspectionImagePaths = ref([]);

const visible = ref(false);
const handleOpened = async (id: number) => {
  if (!id) {
    return;
  }
  inspectionImagePaths.value = [];
  visible.value = true;
  const { data } = await dailyInspectionInfo(id);
  data.inspectionImagePath.forEach(item => {
    axios
      .get(`${defaultConfig.baseURL}/file/preview`+item, {
        // params: {
        //   fileName: item
        // },
        headers: { Authorization: `Bearer ${getToken().token}` },
        responseType: "arraybuffer" // 获取文件流
      })
      .then(response => {
        const blob = new Blob([response.data], { type: "image/png" });
        const fileURL = window.URL.createObjectURL(blob);
        inspectionImagePaths.value.push(fileURL);
      })
      .catch(error => {
        console.error("Error fetching image preview:", error);
      });
  });

  formData.value = data;
};

function cancelConfirm() {
  visible.value = false;
  formRef.value?.resetFields();
}
defineExpose({
  handleOpened
});
</script>

<template>
  <v-detail-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    title="查看日常巡检记录"
    v-model="visible"
    :loading="loading"
    :disableFooter="true"
    @cancel="cancelConfirm"
    @opened="handleOpened"
  >
    <el-form :model="formData" label-width="100px" ref="formRef">
      <el-form-item label="巡检日期：" prop="inspectionDate">
        <el-date-picker
          v-model="formData.inspectionDate"
          value-format="YYYY-MM-DD hh:mm:ss"
          type="date"
          readonly
          style="width: 300px"
          placeholder="请选择巡检日期"
        />
      </el-form-item>
      <el-form-item label="任务描述：" prop="taskDescription">
        <el-input
          v-model="formData.taskDescription"
          placeholder="请输入任务描述"
          autocomplete="off"
          readonly
          style="width: 760px"
        />
      </el-form-item>
      <el-row>
        <el-col :span="12">
          <el-form-item label="巡检人员：" prop="inspector">
            <el-input
              v-model="formData.inspector"
              placeholder="请输入巡检人员"
              autocomplete="off"
              readonly
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="异常数：" prop="anomalyCount">
            <el-input-number
              v-model="formData.anomalyCount"
              placeholder="请输入异常数"
              :min="1"
              autocomplete="off"
              readonly
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="异常说明：" prop="anomalyDescription">
        <el-input
          v-model="formData.anomalyDescription"
          placeholder="请输入异常说明"
          autocomplete="off"
          readonly
          style="width: 300px"
        />
      </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="巡检结果：" prop="inspectionResult">
            <el-input
              v-model="formData.inspectionResult"
              placeholder="请输入巡检结果"
              autocomplete="off"
              readonly
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="巡检图片：">
        <el-image
          v-for="item in inspectionImagePaths"
          style="width: 100px; height: 100px; margin-left: 10px"
          :src="item"
        />
      </el-form-item>
    </el-form>
  </v-detail-dialog>
</template>

<style lang="scss" scoped></style>
