<script setup lang="ts">
import { addreportRes, addreport } from "@/api/materialData/personnelReporting";
import VDialog from "@/components/VDialog/VDialog.vue";
import { ElMessage, FormInstance, FormRules } from "element-plus";
import { computed, reactive, ref } from "vue";
import {
  materialFilesListRes,
  materialFilesList,
  materialFilesInfo
} from "@/api/materialData/materialFiles";
import ImgUpload from "@/components/ImgUpload/index.vue";

const formData = reactive<addreportRes>({
  code: "",
  materialsCode: "",
  reportType: "",
  reportNum: 1,
  materialsId: null,
  reportReason: "",
  paths: []
});

interface Props {
  type: "add";
  modelValue: boolean;
}
const rules: FormRules = {
  materialsId: [
    {
      required: true,
      message: "物料名称不能为空"
    }
  ],
  reportNum: [
    {
      required: true,
      message: "物料数量不能为空"
    }
  ],
  reportReason: [
    {
      required: true,
      message: "上报原因不能为空"
    }
  ],
  reportType: [
    {
      required: true,
      message: "上报类型不能为空"
    }
  ],
  paths: [
    {
      required: formData.reportType == "损坏" ? true : false,
      message: "上报图片不能为空"
    }
  ]
};

const form = ref<materialFilesListRes>({
  name: "",
  materialsType: "",
  pageSize: 10000,
  pageNum: 1
});
const dataList = ref([]);
const archiveListFun = async () => {
  const { data } = await materialFilesList(form.value);
  dataList.value = data.rows;
};

const props = defineProps<Props>();

const emits = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (e: "success"): void;
}>();

const loading = ref(false);

const formRef = ref<FormInstance>();

const visible = computed({
  get: () => props.modelValue,
  set(v) {
    emits("update:modelValue", v);
  }
});

async function handleConfirm() {
  try {
    loading.value = true;
    await addreport(formData);
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

function handleOpened() {
  Object.assign(formData);
  archiveListFun();
}

function cancelConfirm() {
  visible.value = false;
}

function handleClosed() {
  formRef.value?.resetFields();
  unit.value = "";
  code.value = "";
}

const unit = ref();
const code = ref();
const materialsCodeChange = value => {
  materialFilesInfo(value).then(res => {
    console.log(res);
    unit.value = res.data.unit;
    code.value = res.data.code;
  });
};
</script>

<template>
  <v-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    title="新增人员上报信息"
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
          <el-form-item label="物料名称：" prop="materialsId">
            <el-select
              v-model="formData.materialsId"
              filterable
              placeholder="请选择物料名称"
              @change="materialsCodeChange"
              style="width: 300px"
            >
              <el-option
                v-for="item in dataList"
                :key="item.materialsId"
                :label="`${item.name}--${item.code}`"
                :value="item.materialsId"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="物料编号：">
            <el-input
              v-model="code"
              placeholder="请输入物料编号"
              autocomplete="off"
              disabled
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="物料数量：" prop="reportNum">
            <el-input-number
              v-model="formData.reportNum"
              placeholder="请输入物料数量"
              :min="1"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="物料单位：">
            <el-input
              v-model="unit"
              placeholder="请输入物料单位"
              autocomplete="off"
              disabled
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="上报类型：" prop="reportType">
            <el-select
              v-model="formData.reportType"
              style="width: 300px"
              placeholder="请选择上报类型"
              clearable
            >
              <el-option label="丢失" value="丢失" />
              <el-option label="损坏" value="损坏" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="上报原因：" prop="reportReason">
        <el-input
          v-model="formData.reportReason"
          autocomplete="off"
          placeholder="请输入上报原因"
          style="width: 730px"
        />
      </el-form-item>
      <el-form-item
        label="上报图片："
        v-if="formData.reportType == '损坏'"
        label-width="100"
      >
        <ImgUpload :type="type" ref="CUplopadRef" v-model="formData.paths" />
      </el-form-item>
    </el-form>
  </v-dialog>
</template>

<style lang="scss" scoped></style>
