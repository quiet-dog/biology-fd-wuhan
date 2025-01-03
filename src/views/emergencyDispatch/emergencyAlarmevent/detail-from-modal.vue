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
        <el-select
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
        </el-select>
      </el-form-item>
    </el-form>
  </v-detail-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue";
import { FormInstance } from "element-plus";
import { emergencyEventInfo } from "@/api/emergencyDispatch/emergencyAlarmevent";
import VDetailDialog from "@/components/VDetailDialog/VDetailDialog.vue";
import { personnelList } from "@/api/personnelData/personnelProfile";
import { alarmInformationList } from "@/api/emergencyDispatch/alarmInformation";

const visible = ref(false);
const loading = ref(false);
const formRef = ref<FormInstance>();

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

const handleOpened = async (id: number) => {
  archiveListFun();
  archiveListFun2();
  if (!id) {
    return;
  }
  visible.value = true;
  const { data } = await emergencyEventInfo(id);
  formData.value = {
    ...data,
    handleIds: data.handlers.map(item => item.personnelId),
    emergencyAlarmIds: data.emergencyAlarmDTOs.map(
      item => item.emergencyAlarmId
    )
  };
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
