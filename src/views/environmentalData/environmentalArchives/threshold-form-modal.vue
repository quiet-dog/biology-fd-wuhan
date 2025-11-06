<script setup lang="ts">
import {
  editenvironmentalRes,
  editenvironmental
} from "@/api/environmentalData/environmentalArchives";
import VDialog from "@/components/VDialog/VDialog.vue";
import { ElMessage, FormInstance, FormRules } from "element-plus";
import { computed, reactive, ref } from "vue";

interface Props {
  modelValue: boolean;
  row;
}

const rules: FormRules = {
  "values.*.level": [
    { required: true, message: "报警级别不能为空", trigger: "blur" }
  ],
  "values.*.scondition": [
    { required: true, message: "请选择阈值条件", trigger: "change" }
  ],
  "values.*.value": [
    { required: true, message: "指标数值不能为空", trigger: "blur" }
  ]
};

const props = defineProps<Props>();

const emits = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (e: "success"): void;
}>();

const loading = ref(false);

const formRef = ref<FormInstance>();
const formData = reactive<editenvironmentalRes>({
  environmentId: 0,
  description: "",
  tag: "",
  type: "",
  scope: "",
  signal: "",
  supplier: "",
  model: "",
  unit: "",
  plcAddress: "",
  unitName: "",
  emergencyIds: [],
  sopIds: [],
  alarmLevels: [
    {
      level: "",
      min: null,
      max: null
    }
  ]
});

const num = ref(1);
const handleChange = (value: number) => {
  const currentLength = formData.alarmLevels.length;
  if (value > currentLength) {
    // 如果输入值大于当前 list 长度，则增加新条目
    for (let i = currentLength; i < value; i++) {
      formData.alarmLevels.push({
        level: "", // 默认报警级别
        min: null, // 默认开始区间
        max: null // 默认结束区间
      });
    }
  } else if (value < currentLength) {
    // 如果输入值小于当前 list 长度，则减少条目
    formData.alarmLevels.splice(value, currentLength - value);
  }
};

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
        await editenvironmental({
          ...formData,
          alarmLevels: formData.alarmLevels.map(item => {
            return {
              ...item,
              min: Number(item.min),
              max: Number(item.max)
            };
          })
        });
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
    const {
      description,
      tag,
      type,
      scope,
      signal,
      supplier,
      model,
      unit,
      plcAddress,
      unitName,
      environmentId,
      alarmlevels,
      emergencies,
      sops
    } = props.row;
    Object.assign(formData, {
      description,
      tag,
      type,
      scope,
      signal,
      supplier,
      model,
      unit,
      plcAddress,
      unitName,
      environmentId,
      emergencyIds: emergencies.map(item => item.emergencyId),
      sopIds: sops.map(item => item.sopId),
      alarmLevels:
        alarmlevels.length == 0
          ? [
              {
                level: "",
                min: null,
                max: null
              }
            ]
          : alarmlevels
    });
    num.value = Array.isArray(alarmlevels) ? alarmlevels.length : 1
  }
}

function cancelConfirm() {
  visible.value = false;
  formRef.value?.resetFields();
}

defineExpose({
  handleOpened
});

// 添加报警级别选项常量
const alarmLevelOptions = [
  { label: "轻微", value: "轻微" },
  { label: "一般", value: "一般" },
  { label: "中度", value: "中度" },
  { label: "重要", value: "重要" },
  { label: "紧急", value: "紧急" }
];
</script>

<template>
  <v-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    title="阈值设置"
    v-model="visible"
    :loading="loading"
    style="width: 900px"
    @confirm="handleConfirm"
    @cancel="cancelConfirm"
    @opened="handleOpened"
  >
    <el-form :model="formData" label-width="120px" :rules="rules" ref="formRef">
      <el-form-item label="级别层级：">
        <el-input-number
          v-model="num"
          :min="1"
          :max="5"
          @change="handleChange"
        />
      </el-form-item>
      <el-row v-for="(item, index) in formData.alarmLevels" :key="index">
        <el-col :span="12">
          <el-form-item label="报警级别：">
            <el-select
              v-model="item.level"
              placeholder="请选择报警级别"
              style="width: 300px"
            >
              <el-option
                v-for="option in alarmLevelOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="指标区间：">
            <div
              style="
                width: 300px;
                display: flex;
                justify-content: space-between;
                align-items: center;
              "
            >
              <el-input
                v-model="item.min"
                placeholder="开始区间"
                autocomplete="off"
                style="width: 130px"
              />
              <span>至</span>
              <el-input
                v-model="item.max"
                placeholder="结束区间"
                autocomplete="off"
                style="width: 130px"
              />
            </div>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </v-dialog>
</template>

<style lang="scss" scoped></style>
