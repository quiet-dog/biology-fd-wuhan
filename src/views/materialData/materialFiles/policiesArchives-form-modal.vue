<script setup lang="ts">
import {
  renewmaterialFilesRes,
  renewmaterialFiles
} from "@/api/materialData/materialFiles";
import VDialog from "@/components/VDialog/VDialog.vue";
import { ElMessage, FormInstance, FormRules } from "element-plus";
import { computed, reactive, ref } from "vue";

interface Props {
  modelValue: boolean;
  row?: renewmaterialFilesRes;
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
const formData = reactive<renewmaterialFilesRes>({
  materialsId: 0,
  name: "",
  code: "",
  stock: 0,
  unit: "",
  type: "",
  specification: "",
  values: [
    {
      materialsValueId: 0,
      materialsId: 0,
      level: "",
      value: 0,
      scondition: ""
    }
  ]
});

const listLight = ref(1);

const handleChange = (value: number) => {
  console.log(value);
  const currentLength = formData.values.length;
  // console.log(currentLength);
  if (value > currentLength) {
    // 如果输入值大于当前 list 长度，则增加新条目
    for (let i = currentLength; i < value; i++) {
      formData.values.push({
        materialsValueId: 0,
        materialsId: formData.materialsId,
        level: "",
        value: 0,
        scondition: ""
      });
    }
  } else if (value < currentLength) {
    // 如果输入值小于当前 list 长度，则减少条目
    formData.values.splice(value, currentLength - value);
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
        await renewmaterialFiles(formData as renewmaterialFilesRes);
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
    listLight.value =
      props.row.values.length == 0 ? 1 : props.row.values.length;
    Object.assign(formData, {
      ...props.row,
      values:
        props.row.values.length == 0
          ? [
              {
                materialsValueId: undefined,
                level: "",
                value: 1,
                scondition: "",
                materialsId: props.row.materialsId
              }
            ]
          : props.row.values
    });
  }
}

function cancelConfirm() {
  visible.value = false;
  formRef.value?.resetFields();
}

defineExpose({
  handleOpened
});
</script>

<template>
  <v-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    title="阈值设置"
    v-model="visible"
    :loading="loading"
    @confirm="handleConfirm"
    @cancel="cancelConfirm"
    @opened="handleOpened"
  >
    <el-form :model="formData" label-width="120px" :rules="rules" ref="formRef">
      <el-form-item label="级别层级：">
        <el-input-number
          v-model="listLight"
          :min="1"
          :max="5"
          @change="handleChange"
        />
      </el-form-item>
      <el-row v-for="(item, index) in formData.values" :key="index">
        <el-col :span="12">
          <el-form-item label="报警级别：">
            <el-select
              v-model="item.level"
              placeholder="请选择报警级别"
              style="width: 300px"
            >
              <el-option label="轻微" value="轻微" />
              <el-option label="一般" value="一般" />
              <el-option label="中度" value="中度" />
              <el-option label="重要" value="重要" />
              <el-option label="紧急" value="紧急" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="阈值条件：">
            <el-select
              v-model="item.scondition"
              placeholder="请选择阈值条件"
              style="width: 300px"
            >
              <el-option label="大于" value="大于" />
              <el-option label="小于" value="小于" />
              <el-option label="大于等于" value="大于等于" />
              <el-option label="小于等于" value="小于等于" />
              <el-option label="等于" value="等于" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="指标数值：">
            <el-input-number
              v-model="item.value"
              placeholder="请输入报警数值"
              :min="1"
              autocomplete="off"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </v-dialog>
</template>

<style lang="scss" scoped></style>
