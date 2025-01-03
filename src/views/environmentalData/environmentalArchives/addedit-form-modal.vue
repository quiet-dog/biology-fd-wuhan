<script setup lang="ts">
import VDialog from "@/components/VDialog/VDialog.vue";
import { ElMessage, FormInstance, FormRules } from "element-plus";
import { computed, reactive, ref } from "vue";
import {
  addenvironmentalRes,
  addenvironmental
} from "@/api/environmentalData/environmentalArchives";
import { sopListRes, sopList } from "@/api/emergencyDispatch/SOPManual";
import {
  emergencyListRes,
  emergencyList
} from "@/api/emergencyDispatch/emergencyPlan";

interface Props {
  type: "add" | "update";
  modelValue: boolean;
}

const rules: FormRules = {
  description: [
    {
      required: true,
      message: "监测点位不能为空"
    }
  ],
  tag: [
    {
      required: true,
      message: "位号不能为空"
    }
  ],
  type: [
    {
      required: true,
      message: "类型不能为空"
    }
  ],
  scope: [
    {
      required: true,
      message: "范围不能为空"
    }
  ],
  esignal: [
    {
      required: true,
      message: "信号不能为空"
    }
  ],
  supplier: [
    {
      required: true,
      message: "设备仪表供应商不能为空"
    }
  ],
  model: [
    {
      required: true,
      message: "设备仪表型号不能为空"
    }
  ],
  unit: [
    {
      required: true,
      message: "单位不能为空"
    }
  ],
  plcAddress: [
    {
      required: true,
      message: "PLC地址不能为空"
    }
  ],
  unitName: [
    {
      required: true,
      message: "环境指标不能为空"
    }
  ],
  emergencyIds: [
    {
      required: true,
      message: "应急预案不能为空"
    }
  ],
  sopIds: [
    {
      required: true,
      message: "SOP不能为空"
    }
  ],
  earea: [
    {
      required: true,
      message: "区域不能为空"
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
const formData = reactive<addenvironmentalRes>({
  description: "",
  tag: "",
  type: "",
  scope: "",
  esignal: "",
  supplier: "",
  model: "",
  unit: "",
  plcAddress: "",
  unitName: "",
  earea: "",
  emergencyIds: [],
  sopIds: [],
  alarmLevels: []
});

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
        await addenvironmental(formData);
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

//应急预案列表
const emergencylist = ref([]);
const emergencyinfo = ref<emergencyListRes>({
  riskType: "",
  title: "",
  pageSize: 10000,
  pageNum: 1
});
const emergencyListFun = async () => {
  const { data } = await emergencyList(emergencyinfo.value);
  emergencylist.value = data.rows;
};

//SOP列表
const soplist = ref([]);
const sopinfo = ref<sopListRes>({
  name: "",
  scope: "",
  pageSize: 10000,
  pageNum: 1
});
const sopListFun = async () => {
  const { data } = await sopList(sopinfo.value);
  soplist.value = data.rows;
};

function handleOpened() {
  emergencyListFun();
  sopListFun();
}

function cancelConfirm() {
  visible.value = false;
}
function handleClosed() {
  formRef.value?.resetFields();
}
</script>

<template>
  <v-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    :title="type === 'add' ? '新增环境档案' : '编辑环境档案'"
    v-model="visible"
    :loading="loading"
    @confirm="handleConfirm"
    @cancel="cancelConfirm"
    @opened="handleOpened"
    @closed="handleClosed"
  >
    <el-form :model="formData" label-width="150px" :rules="rules" ref="formRef">
      <el-row>
        <el-col :span="12">
          <el-form-item label="监测点位：" prop="description">
            <el-input
              v-model="formData.description"
              placeholder="请输入监测点位"
              autocomplete="off"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="环境指标：" prop="unitName">
            <el-select
              v-model="formData.unitName"
              filterable
              placeholder="请选择环境指标"
              style="width: 300px"
            >
              <el-option label="温度" value="温度" />
              <el-option label="湿度" value="湿度" />
              <el-option label="压差" value="压差" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="位号：" prop="tag">
            <el-input
              v-model="formData.tag"
              autocomplete="off"
              placeholder="请输入位号"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="类型：" prop="type">
            <el-input
              v-model="formData.type"
              placeholder="请输入类型"
              autocomplete="off"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="范围：" prop="scope">
            <el-input
              v-model="formData.scope"
              placeholder="请输入范围"
              autocomplete="off"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="信号：" prop="esignal">
            <el-input
              v-model="formData.esignal"
              placeholder="请输入信号"
              autocomplete="off"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="设备仪表供应商：" prop="supplier">
            <el-input
              v-model="formData.supplier"
              placeholder="请输入设备仪表供应商"
              autocomplete="off"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="设备仪表型号：" prop="model">
            <el-input
              v-model="formData.model"
              placeholder="请输入设备仪表型号"
              autocomplete="off"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="区域：" prop="earea">
        <el-select
          v-model="formData.earea"
          filterable
          placeholder="请选择区域"
          style="width: 300px"
        >
          <el-option label="控制区" value="控制区" />
          <el-option
            label="高风险安全风险车间防护区"
            value="高风险安全风险车间防护区"
          />
          <el-option label="UDAF区" value="UDAF区" />
          <el-option label="C级区" value="C级区" />
          <el-option label="D级区" value="D级区" />
          <el-option label="CNC区" value="CNC区" />
          <el-option label="NC区" value="NC区" />
          <el-option label="有毒区" value="有毒区" />
        </el-select>
      </el-form-item>
      <el-form-item label="应急预案：" prop="emergencyIds">
        <el-select
          v-model="formData.emergencyIds"
          filterable
          multiple
          placeholder="请选择应急预案"
          style="width: 300px"
        >
          <el-option
            v-for="item in emergencylist"
            :key="item.emergencyId"
            :label="item.title"
            :value="item.emergencyId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="SOP手册：" prop="sopIds">
        <el-select
          v-model="formData.sopIds"
          multiple
          filterable
          placeholder="请选择SOP手册"
          style="width: 300px"
        >
          <el-option
            v-for="item in soplist"
            :key="item.sopId"
            :label="item.name"
            :value="item.sopId"
          />
        </el-select>
      </el-form-item>
    </el-form>
  </v-dialog>
</template>

<style lang="scss" scoped></style>
