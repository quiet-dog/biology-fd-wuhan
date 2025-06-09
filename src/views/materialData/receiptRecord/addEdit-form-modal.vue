<script setup lang="ts">
import { addreceiveRes, addreceive } from "@/api/materialData/receiptRecord";
import VDialog from "@/components/VDialog/VDialog.vue";
import { ElMessage, FormInstance, FormRules } from "element-plus";
import { computed, reactive, ref } from "vue";
import {
  materialFilesListRes,
  materialFilesList,
  materialFilesInfo
} from "@/api/materialData/materialFiles";
import {
  personnelList,
  personnelInfo
} from "@/api/personnelData/personnelProfile";

const formData = reactive<addreceiveRes>({
  receiveUserId: null,
  materialsId: null,
  receiveNum: 1,
  receiveExplain: ""
});

interface Props {
  type: "add";
  modelValue: boolean;
}
const rules: FormRules = {
  receiveUserId: [
    {
      required: true,
      message: "领用人姓名不能为空"
    }
  ],
  materialsId: [
    {
      required: true,
      message: "物料名称不能为空"
    }
  ],
  receiveNum: [
    {
      required: true,
      message: "上报原因不能为空"
    }
  ],
  receiveExplain: [
    {
      required: true,
      message: "用途说明不能为空"
    }
  ]
};

const form = ref<materialFilesListRes>({
  name: "",
  materialsType: "",
  pageSize: 10,
  pageNum: 1
});
const dataList = ref([]);
const loadArchiveListFun = () => {
  form.value.pageNum++;
  archiveListFun();
}
const archiveListFun = async () => {
  const { data } = await materialFilesList(form.value);
  if (data.rows.length > 0) {
    dataList.value = [...dataList.value, ...data.rows];
  }
};

const form2 = ref({
  name: "",
  department: "",
  post: "",
  education: "",
  contact: "",
  pageSize: 10,
  pageNum: 1
});
const dataList2 = ref([]);
const loadArchiveListFun2 = () => {
  form2.value.pageNum++;
  archiveListFun2();
}
const archiveListFun2 = async () => {
  const { data } = await personnelList(form2.value);
  if (data.rows.length > 0) {
    dataList2.value = [...dataList2.value, ...data.rows];
  }
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
    await addreceive(formData);
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
  ElMessage.warning("物料先进先出");
  archiveListFun();
  archiveListFun2();
}

function cancelConfirm() {
  visible.value = false;
}

function handleClosed() {
  formRef.value?.resetFields();
  unit.value = "";
  code.value = "";
  department.value = "";
  personnelId.value = "";
}

const unit = ref();
const code = ref();
const materialsCodeChange = value => {
  materialFilesInfo(value).then(res => {
    unit.value = res.data.unit;
    code.value = res.data.code;
  });
};

const department = ref();
const personnelId = ref<string>("");
const personnelCode = ref("");
const receiveChange = value => {
  personnelInfo(value).then(res => {
    department.value = res.data.department;
    personnelId.value = res.data.personnelId;
    personnelCode.value = res.data.code;
  });
};
</script>

<template>
  <v-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    title="新增领用记录"
    v-model="visible"
    :loading="loading"
    @confirm="handleConfirm"
    @cancel="cancelConfirm"
    @opened="handleOpened"
    @closed="handleClosed"
  >
    <el-form :model="formData" label-width="130px" :rules="rules" ref="formRef">
      <el-row>
        <el-col :span="12">
          <el-form-item label="领用人姓名：" prop="receiveUserId">
            <el-select
              placeholder="请选择领用人姓名"
              @change="receiveChange"
              v-model="formData.receiveUserId"
              style="width: 300px"
            >
            <div v-infinite-scroll="loadArchiveListFun2">
              <el-option
                v-for="item in dataList2"
                :key="item.personnelId"
                :label="item.name"
                :value="item.personnelId"
              />
            </div>
             
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="领用人工号：">
            <el-input
              v-model="personnelCode"
              placeholder="请输入领用人工号"
              autocomplete="off"
              disabled
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="所属部门：">
            <el-input
              v-model="department"
              placeholder="请输入所属部门"
              autocomplete="off"
              disabled
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="物料名称：" prop="materialsId">
            <el-select
              v-model="formData.materialsId"
              filterable
              placeholder="请选择物料名称"
              @change="materialsCodeChange"
              style="width: 300px"
            >
            <div v-infinite-scroll="loadArchiveListFun">
              <el-option
                v-for="item in dataList"
                :key="item.materialsId"
                :label="`${item.name}--${item.code}--${item.batch}--${item.stock}`"
                :value="item.materialsId"
              />
            </div>
            
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
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
        <el-col :span="12">
          <el-form-item label="领用数量：" prop="reportNum">
            <el-input-number
              v-model="formData.receiveNum"
              placeholder="请输入领用数量"
              :min="1"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
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
        <el-col :span="12">
          <el-form-item label="用途说明：" prop="receiveExplain">
            <el-select
              v-model="formData.receiveExplain"
              placeholder="请选择用途说明"
              style="width: 300px"
            >
              <el-option label="生产用量" value="生产用量" />
              <el-option label="维修用量" value="维修用量" />
              <el-option label="实验用量" value="实验用量" />
              <el-option label="清洁用量" value="清洁用量" />
              <el-option label="其他" value="其他" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </v-dialog>
</template>

<style lang="scss" scoped></style>
