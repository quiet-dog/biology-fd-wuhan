<script setup lang="ts">
import {
  addequipmentRepairRes,
  addEquipmentRepair
} from "@/api/deviceData/WeiXiuRecords";
import VDialog from "@/components/VDialog/VDialog.vue";
import { ElMessage, FormInstance, FormRules } from "element-plus";
import { computed, reactive, ref } from "vue";
import ImgUpload from "@/components/ImgUpload/index.vue";
import {
  equipmentList,
  equipmentInfo
} from "@/api/deviceData/equipmentProfile";

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
  repairDate: [
    {
      required: true,
      message: "维修日期不能为空"
    }
  ],
  faultReason: [
    {
      required: true,
      message: "故障原因分析不能为空"
    }
  ],
  repairContent: [
    {
      required: true,
      message: "维修内容不能为空"
    }
  ],
  repairPersonnel: [
    {
      required: true,
      message: "维修人员不能为空"
    }
  ],
  repairResult: [
    {
      required: true,
      message: "维修结果不能为空"
    }
  ],
  repairCost: [
    {
      required: true,
      message: "维修费用不能为空"
    }
  ],
  repairImagePath: [
    {
      required: true,
      message: "维修图片不能为空"
    }
  ]
};

const props = defineProps<Props>();

const emits = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (e: "success"): void;
}>();

const loading = ref(false);

const repairImagePath = ref([]);
const formRef = ref<FormInstance>();
const formData = reactive<addequipmentRepairRes>({
  equipmentId: null,
  repairCode: "",
  repairDate: "",
  repairContent: "",
  faultReason: "",
  repairPersonnel: "",
  repairCost: "",
  repairResult: "",
  repairImagePath: []
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
        await addEquipmentRepair(formData);
        ElMessage.success("提交成功");
        visible.value = false;
        formRef.value?.resetFields();
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
  pageSize: 10,
  pageNum: 1
});
const dataList = ref([]);
const loadArchiveListFun = () => {
  archiveinfo.value.pageNum += 1;
  archiveListFun();
};
const archiveListFun = async () => {
  const { data } = await equipmentList(archiveinfo.value);
  if(data.rows.length > 0) {
    dataList.value = [...dataList.value, ...data.rows];
  }
};

const equipmentCode = ref();
const equipmentChange = async val => {
  const { data } = await equipmentInfo(val);
  equipmentCode.value = data.equipmentCode;
};

function handleOpened() {
  archiveListFun();
}

function cancelConfirm() {
  visible.value = false;
}
function handleClosed() {
  formRef.value?.resetFields();
  repairImagePath.value = [];
  equipmentCode.value = "";
}
</script>

<template>
  <v-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    title="新增维修记录"
    v-model="visible"
    :loading="loading"
    @confirm="handleConfirm"
    @cancel="cancelConfirm"
    @closed="handleClosed"
    @opened="handleOpened"
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
            <div v-infinite-scroll="loadArchiveListFun">
              <el-option
                v-for="item in dataList"
                :key="item.equipmentId"
                :label="`${item.equipmentName}-${item.equipmentCode}`"
                :value="item.equipmentId"
              />
            </div>

            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="设备编号：">
            <el-input
              v-model="equipmentCode"
              placeholder="请选择设备名称"
              readonly
              autocomplete="off"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="维修日期：" prop="repairDate">
            <el-date-picker
              v-model="formData.repairDate"
              value-format="YYYY-MM-DD hh:mm:ss"
              type="date"
              style="width: 300px"
              placeholder="请选择维修日期"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="维修人员：" prop="repairPersonnel">
            <el-input
              v-model="formData.repairPersonnel"
              placeholder="请输入维修人员"
              autocomplete="off"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="故障原因分析：" prop="faultReason">
        <el-input
          :rows="2"
          type="textarea"
          v-model="formData.faultReason"
          placeholder="请输入故障原因分析"
          autocomplete="off"
          style="width: 760px"
        />
      </el-form-item>
      <el-form-item label="维修内容：" prop="repairContent">
        <el-input
          :rows="2"
          type="textarea"
          v-model="formData.repairContent"
          placeholder="请输入维修内容"
          autocomplete="off"
          style="width: 760px"
        />
      </el-form-item>
      <el-row>
        <el-col :span="12">
          <el-form-item label="维修结果：" prop="repairResult">
            <el-input
              v-model="formData.repairResult"
              placeholder="请输入维修结果"
              autocomplete="off"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="维修费用：" prop="repairCost">
            <el-input
              v-model="formData.repairCost"
              placeholder="请输入维修费用"
              autocomplete="off"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="维修图片：" prop="repairImagePath">
        <ImgUpload
          :type="type"
          ref="CUplopadRef"
          v-model="formData.repairImagePath"
          :file-list="repairImagePath"
        />
      </el-form-item>
    </el-form>
  </v-dialog>
</template>

<style lang="scss" scoped></style>
