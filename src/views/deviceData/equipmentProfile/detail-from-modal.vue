<template>
  <v-detail-dialog
    show-full-screen
    :fixed-body-height="true"
    use-body-scrolling
    title="查看设备档案"
    v-model="visible"
    :loading="loading"
    :disableFooter="true"
    @cancel="cancelConfirm"
    @opened="handleOpened"
  >
    <div class="tabs-container">
      <el-tabs
        v-model="activeName"
        class="sticky-tabs"
        @tab-change="handleTabChange"
      >
        <el-tab-pane label="基础信息" name="first">
          <el-form :model="formData" label-width="100px" ref="formRef">
            <el-row>
              <el-col :span="12">
                <el-form-item label="设备编号：">
                  <el-input
                    v-model="formData.equipmentCode"
                    autocomplete="off"
                    readonly
                    style="width: 300px"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="设备名称：">
                  <el-input
                    v-model="formData.equipmentName"
                    autocomplete="off"
                    readonly
                    style="width: 300px"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="设备型号：">
              <el-input
                v-model="formData.equipmentType"
                autocomplete="off"
                :rows="2"
                type="textarea"
                readonly
                style="width: 760px"
              />
            </el-form-item>
            <el-form-item label="技术规格：">
              <el-input
                v-model="formData.technicalSpec"
                autocomplete="off"
                :rows="2"
                type="textarea"
                readonly
                style="width: 760px"
              />
            </el-form-item>
            <el-form-item label="性能参数：">
              <el-input
                v-model="formData.performanceParams"
                autocomplete="off"
                :rows="2"
                type="textarea"
                readonly
                style="width: 760px"
              />
            </el-form-item>
            <el-row>
              <el-col :span="12">
                <el-form-item label="生产厂家：">
                  <el-input
                    v-model="formData.manufacturer"
                    autocomplete="off"
                    readonly
                    style="width: 300px"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="购置日期：">
                  <el-input
                    v-model="formData.purchaseDate"
                    autocomplete="off"
                    readonly
                    style="width: 300px"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="存放地点：">
                  <el-input
                    v-model="formData.installationLocation"
                    autocomplete="off"
                    readonly
                    style="width: 300px"
                  />
                </el-form-item>
              </el-col>
              <!-- <el-col :span="12">
                <el-form-item label="使用状态：">
                  <el-input
                    v-model="formData.usageStatus"
                    autocomplete="off"
                    readonly
                    style="width: 300px"
                  />
                </el-form-item>
              </el-col> -->
            </el-row>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="维修记录" name="second">
          <el-table :data="weixiuDataList" style="width: 100%">
            <el-table-column prop="recordId" label="维修编号" align="center" />
            <el-table-column
              prop="equipment.equipmentCode"
              label="设备编号"
              align="center"
            />
            <el-table-column label="维修日期" align="center">
              <template #default="scope">
                {{ dayjs(scope.row.repairDate).format("YYYY-MM-DD") }}
              </template>
            </el-table-column>
            <el-table-column
              prop="repairContent"
              label="维修内容"
              align="center"
            />
            <el-table-column
              prop="repairPersonnel"
              label="维修人员"
              align="center"
            />
            <el-table-column
              prop="repairResult"
              label="维修结果"
              align="center"
            />
            <el-table-column
              prop="repairCost"
              label="维修费用"
              align="center"
            />
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="检修记录" name="third">
          <el-table :data="jianxiuDataList" style="width: 100%">
            <el-table-column prop="recordId" label="检修编号" align="center" />
            <el-table-column
              prop="equipment.equipmentCode"
              label="设备编号"
              align="center"
            />
            <el-table-column label="检修日期" align="center">
              <template #default="scope">
                {{ dayjs(scope.row.inspectionDate).format("YYYY-MM-DD") }}
              </template>
            </el-table-column>
            <el-table-column
              prop="inspectionContent"
              label="检修内容"
              align="center"
            />
            <el-table-column prop="inspector" label="检修人员" align="center" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>
  </v-detail-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue";
import { FormInstance } from "element-plus";
import { equipmentInfo } from "@/api/deviceData/equipmentProfile";
import VDetailDialog from "@/components/VDetailDialog/VDetailDialog.vue";
import {
  equipmentRepairListRes,
  equipmentRepairList
} from "@/api/deviceData/WeiXiuRecords";
import { inspectionRes, inspectionList } from "@/api/deviceData/JianXiuRecords";
import dayjs from "dayjs";

const visible = ref(false);
const loading = ref(false);
const formRef = ref<FormInstance>();

const formData = ref({
  equipmentCode: "",
  equipmentName: "",
  equipmentType: "",
  manufacturer: "",
  purchaseDate: "",
  requiredTime: "",
  installationLocation: "",
  usageStatus: "",
  technicalSpec: "",
  performanceParams: ""
});

const activeName = ref("first");
const equipmentId = ref(0);

//设备档案信息
const equipmentInfofun = () => {
  equipmentInfo(equipmentId.value).then(res => {
    formData.value = res.data;
  });
};

// 设备维修记录列表
const weixiuData = ref<equipmentRepairListRes>({
  pageNum: 1,
  pageSize: 10000,
  equipmentCode: "",
  repairPersonnel: "",
  startRepairDate: undefined,
  endRepairDate: undefined
});
const weixiuDataList = ref([]);
const weixiuList = async () => {
  const { data } = await equipmentRepairList({
    ...weixiuData.value,
    equipmentCode: formData.value.equipmentCode
  });
  weixiuDataList.value = data.rows;
};

// 设备检修记录列表
const jianxiuData = ref<inspectionRes>({
  pageNum: 1,
  pageSize: 10000,
  equipmentCode: "",
  inspector: "",
  startInspectionDate: undefined,
  endInspectionDate: undefined
});
const jianxiuDataList = ref([]);
const jianxiuList = async () => {
  const { data } = await inspectionList({
    ...jianxiuData.value,
    equipmentCode: formData.value.equipmentCode
  });
  jianxiuDataList.value = data.rows;
};

const handleTabChange = async val => {
  switch (val) {
    case "first":
      await equipmentInfofun();
      break;
    case "second":
      await weixiuList();
      break;
    case "third":
      await jianxiuList();
      break;
    default:
      break;
  }
};

const handleOpened = (id: number) => {
  if (!id) {
    return;
  }
  equipmentId.value = id;
  visible.value = true;
  equipmentInfofun();
};

function cancelConfirm() {
  visible.value = false;
  formRef.value?.resetFields();
  activeName.value = "first";
}

defineExpose({
  handleOpened
});
</script>

<style lang="scss" scoped>
.tabs-container {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  :deep(.el-tabs) {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  :deep(.el-tabs__header) {
    margin: 0;
    background: #fff;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  :deep(.el-tabs__content) {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
  }
}
</style>
