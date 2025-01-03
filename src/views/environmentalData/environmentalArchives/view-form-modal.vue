<template>
  <v-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    title="环境档案详情"
    v-model="visible"
    :is-show-confirm="false"
    @cancel="cancelView"
    @opened="handleOpened"
  >
    <el-form :model="formData" label-width="150px" ref="formRef">
      <el-row>
        <el-col :span="12">
          <el-form-item label="监测点位：">
            <el-input v-model="formData.description" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="环境指标：">
            <el-input v-model="formData.unitName" readonly />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="位号：">
            <el-input v-model="formData.tag" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="类型：">
            <el-input v-model="formData.type" readonly />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="范围：">
            <el-input v-model="formData.scope" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="信号：">
            <el-input v-model="formData.esignal" readonly />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="设备仪表供应商：">
            <el-input v-model="formData.supplier" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="设备仪表型号：">
            <el-input v-model="formData.model" readonly />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="区域：">
        <el-input v-model="formData.earea" readonly />
      </el-form-item>
      <el-form-item label="应急预案：">
        <el-select
          v-model="formData.emergencyIds"
          multiple
          disabled
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
      <el-form-item label="SOP手册：">
        <el-select
          v-model="formData.sopIds"
          multiple
          disabled
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

<script setup lang="ts">
import VDialog from "@/components/VDialog/VDialog.vue";
import { computed, reactive, ref } from "vue";
import { sopListRes, sopList } from "@/api/emergencyDispatch/SOPManual";
import {
  emergencyListRes,
  emergencyList
} from "@/api/emergencyDispatch/emergencyPlan";
import { addenvironmentalRes } from "@/api/environmentalData/environmentalArchives";

interface Props {
  modelValue: boolean;
  row: any;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: v => emit("update:modelValue", v)
});

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
} as const);

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
  if (props.row) {
    const {
      description,
      tag,
      type,
      scope,
      esignal,
      supplier,
      model,
      earea,
      unitName,
      emergencyIds,
      sopIds
    } = props.row;
    Object.assign(formData, {
      description,
      tag,
      type,
      scope,
      esignal,
      supplier,
      model,
      earea,
      unitName,
      emergencyIds,
      sopIds
    });
  }
  
  emergencyListFun();
  sopListFun();
}

function cancelView() {
  visible.value = false;
}

defineExpose({
  handleOpened
});
</script>

<style lang="scss" scoped></style>
