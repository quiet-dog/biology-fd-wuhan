<template>
  <v-detail-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    title="查看人员上报信息"
    v-model="visible"
    :loading="loading"
    :disableFooter="true"
    @cancel="cancelConfirm"
    @opened="handleOpened"
  >
    <el-form :model="formData" label-width="100px" ref="formRef">
      <el-row>
        <el-col :span="12">
          <el-form-item label="上报编号：">
            <el-input
              v-model="formData.reportId"
              autocomplete="off"
              readonly
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="上报人姓名：">
            <el-input
              v-model="formData.reporterInfo.user.postName"
              autocomplete="off"
              readonly
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="上报人工号：">
            <el-input
              v-model="formData.reporterInfo.user.jobCode"
              autocomplete="off"
              readonly
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="所属部门：">
            <el-input
              v-model="formData.reporterInfo.user.deptName"
              autocomplete="off"
              readonly
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="物料名称：" prop="materialsId">
            <el-input
              v-model="formData.materialsInfo.name"
              autocomplete="off"
              readonly
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="物料编号：">
            <el-input
              v-model="formData.materialsInfo.code"
              autocomplete="off"
              readonly
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="物料数量：" prop="reportNum">
            <el-input-number
              v-model="formData.reportNum"
              placeholder="请输入物料数量"
              readonly
              :min="1"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="物料单位：">
            <el-input
              v-model="formData.materialsInfo.unit"
              placeholder="请输入物料单位"
              autocomplete="off"
              readonly
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="上报日期：">
            <el-input
              v-model="formData.createTime"
              placeholder="请输入上报日期"
              autocomplete="off"
              readonly
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="上报类型：" prop="reportType">
            <el-select
              v-model="formData.reportType"
              style="width: 300px"
              placeholder="请选择上报类型"
              disabled
              clearable
            >
              <el-option label="丢失" value="丢失" />
              <el-option label="损坏" value="损坏" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="上报原因：" prop="reportReason">
        <el-input
          v-model="formData.reportReason"
          autocomplete="off"
          placeholder="请输入上报原因"
          style="width: 730px"
        />
      </el-form-item>
      <el-form-item
        label="上报图片："
        v-if="formData.reportType == '损坏'"
        label-width="100"
      >
        <el-image
          v-for="item in Paths"
          style="width: 100px; height: 100px"
          :src="item"
        />
      </el-form-item>
    </el-form>
  </v-detail-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue";
import { FormInstance } from "element-plus";
import { reportInfo } from "@/api/materialData/personnelReporting";
import {
  materialFilesListRes,
  materialFilesList
} from "@/api/materialData/materialFiles";
import VDetailDialog from "@/components/VDetailDialog/VDetailDialog.vue";
import { defaultConfig } from "@/utils/http";
import { getToken } from "@/utils/auth";
import axios from "axios";

const visible = ref(false);
const loading = ref(false);
const formRef = ref<FormInstance>();

const formData = ref({
  code: "",
  reportId: 0,
  materialsCode: "",
  reportType: "",
  reportNum: 1,
  materialsId: null,
  reportReason: "",
  createTime: "",
  materialsInfo: {},
  reporterInfo: {
    user: {
      userId: 0,
      postName: "",
      deptName: "",
      jobCode: ""
    }
  },
  paths: []
});

const form = ref<materialFilesListRes>({
  name: "",
  materialsType: "",
  pageSize: 10000,
  pageNum: 1
});
const dataList = ref([]);
const archiveListFun = async () => {
  const { data } = await materialFilesList(form.value);
  dataList.value = data.rows;
};
const Paths = ref([]);
const handleOpened = async (id: number) => {
  if (!id) {
    return;
  }
  archiveListFun();
  Paths.value = [];
  visible.value = true;
  // @ts-ignore
  const { data } = await reportInfo(id);
  data.paths?.forEach(item => {
    axios
      .get(`${defaultConfig.baseURL}/file/preview`, {
        params: {
          fileName: item
        },
        headers: { Authorization: `Bearer ${getToken().token}` },
        responseType: "arraybuffer" // 获取文件流
      })
      .then(response => {
        const blob = new Blob([response.data], { type: "image/png" });
        const fileURL = window.URL.createObjectURL(blob);
        Paths.value.push(fileURL);
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

<style lang="scss" scoped></style>
