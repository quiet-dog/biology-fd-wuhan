<script lang='ts' setup>
import { addXwDevice } from '@/api/xwDevice';
import { AddXwDeviceReq, XwDeviceRow } from '@/api/xwDevice/types';
import { ElMessage, FormRules } from 'element-plus';
import { computed, reactive, ref } from 'vue';
import VDialog from "@/components/VDialog/VDialog.vue";
import { personnelList } from '@/api/personnelData/personnelProfile';

interface Props {
  type: "add" | "edit";
  modelValue: boolean;
  row: XwDeviceRow
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
  cameraId: [
    {
      required: true,
      message: "摄像头ID不能为空"
    }
  ],
  name: [
    {
      required: true,
      message: "设备名称不能为空"
    }
  ],
  seatNumber: [
    {
      required: true,
      message: "机位号不能为空"
    }
  ],
  content: [
    {
      required: true,
      message: "机位对应内容不能为空"
    }
  ]
};

const formData = reactive<AddXwDeviceReq>({
  name: "",
  cameraId: "",
  content: "",
  seatNumber:""
});

const personnelParams = ref({
  total: 0,
  pageSize: 10,
  page: 1
})

const personnelSelect = ref([])
const personnelInfo = ref({})

async function handleConfirm() {
  try {
    loading.value = true;
    await addXwDevice(formData);
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

function handleClosed() {
  formRef.value?.resetFields();
  personnelParams.value.page = 1;
  personnelParams.value.pageSize = 10;
  personnelParams.value.total = 0;
}

function changePersonnel(item) {
  personnelInfo.value = item
}

</script>

<template>
  <v-dialog show-full-screen :fixed-body-height="false" use-body-scrolling :title="type == 'add' ? '添加生命设备' : '更新生命设备'"
    v-model="visible" :loading="loading" @confirm="handleConfirm" @cancel="cancelConfirm" @opened="handleOpened"
    @closed="handleClosed">
    <el-form :model="formData" label-width="100px" :rules="rules" ref="formRef">
      <el-row>
        <el-col :span="12">
          <el-form-item label="摄像头ID：" prop="cameraId">
            <el-input v-model="formData.cameraId" filterable placeholder="请输入摄像头ID" style="width: 300px" />

          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="设备名称：" prop="name">
            <el-input v-model="formData.name" placeholder="请输入设备名称" style="width: 300px" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="机位号：" prop="seatNumber">
            <!-- <el-input-number v-model="formData.reportNum" placeholder="请输入物料数量" :min="1" style="width: 300px" /> -->
            <el-input v-model="formData.seatNumber" placeholder="请输入机位号" style="width: 300px" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="对应内容：" prop="content">
            <el-input v-model="formData.content" placeholder="请输入机位对应内容" style="width: 300px"/>
          </el-form-item>
        </el-col>
      </el-row>
   
    </el-form>
  </v-dialog>
</template>

<style scoped></style>
