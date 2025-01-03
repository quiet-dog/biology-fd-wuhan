<template>
  <v-detail-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    title="查看处置手册"
    v-model="visible"
    :loading="loading"
    :disableFooter="true"
    @cancel="cancelConfirm"
    @opened="handleOpened"
  >
    <el-form :model="formData" label-width="120px" ref="formRef">
      <el-row>
        <el-col :span="12">
          <el-form-item label="工艺名称：">
            <el-input
              v-model="formData.craftArchive.craftArchiveName"
              autocomplete="off"
              readonly
              placeholder="请输入工艺名称"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="工艺节点：">
            <el-input
              v-model="formData.craftNode.nodeName"
              autocomplete="off"
              placeholder="请输入工艺节点"
              readonly
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="发生问题：">
        <el-input
          v-model="formData.problemDescription"
          placeholder="请输入发生问题"
          autocomplete="off"
          type="textarea"
          :rows="2"
          readonly
          style="width: 760px"
        />
      </el-form-item>
      <el-form-item label="紧急处理流程：">
        <el-input
          v-model="formData.emergencyProcess"
          placeholder="请输入紧急处理流程"
          autocomplete="off"
          type="textarea"
          :rows="2"
          readonly
          style="width: 760px"
        />
      </el-form-item>
      <el-row>
        <el-col :span="12">
          <el-form-item label="责任划分：">
            <el-input
              v-model="formData.responsibilityDivision"
              placeholder="请输入责任划分"
              autocomplete="off"
              readonly
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="所需时间：">
            <el-input
              v-model="formData.requiredTime"
              placeholder="请输入所需时间"
              autocomplete="off"
              readonly
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="预防措施：">
        <el-input
          v-model="formData.preventiveMeasures"
          placeholder="请输入预防措施"
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
import { manualInfo } from "@/api/processData/processingManual";
import { FormInstance } from "element-plus";
import VDetailDialog from "@/components/VDetailDialog/VDetailDialog.vue";

const visible = ref(false);
const loading = ref(false);
const formRef = ref<FormInstance>();

const formData = ref({
  problemDescription: "",
  emergencyProcess: "",
  responsibilityDivision: "",
  requiredTime: "",
  preventiveMeasures: "",
  craftDisposeManualId: 0,
  craftNodeId: 0,
  craftArchiveId: 0,
  craftArchive: {
    craftArchiveName: ""
  },
  craftNode: {
    nodeName: ""
  }
});

const handleOpened = (id: number) => {
  if (!id) {
    return;
  }
  visible.value = true;
  manualInfo(id).then(res => {
    formData.value = res.data;
    if (!formData.value.craftNode) {
      formData.value.craftNode = {
        nodeName: ""
      };
    }

    if (!formData.value.craftArchive) {
      formData.value.craftArchive = {
        craftArchiveName: ""
      };
    }
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
