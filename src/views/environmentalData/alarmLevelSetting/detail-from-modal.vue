<script setup lang="ts">
import { archiveInfo } from "@/api/processData/processArchives";
import VDetailDialog from "@/components/VDetailDialog/VDetailDialog.vue";
import { FormInstance } from "element-plus";
import { ref } from "vue";

const loading = ref(false);

const formRef = ref<FormInstance>();

const formData = ref({
  craftArchiveCode: "",
  craftArchiveName: "",
  creator: "",
  version: "",
  createDate: "",
  attachmentPath: ""
});

const visible = ref(false);

const handleOpened = (id: number) => {
  if (!id) {
    return;
  }
  visible.value = true;
  archiveInfo(id).then(res => {
    console.log(res);
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

<template>
  <v-detail-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    title="查看工艺档案"
    v-model="visible"
    :loading="loading"
    :disableFooter="true"
    @cancel="cancelConfirm"
    @opened="handleOpened"
  >
    <el-form :model="formData" label-width="120px" ref="formRef">
      <el-row>
        <el-col :span="12">
          <el-form-item label="文档编号：">
            <el-input
              v-model="formData.craftArchiveCode"
              autocomplete="off"
              placeholder="请输入文档编号"
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
              style="width: 350px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="文档：">
        <!-- <CUplopad :type="type" ref="CUplopadRef" /> -->
      </el-form-item>
    </el-form>
  </v-detail-dialog>
</template>

<style lang="scss" scoped></style>
