<template>
  <v-detail-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    title="查看报警事件信息"
    v-model="visible"
    :loading="loading"
    :disableFooter="true"
    @cancel="cancelConfirm"
    @opened="handleOpened"
  >
    <el-form :model="formData" label-width="100px" ref="formRef">
      <el-row>
        <el-col :span="12">
          <el-form-item label="报警编号：" label-width="100">
            <el-input
              v-model="formData.eventId"
              readonly
              autocomplete="off"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="报警类型：" label-width="100">
            <el-input
              v-model="formData.type"
              readonly
              autocomplete="off"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="报警时间：" label-width="100">
            <el-input
              v-model="formData.createTime"
              readonly
              autocomplete="off"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="报警级别：" label-width="100">
            <el-input
              v-model="formData.level"
              readonly
              autocomplete="off"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="报警描述：" label-width="100">
        <el-input
          v-model="formData.description"
          readonly
          style="width: 730px"
          :rows="2"
          type="textarea"
        />
      </el-form-item>
    </el-form>
  </v-detail-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue";
import { FormInstance } from "element-plus";
import { alarmEventsInfo } from "@/api/alarmPlatform/alarmEvents";
import VDetailDialog from "@/components/VDetailDialog/VDetailDialog.vue";

const visible = ref(false);
const loading = ref(false);
const formRef = ref<FormInstance>();

const formData = ref({
  type: "",
  description: "",
  level: "",
  department: "",
  post: "",
  prank: "",
  education: null,
  contact: "",
  entryTime: 1,
  createTime: "",
  eventId: 0
});

const handleOpened = (id: number) => {
  if (!id) {
    return;
  }
  visible.value = true;
  alarmEventsInfo(id).then(res => {
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
