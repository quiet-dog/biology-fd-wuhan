<script setup lang="ts">
import { equipmentRepairInfo } from "@/api/deviceData/WeiXiuRecords";
import VDetailDialog from "@/components/VDetailDialog/VDetailDialog.vue";
import { FormInstance } from "element-plus";
import { ref } from "vue";
import ImgUpload from "@/components/ImgUpload/index.vue";
import { defaultConfig } from "@/utils/http";
import { getToken } from "@/utils/auth";
import axios from "axios";

const loading = ref(false);

const ImgUploadRef = ref();

const formRef = ref<FormInstance>();

const formData = ref({
  equipmentCode: "",
  repairCode: "",
  repairDate: "",
  repairContent: "",
  faultReason: "",
  repairPersonnel: "",
  repairCost: 1,
  repairResult: "",
  repairImagePath: [],
  recordId: 0
});
const repairImagePaths = ref([]);

const visible = ref(false);
const handleOpened = async (id: number) => {
  if (!id) {
    return;
  }
  repairImagePaths.value = [];
  visible.value = true;
  const { data } = await equipmentRepairInfo(id);
  data.repairImagePath?.forEach(item => {
    axios
      .get(`${defaultConfig.baseURL}/file/preview` + item, {
        // params: {
        //   fileName: item
        // },
        headers: { Authorization: `Bearer ${getToken().token}` },
        responseType: "arraybuffer" // 获取文件流
      })
      .then(response => {
        const blob = new Blob([response.data], { type: "image/png" });
        const fileURL = window.URL.createObjectURL(blob);
        repairImagePaths.value.push(fileURL);
      })
      .catch(error => {
        console.error("Error fetching image preview:", error);
      });
  });

  formData.value = { ...data, equipmentCode: data.equipment.equipmentCode };
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
    title="查看维修记录"
    v-model="visible"
    :loading="loading"
    :disableFooter="true"
    @cancel="cancelConfirm"
    @opened="handleOpened"
  >
    <el-form :model="formData" label-width="100px" ref="formRef">
      <el-row>
        <el-col :span="12">
          <el-form-item label="维修编号：">
            <el-input
              v-model="formData.recordId"
              placeholder=""
              autocomplete="off"
              readonly
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="设备名称：">
            <el-input
              v-model="formData.equipmentName"
              placeholder=""
              autocomplete="off"
              readonly
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
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
      <el-form-item label="故障原因分析：">
        <el-input
          :rows="2"
          type="textarea"
          v-model="formData.faultReason"
          placeholder=""
          autocomplete="off"
          readonly
          style="width: 760px"
        />
      </el-form-item>
      <el-form-item label="维修内容：">
        <el-input
          :rows="2"
          type="textarea"
          v-model="formData.repairContent"
          placeholder=""
          autocomplete="off"
          readonly
          style="width: 760px"
        />
      </el-form-item>
      <el-row>
        <el-col :span="12">
          <el-form-item label="维修人员：">
            <el-input
              v-model="formData.repairPersonnel"
              placeholder=""
              autocomplete="off"
              readonly
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="维修结果：">
            <el-input
              v-model="formData.repairResult"
              placeholder=""
              autocomplete="off"
              readonly
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="维修费用：">
            <el-input
              v-model="formData.repairCost"
              placeholder=""
              autocomplete="off"
              readonly
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="维修图片：">
        <el-image
          v-for="(item, index) in repairImagePaths"
          style="width: 100px; height: 100px; margin-left: 10px"
          :preview-src-list="item"
          :src="item"
          :key="index"
        />
      </el-form-item>
    </el-form>
  </v-detail-dialog>
</template>

<style lang="scss" scoped></style>
