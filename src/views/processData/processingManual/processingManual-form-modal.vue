<script setup lang="ts">
import {
  addmanualRes,
  addmanual,
  renewmanualRes,
  renewmanual
} from "@/api/processData/processingManual";
import VDialog from "@/components/VDialog/VDialog.vue";
import { ElMessage, FormInstance, FormRules } from "element-plus";
import { computed, reactive, ref } from "vue";
import { archiveList } from "@/api/processData/processArchives";
import { nodeList } from "@/api/processData/processNode";

interface Props {
  type: "add" | "update";
  modelValue: boolean;
  row?: renewmanualRes;
}

const rules: FormRules = {
  craftArchiveId: [
    {
      required: true,
      message: "所选工艺档案不能为空"
    }
  ],
  craftNodeId: [
    {
      required: true,
      message: "所选工艺节点不能为空"
    }
  ],
  problemDescription: [
    {
      required: true,
      message: "发生问题不能为空"
    }
  ],
  emergencyProcess: [
    {
      required: true,
      message: "紧急处理流程不能为空"
    }
  ],
  responsibilityDivision: [
    {
      required: true,
      message: "责任划分不能为空"
    }
  ],
  requiredTime: [
    {
      required: true,
      message: "所需时间不能为空"
    }
  ],
  preventiveMeasures: [
    {
      required: true,
      message: "预防措施不能为空"
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

const formData = reactive<addmanualRes | renewmanualRes>({
  craftNodeId: null,
  craftArchiveId: null,
  problemDescription: "",
  emergencyProcess: "",
  responsibilityDivision: "",
  requiredTime: "",
  preventiveMeasures: "",
  craftDisposeManualId: 0
});

const visible = computed({
  get: () => props.modelValue,
  set(v) {
    emits("update:modelValue", v);
  }
});

const form = ref({
  craftNodeId: null,
  nodeName: "",
  craftArchiveName: "",
  craftArchiveId: null,
  pageNum: 1,
  pageSize: 10000
});

const archiveDataList = ref([]);
const nodeDataList = ref([]);

const archiveListFun = async () => {
  const { data } = await archiveList(form.value);
  archiveDataList.value = data.rows;
};

const nodeListFun = async () => {
  const { data } = await nodeList(form.value);
  nodeDataList.value = data.rows;
};

function handleConfirm() {
  formRef.value.validate(async callback => {
    if (callback) {
      try {
        loading.value = true;
        if (props.type === "add") {
          await addmanual(formData);
        } else if (props.type === "update") {
          await renewmanual(formData as renewmanualRes);
        }
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
    Object.assign(formData, props.row);
  }
  archiveListFun();
  nodeListFun();
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
    :title="type === 'add' ? '新增处置手册' : '编辑处置手册'"
    v-model="visible"
    :loading="loading"
    @confirm="handleConfirm"
    @cancel="cancelConfirm"
    @opened="handleOpened"
    @closed="handleClosed"
  >
    <el-form :model="formData" label-width="120px" :rules="rules" ref="formRef">
      <el-row>
        <el-col :span="12">
          <el-form-item label="工艺档案：" prop="craftArchiveId">
            <el-select
              v-model="formData.craftArchiveId"
              placeholder="请选择工艺档案"
              style="width: 300px"
              clearable
            >
              <el-option
                v-for="item in archiveDataList"
                :label="item.craftArchiveName"
                :value="item.craftArchiveId"
                :key="item.craftArchiveId"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="工艺节点：" prop="craftNodeId">
            <el-select
              v-model="formData.craftNodeId"
              placeholder="请选择工艺节点"
              style="width: 300px"
              clearable
            >
              <el-option
                v-for="item in nodeDataList"
                :label="item.nodeName"
                :value="item.craftNodeId"
                :key="item.craftNodeId"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="发生问题：" prop="problemDescription">
        <el-input
          v-model="formData.problemDescription"
          placeholder="请输入发生问题"
          autocomplete="off"
          type="textarea"
          :rows="2"
          style="width: 760px"
        />
      </el-form-item>
      <el-form-item label="紧急处理流程：" prop="emergencyProcess">
        <el-input
          v-model="formData.emergencyProcess"
          placeholder="请输入紧急处理流程"
          autocomplete="off"
          type="textarea"
          :rows="2"
          style="width: 760px"
        />
      </el-form-item>
      <el-row>
        <el-col :span="12">
          <el-form-item label="责任划分：" prop="responsibilityDivision">
            <el-input
              v-model="formData.responsibilityDivision"
              placeholder="请输入责任划分"
              autocomplete="off"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="所需时间：" prop="requiredTime">
            <el-input
              v-model="formData.requiredTime"
              placeholder="请输入所需时间"
              autocomplete="off"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="预防措施：" prop="preventiveMeasures">
        <el-input
          v-model="formData.preventiveMeasures"
          placeholder="请输入预防措施"
          autocomplete="off"
          style="width: 300px"
        />
      </el-form-item>
    </el-form>
  </v-dialog>
</template>

<style lang="scss" scoped></style>
