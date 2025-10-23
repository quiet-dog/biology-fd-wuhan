<script setup lang="ts">
import {
  addXunJianApi,
  AddXunJianCommand,
  XunJianPageResponse,
  XunJianTypeEntity,
  updateXunJianApi,
  UpdateXunJianCommand
} from "@/api/manage/xunJian.ts";
import VDialog from "@/components/VDialog/VDialog.vue";
import { ElMessage, FormInstance, FormRules } from "element-plus";
import { computed, reactive, ref } from "vue";
import CUplopad from "@/components/CUpload/index.vue";
import { json } from "stream/consumers";
import dayjs from "dayjs";

interface Props {
  type: "add" | "update";
  modelValue: boolean;
  row?: XunJianPageResponse;
}

const rules: FormRules = {
  title: [
    {
      required: true,
      message: "标题不能为空"
    }
  ],

};

const props = defineProps<Props>();

const emits = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (e: "success"): void;
}>();

const loading = ref(false);

const formRef = ref<FormInstance>();
const CUplopadRef = ref();

const formData = reactive<AddXunJianCommand | UpdateXunJianCommand>({
  xunJianId: 0,
  fanWei: "",
  xunJianPinLu: "每日",
  xunJianLeiXing: "定点巡检",
  startTime: 0,
  endTime: 0,
  enable: false,
  timeRange: []
});

const visible = computed({
  get: () => props.modelValue,
  set(v) {
    emits("update:modelValue", v);
  }
});

const Paths = ref([]);
async function handleConfirm() {
  formRef.value.validate(async callback => {
    if (callback) {
      try {
        loading.value = true;
        if (props.type === "add") {
          await addXunJianApi(formData);
        } else if (props.type === "update") {
          await updateXunJianApi(formData as UpdateXunJianCommand);
        }
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
function handleOpened() {
  if (props.row) {
    Object.assign(formData, props.row);
    Paths.value = [];
  }
}


function cancelConfirm() {
  visible.value = false;
}
function handleClosed() {
  formRef.value?.resetFields();
  Paths.value = [];
}

const startTime = ref('')
const endTime = ref('')
function changeStartTime(val) {
  if (val) {
    const seconds = dayjs.duration({
      hours: parseInt(val.split(":")[0]),
      minutes: parseInt(val.split(":")[1])
    }).asSeconds();
    formData.timeRange[0] = seconds
  }
}
function changeEndTime(val) {
  if (val) {
    const seconds = dayjs.duration({
      hours: parseInt(val.split(":")[0]),
      minutes: parseInt(val.split(":")[1])
    }).asSeconds();
    formData.timeRange[1] = seconds
  }
}
</script>

<template>
  <v-dialog show-full-screen :fixed-body-height="false" use-body-scrolling :title="type === 'add' ? '新增巡检计划' : '更新巡检计划'"
    v-model="visible" :loading="loading" @confirm="handleConfirm" @cancel="cancelConfirm" @opened="handleOpened"
    @closed="handleClosed">
    <el-form :model="formData" label-width="100px" :rules="rules" ref="formRef">
      <el-row>
        <el-col :span="12">
          <el-form-item label="覆盖范围：" prop="code">
            <el-input v-model="formData.fanWei" placeholder="请输入覆盖范围" style="width: 300px" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="巡检频率:" prop="xunJianPinLu">
            <el-select v-model="formData.xunJianPinLu">
              <el-option label="每日" value="每日" />
              <el-option label="每周" value="每周" />
              <el-option label="每月" value="每月" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="巡检类型:" prop="xunJianLeiXing">
            <el-select v-model="formData.xunJianLeiXing">
              <el-option label="定点巡检" value="定点巡检" />
              <el-option label="持续巡检" value="持续巡检" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="开始时间:">
            <el-time-select v-if="formData.xunJianPinLu == '每日'" @change="changeStartTime" v-model="startTime"
              start="00:00" end="23:45" step="00:15" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="结束时间:">
            <el-time-select v-if="formData.xunJianLeiXing == '持续巡检'" @change="changeEndTime" v-model="endTime"
              start="00:00" end="23:45" step="00:15" />
          </el-form-item>
        </el-col>
      </el-row>


    </el-form>
  </v-dialog>
</template>

<style lang="scss" scoped></style>
