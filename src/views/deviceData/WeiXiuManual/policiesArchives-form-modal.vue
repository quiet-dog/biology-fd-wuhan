<script setup lang="ts">
import {
  addMaintenanceManualRes,
  addMaintenanceManual
} from "@/api/deviceData/WeiXiuManual";
import {
  equipmentList,
  equipmentInfo
} from "@/api/deviceData/equipmentProfile";
import VDialog from "@/components/VDialog/VDialog.vue";
import { ElMessage, FormInstance, FormRules } from "element-plus";
import { computed, reactive, ref } from "vue";
import CUplopad from "@/components/CUpload/index.vue";

interface Props {
  type: "add" | "update";
  modelValue: boolean;
}

const rules: FormRules = {
  equipmentId: [
    {
      required: true,
      message: "设备名称不能为空"
    }
  ],
  manualVersion: [
    {
      required: true,
      message: "手册版本不能为空"
    }
  ],
  manualFilePath: [
    {
      required: true,
      message: "维修手册不能为空"
    }
  ]
};

const props = defineProps<Props>();

const emits = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (e: "success"): void;
}>();

const loading = ref(false);

const manualFilePaths = ref([]);
const formRef = ref<FormInstance>();
const formData = reactive<addMaintenanceManualRes>({
  equipmentId: null,
  manualVersion: "",
  manualCode: "",
  isEnabled: false,
  manualFilePath: []
});
const equipmentType = ref<string>("");

const visible = computed({
  get: () => props.modelValue,
  set(v) {
    emits("update:modelValue", v);
  }
});

function handleConfirm() {
  formRef.value?.validate(async callback => {
    if (callback) {
      try {
        loading.value = true;
        await addMaintenanceManual(formData);
        ElMessage.success("提交成功");
        formRef.value?.resetFields();
        visible.value = false;
        emits("success");
      } catch (e) {
        ElMessage.error((e as Error)?.message || "提交失败");
      } finally {
        loading.value = false;
      }
    }
  });
}

const archiveinfo = ref({
  equipmentName: "",
  manufacturer: "",
  startPurchaseDate: undefined,
  endPurchaseDate: undefined,
  usageStatus: "",
  equipmentType: "",
  pageSize: 10000,
  pageNum: 1
});
const dataList = ref([]);
const archiveListFun = async () => {
  const { data } = await equipmentList(archiveinfo.value);
  dataList.value = data.rows;
};

const equipmentChange = async value => {
  const { data } = await equipmentInfo(value);
  equipmentType.value = data.equipmentType;
};

function handleOpened() {
  archiveListFun();
}

function cancelConfirm() {
  visible.value = false;
}
function handleClosed() {
  formRef.value?.resetFields();
  manualFilePaths.value = [];
  equipmentType.value = "";
}
</script>

<template>
  <v-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    title="新增维修手册"
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
          <el-form-item label="设备名称：" prop="equipmentId">
            <el-select
              placeholder="请选择设备名称"
              clearable
              v-model="formData.equipmentId"
              @change="equipmentChange"
              style="width: 300px"
            >
              <el-option
                v-for="item in dataList"
                :key="item.equipmentId"
                :label="`${item.equipmentName}-${item.equipmentCode}`"
                :value="item.equipmentId"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="设备型号：">
            <el-input
              v-model="equipmentType"
              placeholder="请输入设备型号"
              autocomplete="off"
              disabled
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="手册版本：" prop="manualVersion">
            <el-input
              v-model="formData.manualVersion"
              placeholder="请输入手册版本"
              autocomplete="off"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="维修手册：" prop="manualFilePath">
        <CUplopad
          :type="type"
          ref="CUplopadRef"
          v-model="formData.manualFilePath"
          :file-list="manualFilePaths"
        />
      </el-form-item>
    </el-form>
  </v-dialog>
</template>

<style lang="scss" scoped></style>
