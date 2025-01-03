<template>
  <v-detail-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    title="查看物料档案"
    v-model="visible"
    :loading="loading"
    :disableFooter="true"
    @cancel="cancelConfirm"
    @opened="handleOpened"
  >
    <el-form :model="formData" label-width="100px" ref="formRef">
      <el-row>
        <el-col :span="12">
          <el-form-item label="领用编号：">
            <el-input
              v-model="formData.code"
              autocomplete="off"
              readonly
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="物料名称：">
            <el-input
              v-model="formData.name"
              autocomplete="off"
              readonly
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="物料规格：">
        <el-input
          v-model="formData.specification"
          autocomplete="off"
          :rows="2"
          type="textarea"
          style="width: 760px"
          readonly
        />
      </el-form-item>
      <el-row>
        <el-col :span="12">
          <el-form-item label="物料类型：">
            <el-input
              v-model="formData.type"
              autocomplete="off"
              readonly
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="库存量：">
            <el-input
              v-model="formData.stock"
              autocomplete="off"
              readonly
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="物料单位：">
        <el-input
          v-model="formData.unit"
          autocomplete="off"
          readonly
          style="width: 300px"
        />
      </el-form-item>
    </el-form>
  </v-detail-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue";
import { FormInstance } from "element-plus";
import { materialFilesInfo } from "@/api/materialData/materialFiles";
import VDetailDialog from "@/components/VDetailDialog/VDetailDialog.vue";

const visible = ref(false);
const loading = ref(false);
const formRef = ref<FormInstance>();

const formData = ref({
  code: "",
  name: "",
  scope: "",
  stock: "",
  unit: "",
  type: "",
  specification: ""
});

const handleOpened = (id: number) => {
  if (!id) {
    return;
  }
  visible.value = true;
  materialFilesInfo(id).then(res => {
    formData.value = res.data;
  });
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
