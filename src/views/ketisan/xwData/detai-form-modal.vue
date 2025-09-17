<script lang="ts" setup>
import { addXwAlarm } from "@/api/xwAlarm/index";
import {
  AddXwAlarmReq,
  UpdateXwAlarmReq,
  XwAlarmRow
} from "@/api/xwAlarm/types";
import { ElMessage, FormRules } from "element-plus";
import { computed, reactive, ref } from "vue";
import VDialog from "@/components/VDialog/VDialog.vue";

interface Props {
  modelValue: boolean;
  row: XwAlarmRow;
}
const props = defineProps<Props>();
const loading = ref(false);
const formRef = ref();

const emits = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (e: "success"): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set(v) {
    emits("update:modelValue", v);
  }
});

const formData = reactive<UpdateXwAlarmReq>({
  cameraId: "",
  seatNumber: "",
  xwAlarmId: 0,
  alarmId: 0, // 外部报警ID
  picPath: "", // 处理后图片路径（可选）
  picPathOrg: "", // 原始图片路径
  timeStamp: 0, // 时间戳（可选）
  flag: 0, // 报警标志（可选）
  filterFlag: 0, // 过滤标志（可选）
  functionType: 0, // 功能类型（可选）
  displayFlag: 0, // 显示标志（可选）
  createdAt: 0, // 外部创建时间（可选）
  pushTime: 0, // 推送时间（可选）
  flagStr: "",
  createTime: ""
});

function cancelConfirm() {
  visible.value = false;
}

function handleOpened() {
  if (props.row) {
    Object.assign(formData, props.row);
  }
}

const getPicUrl = item => {
  if (item != null && item != "") {
    return `/renTiServer` + item.replace("/home/hust/storage", "");
  }
  return "";
};

function handleClosed() {}

function changePersonnel(item) {}
</script>

<template>
  <v-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    title="查看行为监测数据"
    v-model="visible"
    :loading="loading"
    @cancel="cancelConfirm"
    @opened="handleOpened"
    @closed="handleClosed"
  >
    <el-form :model="formData" label-width="100px" ref="formRef">
      <el-row>
        <el-col :span="12">
          <el-form-item label="报警序号：" prop="xwAlarmId">
            <el-input
              disabled
              filterable
              :placeholder="String(formData.xwAlarmId)"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="机位号：" prop="seatNumber">
            <el-input
              disabled
              :placeholder="formData.seatNumber"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="摄像头ID：" prop="cameraId">
            <el-input
              :placeholder="formData.cameraId"
              disabled
              autocomplete="off"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="报警时间：" prop="createTime">
            <el-input
              style="width: 300px"
              v-model="formData.createTime"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="报警图片：" prop="picPath">
            <el-image
              :src="getPicUrl(formData.picPath)"
              :preview-src-list="[getPicUrl(formData.picPathOrg)]"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </v-dialog>
</template>

<style scoped></style>
