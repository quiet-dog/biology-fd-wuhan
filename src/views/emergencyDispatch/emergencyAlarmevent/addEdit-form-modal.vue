<script setup lang="ts">
import {
  addemergencyEventRes,
  addemergencyEvent
} from "@/api/emergencyDispatch/emergencyAlarmevent";
import VDialog from "@/components/VDialog/VDialog.vue";
import { ElMessage, FormInstance, FormRules } from "element-plus";
import { computed, reactive, ref } from "vue";
import { personnelList } from "@/api/personnelData/personnelProfile";
import { alarmInformationList } from "@/api/emergencyDispatch/alarmInformation";

interface Props {
  type: "add" | "update";
  modelValue: boolean;
}

const rules: FormRules = {
  eventName: [
    {
      required: true,
      message: "事件名称不能为空"
    }
  ],
  handleIds: [
    {
      required: true,
      message: "处理人员不能为空"
    }
  ],
  content: [
    {
      required: true,
      message: "事件内容不能为空"
    }
  ],
  processingFlow: [
    {
      required: true,
      message: "处理流程不能为空"
    }
  ],
  emergencyAlarmIds: [
    {
      required: true,
      message: "处理流程不能为空"
    }
  ],
  type: [
    {
      required: true,
      message: "事件类型不能为空"
    }
  ]
};

const props = defineProps<Props>();

const emits = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (e: "success"): void;
}>();

const loading = ref(false);

const formRef = ref<FormInstance>();

const formData = reactive<addemergencyEventRes>({
  eventName: "",
  code: "",
  content: "",
  processingFlow: "",
  handleIds: [],
  emergencyAlarmIds: [],
  type: ""
});

const visible = computed({
  get: () => props.modelValue,
  set(v) {
    emits("update:modelValue", v);
  }
});

function handleConfirm() {
  formRef.value.validate(async callback => {
    if (callback) {
      try {
        loading.value = true;
        await addemergencyEvent(formData);
        ElMessage.success("提交成功");
        visible.value = false;
        formRef.value?.resetFields();
        emits("success");
      } catch (e) {
        console.error(e);
        ElMessage.error((e as Error)?.message || "提交失败");
      } finally {
        loading.value = false;
      }
    }
  });
}
const loadArchive = () => {
  // console.log("加载更多数据");
  form.value.pageNum++;
  archiveListFun();
}

const loadAlarm = () => {
  form2.value.pageNum++;
  archiveListFun2();
}

const form = ref({
  name: "",
  department: "",
  post: "",
  education: "",
  contact: "",
  pageSize: 10,
  pageNum: 1
});
const dataList = ref([]);
const archiveListFun = async () => {
  const { data } = await personnelList(form.value);
  // dataList.value = data.rows;
  if (data.rows.length > 0) {
    dataList.value = [...dataList.value, ...data.rows];
  } 
};

const form2 = ref({
  type: "",
  level: "",
  pageSize: 10,
  pageNum: 1
});
const dataList2 = ref([]);
const archiveListFun2 = async () => {
  const { data } = await alarmInformationList(form2.value);
  if (data.rows.length > 0) {
    dataList2.value = [...dataList2.value, ...data.rows];
  }
};

function handleOpened() {
  archiveListFun();
  archiveListFun2();
}

function cancelConfirm() {
  visible.value = false;
}
function handleClosed() {
  formRef.value?.resetFields();
  formData.emergencyAlarmIds = [];
  // formRef.value?.
}
</script>

<template>
  <v-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    :title="type === 'add' ? '新增报警事件' : '编辑报警事件'"
    v-model="visible"
    :loading="loading"
    @confirm="handleConfirm"
    @cancel="cancelConfirm"
    @closed="handleClosed"
    @opened="handleOpened"
  >
    <el-form :model="formData" label-width="120px" :rules="rules" ref="formRef">
      <el-row>
        <el-col :span="12">
          <el-form-item label="事件名称：" prop="eventName">
            <el-input
              v-model="formData.eventName"
              autocomplete="off"
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
              v-model="formData.handleIds"
              style="width: 300px"
            >
              <div v-infinite-scroll="loadArchive">
                <el-option
                v-for="item in dataList"
                :key="item.personnelId"
                :label="item.name"
                :value="item.personnelId"
              />
              </div>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="事件类型：" prop="type">
            <el-select
              v-model="formData.type"
              placeholder="请选择事件类型"
              style="width: 300px"
            >
              <el-option label="政策法规类" value="政策法规类" />
              <el-option label="设备报警类" value="设备报警类" />
              <el-option label="环境报警类" value="环境报警类" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="事件内容：" prop="content">
        <el-input
          v-model="formData.content"
          autocomplete="off"
          placeholder="请输入事件内容"
          :rows="2"
          type="textarea"
          style="width: 760px"
        />
      </el-form-item>
      <el-form-item label="处理流程：" prop="processingFlow">
        <el-input
          v-model="formData.processingFlow"
          autocomplete="off"
          placeholder="请输入处理流程"
          :rows="2"
          type="textarea"
          style="width: 760px"
        />
      </el-form-item>
      <el-form-item label="报警信息：">
        <el-select
          placeholder="请选择报警信息"
          multiple
          v-model="formData.emergencyAlarmIds"
          style="width: 760px"
        >
        <div v-infinite-scroll="loadAlarm">
          <el-option
            v-for="item in dataList2"
            :key="item.emergencyAlarmId"
            :label="`${item.emergencyAlarmId}-${item.level}-${item.description}`"
            :value="item.emergencyAlarmId"
          />
        </div>
        </el-select>
      </el-form-item>
    </el-form>
  </v-dialog>
</template>

<style lang="scss" scoped></style>
