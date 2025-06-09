<script setup lang="ts">
import {
  addnodeRes,
  addnode,
  renewnodeRes,
  renewnode
} from "@/api/processData/processNode";
import { archiveListRes, archiveList } from "@/api/processData/processArchives";
import VDialog from "@/components/VDialog/VDialog.vue";
import { ElMessage, FormInstance, FormRules } from "element-plus";
import { computed, reactive, ref } from "vue";
import { equipmentList } from "@/api/deviceData/equipmentProfile";

interface Props {
  type: "add" | "update";
  modelValue: boolean;
  row?: renewnodeRes;
}

const rules: FormRules = {
  nodeCode: [
    {
      required: true,
      message: "节点编号不能为空"
    }
  ],
  nodeName: [
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
  operationDescription: [
    {
      required: true,
      message: "操作工序不能为空"
    }
  ],
  operationMethod: [
    {
      required: true,
      message: "操作要求不能为空"
    }
  ],
  requiredTime: [
    {
      required: true,
      message: "所需时间不能为空"
    }
  ],
  nodeStatus: [
    {
      required: true,
      message: "节点状态不能为空"
    }
  ],
  equipmentIds: [
    {
      required: true,
      message: "设备名称不能为空"
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

const formData = reactive<addnodeRes | renewnodeRes>({
  isHighRisk: false,
  operationMethod: "",
  operationDescription: "",
  nodeName: "",
  nodeTags: "",
  requiredTime: "",
  craftArchiveId: null,
  nodeOrder: 1,
  craftNodeId: 0,
  nodeCode: "",
  equipmentIds: [],
  craftArchive: {
    craftArchiveId: null,
    craftArchiveName: ""
  }
});

const visible = computed({
  get: () => props.modelValue,
  set(v) {
    emits("update:modelValue", v);
  }
});

function handleConfirm() {
  formRef.value.validate(async callback => {
    if (callback) {
      try {
        loading.value = true;
        if (props.type === "add") {
          await addnode(formData);
        } else if (props.type === "update") {
          await renewnode(formData as renewnodeRes);
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

const form = ref<archiveListRes>({
  craftArchiveCode: "",
  craftArchiveName: "",
  ids: [],
  version: "",
  pageSize: 10,
  pageNum: 1
});
const dataList = ref([]);
const loadArchiveListFun= () => {
  form.value.pageNum += 1;
  archiveListFun();
};
const archiveListFun = async () => {
  // @ts-ignore
  const { data } = await archiveList(form.value);
  if (data.rows.length > 0) {
    dataList.value = [...dataList.value, ...data.rows];
  }
};

const archiveinfo = ref({
  equipmentName: "",
  manufacturer: "",
  startPurchaseDate: undefined,
  endPurchaseDate: undefined,
  usageStatus: "",
  equipmentType: "",
  pageSize: 10,
  pageNum: 1
});
const dataList2 = ref([]);

const loadEquipmentListFun2 = () => {
  archiveinfo.value.pageNum++;
  equipmentListFun2();
}
const equipmentListFun2 = async () => {
  // @ts-ignore
  const { data } = await equipmentList(archiveinfo.value);
  if (data.rows.length > 0) {
    dataList2.value = [...dataList2.value, ...data.rows];
  } 
};

function handleOpened() {
  console.log(props.row);

  if (props.row) {
    Object.assign(formData, {
      ...props.row,
      equipmentIds: Array.isArray(props.row.equipmentIds)
        ? props.row.equipmentIds
        : []
    });
  }
  archiveListFun();
  equipmentListFun2();
}

function cancelConfirm() {
  visible.value = false;
}

function handleClosed() {
  formRef.value?.resetFields();
  formData.nodeTags = "";
}
</script>

<template>
  <v-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    :title="type === 'add' ? '新增工艺节点' : '编辑工艺节点'"
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
          <el-form-item label="工艺节点：" prop="nodeName">
            <el-input
              v-model="formData.nodeName"
              autocomplete="off"
              placeholder="请输入工艺节点"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
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
                v-for="item in dataList"
                :label="item.craftArchiveName"
                :value="item.craftArchiveId"
                :key="item.craftArchiveId"
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
        <el-col :span="12">
          <el-form-item label="设备名称：" prop="equipmentIds">
            <el-select
              v-model="formData.equipmentIds"
              :multiple="true"
              placeholder="请选择设备名称"
              style="width: 300px"
              clearable
              collapse-tags
              collapse-tags-tooltip
            >

            <div v-infinite-scroll="loadEquipmentListFun2">
              <el-option
                v-for="item in dataList2"
                :label="item.equipmentName"
                :value="item.equipmentId"
                :key="item.equipmentId"
              />
            </div>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="操作工序：" prop="operationDescription">
        <el-input
          v-model="formData.operationDescription"
          type="textarea"
          :rows="2"
          placeholder="请输入操作工序"
          autocomplete="off"
          style="width: 760px"
        />
      </el-form-item>
      <el-form-item label="操作要求：" prop="operationMethod">
        <el-input
          v-model="formData.operationMethod"
          type="textarea"
          :rows="2"
          placeholder="请输入操作要求"
          autocomplete="off"
          style="width: 760px"
        />
      </el-form-item>
      <el-row>
        <el-col :span="12">
          <el-form-item label="所需时间：" prop="requiredTime">
            <el-input
              v-model="formData.requiredTime"
              placeholder="请输入所需时间"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否为高风险：" label-width="120">
            <el-select
              v-model="formData.isHighRisk"
              placeholder="请选择节点状态"
              style="width: 300px"
              clearable
            >
              <el-option label="是" :value="true" />
              <el-option label="否" :value="false" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="标签定义：" label-width="120">
        <el-input
          v-model="formData.nodeTags"
          placeholder="请输入标签定义"
          style="width: 300px"
        />
      </el-form-item>
    </el-form>
  </v-dialog>
</template>

<style lang="scss" scoped></style>
