<script lang="ts" setup>
import { addJianCeDevice, editJianCeDevice } from "@/api/jianCeDevice";
import { AddJianCeDeviceReq, JianCeDeviceRow } from "@/api/jianCeDevice/types";
import { ElMessage, FormRules } from "element-plus";
import { computed, reactive, ref } from "vue";
import VDialog from "@/components/VDialog/VDialog.vue";
import { personnelList } from "@/api/personnelData/personnelProfile";

interface Props {
  type: "add" | "edit";
  modelValue: boolean;
  row: JianCeDeviceRow;
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

const formData = reactive<AddJianCeDeviceReq>({
  name: "",
  area: "",
  deviceSn: ""
});

const personnelParams = ref({
  total: 0,
  pageSize: 10,
  page: 1
});

async function handleConfirm() {
  try {
    loading.value = true;
    if (isEdit.value) {
      await editJianCeDevice(formData);
    } else {
      await addJianCeDevice(formData);
    }
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

const isEdit = ref(false);
function handleOpened() {
  if (props.row) {
    isEdit.value = true;
    Object.assign(formData, props.row);
  }
}

function handleClosed() {
  formRef.value?.resetFields();
  isEdit.value = false;
  formData.name = "";
  personnelParams.value.page = 1;
  personnelParams.value.pageSize = 10;
  personnelParams.value.total = 0;
}
</script>

<template>
  <v-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    :title="type == 'add' ? '添加监测设备' : '编辑监测设备'"
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
              filterable
              placeholder="请输入设备编号"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="设备名称：" prop="name">
            <el-input
              v-model="formData.name"
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
              v-model="formData.area"
              placeholder="请输入所属区域"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </v-dialog>
</template>

<style scoped></style>
