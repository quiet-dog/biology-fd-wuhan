<script setup lang="ts">
import {
  addprocessRes,
  addprocess,
  renewprocessRes,
  renewprocess
} from "@/api/processData/processFlowChart";
import { archiveList } from "@/api/processData/processArchives";
import { nodeList } from "@/api/processData/processNode";
import VDialog from "@/components/VDialog/VDialog.vue";
import { ElMessage, FormInstance, FormRules } from "element-plus";
import { computed, reactive, ref } from "vue";

interface Props {
  type: "add" | "update";
  modelValue: boolean;
  row?: renewprocessRes;
}

const form = ref({
  nodeName: "",
  craftArchiveName: "",
  craftArchiveId: null,
  pageNum: 1,
  pageSize: 10
});

const archiveDataList = ref([]);

const nodeDataList = ref([]);

const loadArchiveListFun = () => {
  form.value.pageNum += 1;
  archiveListFun();
}
const archiveListFun = async () => {
  // @ts-ignore
  const { data } = await archiveList(form.value);
  if(data.rows.length > 0) {
    archiveDataList.value = [...archiveDataList.value,...data.rows];
  } 
};

const form2 = ref({
  craftNodeName: "",
  craftArchiveId: null,
  pageNum: 1,
  pageSize: 10
});
const loadNodeListFun = () => {
  form2.value.pageNum += 1;
  nodeListFun();
}
const nodeListFun = async () => {
  // @ts-ignore
  const { data } = await nodeList(form2.value);
  if(data.rows.length > 0) {
    nodeDataList.value = [...nodeDataList.value, ...data.rows];
  }
};

const rules: FormRules = {
  craftNodeId: [
    {
      required: true,
      message: "工艺节点不能为空"
    }
  ],
  craftArchiveId: [
    {
      required: true,
      message: "所属工艺不能为空"
    }
  ],
  nodeOrder: [
    {
      required: true,
      message: "节点顺序不能为空"
    }
  ],
  personnelFactors: [
    {
      required: true,
      message: "人员要素不能为空"
    }
  ],
  equipmentFactors: [
    {
      required: true,
      message: "设备要素不能为空"
    }
  ],
  materialFactors: [
    {
      required: true,
      message: "原料要素不能为空"
    }
  ],
  environmentFactors: [
    {
      required: true,
      message: "环境要素不能为空"
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

const formData = reactive<addprocessRes | renewprocessRes>({
  equipmentFactors: "",
  personnelFactors: "",
  materialFactors: "",
  nodeOrder: 1,
  environmentFactors: "",
  craftArchiveId: null,
  craftNodeId: null,
  craftProcessId: 0
});

const visible = computed({
  get: () => props.modelValue,
  set(v) {
    emits("update:modelValue", v);
  }
});

async function handleConfirm() {
  formRef.value.validate(async callback => {
    if (callback) {
      try {
        loading.value = true;
        if (props.type === "add") {
          await addprocess(formData);
        } else if (props.type === "update") {
          await renewprocess(formData as renewprocessRes);
        }
        ElMessage.success("提交成功");
        formRef.value?.resetFields();
        visible.value = false;
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
    console.log(props.row);
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
    :title="type === 'add' ? '新增工艺流程图' : '编辑工艺流程图'"
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
          <el-form-item label="所属工艺：" prop="craftArchiveId">
            <el-select
              v-model="formData.craftArchiveId"
              placeholder="请选择所属工艺"
              style="width: 300px"
              clearable
            >
            <div v-infinite-scroll="loadArchiveListFun">
              <el-option
                v-for="item in archiveDataList"
                :label="item.craftArchiveName"
                :value="item.craftArchiveId"
                :key="item.craftArchiveId"
              />
            </div>
             
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="工艺节点：" prop="craftNode">
            <el-select
              v-model="formData.craftNodeId"
              placeholder="请选择工艺节点"
              style="width: 300px"
            >
            <div v-infinite-scroll="loadNodeListFun">
              <el-option
                v-for="item in nodeDataList"
                :label="item.nodeName"
                :value="item.craftNodeId"
                :key="item.craftNodeId"
              />
            </div>
              
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="节点顺序：" prop="nodeOrder">
            <el-input-number
              v-model="formData.nodeOrder"
              :min="1"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="人员要素：" prop="personnelFactors">
        <el-input
          v-model="formData.personnelFactors"
          placeholder="请输入人员要素"
          autocomplete="off"
          style="width: 760px"
        />
      </el-form-item>
      <el-form-item label="设备要素：" prop="equipmentFactors">
        <el-input
          v-model="formData.equipmentFactors"
          placeholder="请输入设备要素"
          autocomplete="off"
          style="width: 760px"
        />
      </el-form-item>
      <el-form-item label="原料要素：" prop="materialFactors">
        <el-input
          v-model="formData.materialFactors"
          placeholder="请输入原料要素"
          autocomplete="off"
          style="width: 760px"
        />
      </el-form-item>
      <el-form-item label="环境要素：" prop="environmentFactors">
        <el-input
          v-model="formData.environmentFactors"
          placeholder="请输入环境要素"
          autocomplete="off"
          style="width: 760px"
        />
      </el-form-item>
    </el-form>
  </v-dialog>
</template>

<style lang="scss" scoped></style>
