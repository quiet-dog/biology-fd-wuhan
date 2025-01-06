<script lang='ts' setup>
import VDialog from "@/components/VDialog/VDialog.vue";
import { addMaterials, AddMaterials, addreceiveRes } from '@/api/materialData/receiptRecord';
import { ElMessage, FormRules } from 'element-plus';
import { computed } from 'vue';
import { reactive, ref } from 'vue';

const loading = ref(false);
const formData = reactive<AddMaterials>({
  name: "",
  code: "",
  type: "",
  tag: "",
  stock: 0,
  lastStock: 0,
  unit: "",
  specification: "",
  batch: "",
});
interface Props {
  type: "add";
  modelValue: boolean;
}
const props = defineProps<Props>();
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
  name: [
    {
      required: true,
      message: "物料名称不能为空"
    }
  ],
  code: [
    {
      required: true,
      message: "物料编号不能为空"
    }
  ],
  type: [
    {
      required: true,
      message: "物料类型不能为空"
    }
  ],
  tag: [
    {
      required: true,
      message: "物料标签不能为空"
    }
  ],
  stock: [
    {
      required: true,
      message: "库存不能为空"
    }
  ],
  lastStock: [
    {
      required: true,
      message: "当前入库量不能为空"
    }
  ],
  unit: [
    {
      required: true,
      message: "物料单位不能为空"
    }
  ],
  specification: [
    {
      required: true,
      message: "物料规格不能为空"
    }
  ],
  batch: [
    {
      required: true,
      message: "批次不能为空"
    }
  ]
}
const formRef = ref();
async function handleConfirm() {
  try {
    loading.value = true;
    await addMaterials(formData);
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
  Object.assign(formData);
  // archiveListFun();
  // archiveListFun2();
}

function handleClosed() {
  formRef.value?.resetFields();
  // unit.value = "";
  // code.value = "";
  // department.value = "";
  // personnelId.value = "";
}
</script>

<template>
  <v-dialog show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    title="新增物料档案"
    v-model="visible"
    :loading="loading"
    @confirm="handleConfirm"
    @cancel="cancelConfirm"
    @opened="handleOpened"
    @closed="handleClosed">
    <el-form :model="formData" label-width="130px" :rules="rules" ref="formRef">
      <el-row >
        <el-col :span="12">
          <el-form-item label="物料名称" prop="name">
            <el-input v-model="formData.name" clearable placeholder="请输入物料名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="物料编号" prop="code">
            <el-input v-model="formData.code" clearable placeholder="请输入物料编号" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="物料类型" prop="type">
            <!-- <el-input v-model="formData.type" clearable placeholder="请输入物料类型" /> -->
             <el-select v-model="formData.type" clearable placeholder="请选择物料类型">
              <el-option label="原材料" value="原材料" />
              <el-option label="半成品" value="半成品" />
              <el-option label="成品" value="成品" />
              </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="物料标签" prop="tag">
            <el-input v-model="formData.tag" clearable placeholder="请输入物料标签" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="库存" prop="stock">
              <el-input-number v-model="formData.stock" :precision="2" :step="0.1"  />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="物料单位" prop="lastStock">
            <el-input v-model="formData.unit" clearable placeholder="请输入物料单位" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="物料规格" prop="specification">
            <el-input v-model="formData.specification" clearable placeholder="请输入物料规格" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="批次" prop="batch">
            <el-input v-model="formData.batch" clearable placeholder="请输入批次" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </v-dialog>
</template>

<style scoped></style>
