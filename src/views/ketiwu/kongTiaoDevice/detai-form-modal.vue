<script lang="ts" setup>
import { addKongTiaoDevice } from "@/api/kongTiaoDevice";
import {
  AddKongTiaoDeviceReq,
  KongTiaoDeviceRow
} from "@/api/kongTiaoDevice/types";
import { ElMessage, FormRules } from "element-plus";
import { computed, reactive, ref } from "vue";
import VDialog from "@/components/VDialog/VDialog.vue";
// import {
//   personnelInfo,
//   personnelList
// } from "@/api/personnelData/personnelProfile";

interface Props {
  modelValue: boolean;
  row: KongTiaoDeviceRow;
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

const rules: FormRules = {
  deviceSn: [
    {
      required: true,
      message: "设备编号不能为空"
    }
  ],
  name: [
    {
      required: true,
      message: "设备名称不能为空"
    }
  ],
  area: [
    {
      required: true,
      message: "区域不能为空"
    }
  ]
};

const formData = reactive<AddKongTiaoDeviceReq>({
  name: "",
  area: "",
  deviceSn: ""
});

async function handleConfirm() {
  try {
    loading.value = true;
    await addKongTiaoDevice(formData);
    ElMessage.success("提交成功");
    visible.value = false;
    emits("success");
  } catch (e) {
    console.error(e);
    ElMessage.error((e as Error)?.message || "提交失败");
  } finally {
    loading.value = false;
  }
}

function cancelConfirm() {
  visible.value = false;
}

function handleOpened() {
  if (props.row) {
    Object.assign(formData, props.row);
  }
}

function handleClosed() {}

function changePersonnel(item) {}
</script>

<template>
  <v-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    title="查看节能系统"
    v-model="visible"
    :loading="loading"
    @confirm="handleConfirm"
    @cancel="cancelConfirm"
    @opened="handleOpened"
    @closed="handleClosed"
  >
    <el-form :model="formData" label-width="100px" :rules="rules" ref="formRef">
      <el-row>
        <el-col :span="12">
          <el-form-item label="设备SN号：" prop="deviceSn">
            <el-input
              v-model="formData.deviceSn"
              disabled
              filterable
              placeholder="请输入设备SN号"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="设备名称：">
            <el-input
              v-model="formData.name"
              disabled
              placeholder="请输入设备名称"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="所属区域：" prop="area">
            <el-input
              disabled
              v-model="formData.area"
              placeholder="请输入所属区域"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="设备类型：">
            <el-select
              v-model="formData.deviceType"
              placeholder="请选择设备类型"
              style="width: 300px"
            >
              <el-option label="空调" value="空调" />
              <el-option label="回风机" value="回风机" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </v-dialog>
</template>

<style scoped></style>
