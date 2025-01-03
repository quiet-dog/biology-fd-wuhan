<script setup lang="ts">
import {
  addInspectionRes,
  addInspection
} from "@/api/deviceData/JianXiuRecords";
import VDialog from "@/components/VDialog/VDialog.vue";
import { ElMessage, FormInstance, FormRules } from "element-plus";
import { computed, reactive, ref } from "vue";
import ImgUpload from "@/components/ImgUpload/index.vue";
import CUplopad from "@/components/CUpload/index.vue";
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
      message: "设备编号不能为空"
    }
  ],
  inspectionDate: [
    {
      required: true,
      message: "检修日期不能为空"
    }
  ],
  inspectionContent: [
    {
      required: true,
      message: "检修内容不能为空"
    }
  ],
  inspector: [
    {
      required: true,
      message: "检修人员不能为空"
    }
  ],
  inspectionImagePath: [
    {
      required: true,
      message: "检修图片不能为空"
    }
  ],
  inspectionReportPath: [
    {
      required: true,
      message: "检修报告不能为空"
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
const inspectionImagePaths = ref([]);
const inspectionReportPaths = ref([]);
const formData = reactive<addInspectionRes>({
  equipmentId: null,
  inspectionCode: "",
  inspectionDate: "",
  inspectionContent: "",
  inspector: "",
  faultReason: "",
  inspectionImagePath: [],
  inspectionReportPath: []
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
        await addInspection(formData);
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
  pageSize: 10000,
  pageNum: 1
});
const dataList = ref([]);
const archiveListFun = async () => {
  const { data } = await equipmentList(archiveinfo.value);
  dataList.value = data.rows;
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
  equipmentCode.value = "";
  inspectionImagePaths.value = [];
  inspectionReportPaths.value = [];
}
</script>

<template>
  <v-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    title="新增检修记录"
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
              placeholder="请输入设备名称"
              clearable
              @change="equipmentChange"
              v-model="formData.equipmentId"
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
          <el-form-item label="设备编号：">
            <el-input
              v-model="equipmentCode"
              placeholder="请选择设备名称"
              autocomplete="off"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="检修人员：" prop="inspector">
            <el-input
              v-model="formData.inspector"
              placeholder="请输入检修人员"
              autocomplete="off"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="检修日期：" prop="inspectionDate">
            <el-date-picker
              v-model="formData.inspectionDate"
              value-format="YYYY-MM-DD hh:mm:ss"
              type="date"
              style="width: 300px"
              placeholder="请选择检修日期"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="检修内容：" prop="inspectionContent">
        <el-input
          :rows="2"
          type="textarea"
          v-model="formData.inspectionContent"
          placeholder="请输入检修内容"
          autocomplete="off"
          style="width: 760px"
        />
      </el-form-item>
      <el-form-item label="检修图片：" prop="inspectionImagePath">
        <ImgUpload
          :type="type"
          ref="CUplopadRef"
          v-model="formData.inspectionImagePath"
          :file-list="inspectionImagePaths"
        />
      </el-form-item>
      <el-form-item label="检修报告：" prop="inspectionReportPath">
        <CUplopad
          :type="type"
          ref="CUplopadRef"
          v-model="formData.inspectionReportPath"
          :file-list="inspectionReportPaths"
        />
      </el-form-item>
    </el-form>
  </v-dialog>
</template>

<style lang="scss" scoped></style>
