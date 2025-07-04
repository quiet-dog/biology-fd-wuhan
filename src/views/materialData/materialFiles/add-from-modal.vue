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
  model: "",
  supplier: "",
  color: "#000000",
  colorDescription: "",
  // total: 0
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
  // total: [
  //   {
  //     required: true,
  //     message: "可容纳数量不能为空"
  //   }
  // ],
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
      message: "标签名称不能为空"
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
  ],
  model: [
    {
      required: true,
      message: "物料型号不能为空"
    }
  ],
  supplier: [
    {
      required: true,
      message: "供应商不能为空"
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
      <!-- <el-row>
        <el-col :span="12">
          <el-form-item label="可容纳数量" prop="total">
            <el-input v-model="formData.total" clearable placeholder="请输入可容纳数量" />
          </el-form-item>
        </el-col>
      </el-row> -->
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
            <el-input v-model="formData.type" clearable placeholder="请输入物料类型" />
             <!-- <el-select v-model="formData.type" clearable placeholder="请选择物料类型">
              <el-option label="原材料" value="原材料" />
              <el-option label="半成品" value="半成品" />
              <el-option label="成品" value="成品" />
              </el-select> -->
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="标签名称" prop="tag">
            <el-input v-model="formData.tag" clearable placeholder="请输入标签名称">
              <template #append>
                <el-color-picker v-model="formData.color" />
              </template>
            </el-input>
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
          <el-form-item label="型号" prop="model">
            <el-input v-model="formData.model" clearable placeholder="请输入物料型号" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="供应商" prop="supplier">
            <el-input v-model="formData.supplier" clearable placeholder="请输入物料供应商" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="标签描述" prop="colorDescription">
            <el-input v-model="formData.colorDescription" clearable placeholder="请输入标签描述" />
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
