<script lang="ts" setup>
import { addSmDevice } from "@/api/smDevice";
import { AddSmDeviceReq, SmDeviceRow } from "@/api/smDevice/types";
import { ElMessage, FormRules } from "element-plus";
import { computed, reactive, ref, toRaw } from "vue";
import VDialog from "@/components/VDialog/VDialog.vue";
import { smDataList } from "../../../api/smData/index";
import {
  personnelInfo,
  personnelList
} from "@/api/personnelData/personnelProfile";

interface Props {
  modelValue: boolean;
  row: SmDeviceRow;
}
const props = defineProps<Props>();
const loading = ref(false);
const formRef = ref();

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
  deviceSn: [
    {
      required: true,
      message: "设备sn不能为空"
    }
  ],
  name: [
    {
      required: true,
      message: "设备名称不能为空"
    }
  ],
  personnelId: [
    {
      required: true,
      message: "操作员不能为空"
    }
  ],
  area: [
    {
      required: true,
      message: "区域不能为空"
    }
  ]
};

const formData = reactive<AddSmDeviceReq>({
  name: "",
  personnelId: 0,
  area: "",
  deviceSn: "",
  lastTimeStr: ""
});

const personnelParams = ref({
  total: 0,
  pageSize: 10,
  page: 1
});

const personnelSelect = ref([]);

async function handleConfirm() {
  try {
    loading.value = true;
    await addSmDevice(formData);
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

function getPersonnelList() {
  if (
    personnelParams.value.total != 0 &&
    personnelParams.value.page * personnelParams.value.pageSize >
      personnelParams.value.total
  ) {
    return;
  }

  // @ts-expect-error
  personnelList({
    pageNum: personnelParams.value.page,
    pageSize: personnelParams.value.pageSize
  }).then(res => {
    // @ts-expect-error
    personnelSelect.value = res.data.rows;
    console.log("personnelSelect", personnelSelect.value);
    // @ts-expect-error
    personnelParams.value.total = res.data.total;
    personnelParams.value.page++;
  });
}

const personnelDetail = ref({
  name: "",
  contact: "",
  department: ""
});
function handleOpened() {
  if (props.row) {
    Object.assign(formData, props.row);
    getSmDataList();

    personnelInfo(props.row.personnelId).then(res => {
      // @ts-expect-error
      personnelDetail.value = res.data;
    });
  }
}

function handleClosed() {}

const pageInfo = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0,
  orderColumn: "sendTime",
  orderDirection: "desc"
});

const smDataListData = ref([]);
async function getSmDataList() {
  // @ts-expect-error
  const { data } = await smDataList({
    ...pageInfo.value,
    smDeviceSn: formData.deviceSn
  }).finally(() => {});
  smDataListData.value = data.rows;
  pageInfo.value.total = data.total;
}
</script>

<template>
  <v-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    title="查看生命体征设备"
    v-model="visible"
    :loading="loading"
    @confirm="handleConfirm"
    @cancel="cancelConfirm"
    @opened="handleOpened"
    @closed="handleClosed"
    :confirm-show="false"
  >
    <el-tabs>
      <el-tab-pane label="设备信息">
        <el-form
          :model="formData"
          label-width="120px"
          :rules="rules"
          ref="formRef"
        >
          <el-row>
            <el-col :span="12">
              <el-form-item label="设备SN号：" prop="deviceSn">
                <el-input
                  v-model="formData.deviceSn"
                  disabled
                  filterable
                  placeholder="请输入设备SN号"
                  style="width: 300px"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="设备名称：">
                <el-input
                  v-model="formData.name"
                  disabled
                  placeholder="请输入设备名称"
                  style="width: 300px"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="操作人员：" prop="personnelId">
                <!-- <el-input-number v-model="formData.reportNum" placeholder="请输入物料数量" :min="1" style="width: 300px" /> -->
                <el-input
                  :placeholder="personnelDetail.name"
                  disabled
                  autocomplete="off"
                  style="width: 300px"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="部门：">
                <el-input
                  disabled
                  :placeholder="personnelDetail.department"
                  autocomplete="off"
                  style="width: 300px"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="联系方式：">
                <el-input
                  :placeholder="personnelDetail.contact"
                  autocomplete="off"
                  disabled
                  style="width: 300px"
                />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="所属区域：" prop="area">
                <el-input
                  v-model="formData.area"
                  placeholder="请输入所属区域"
                  style="width: 300px"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="末次通讯时间：">
                <el-input
                  v-model="formData.lastTimeStr"
                  placeholder=""
                  style="width: 300px"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="历史数据">
        <el-table :data="smDataListData">
          <!-- <el-table-column label="序号" prop="smDataId" />
          <el-table-column label="设备SN号" prop="deviceSn" /> -->
          <el-table-column label="操作员" prop="personnelName" />
          <el-table-column label="心率" prop="xinlv" />
          <el-table-column label="血氧" prop="xueYang" />
          <el-table-column label="体温" prop="temp" />
          <el-table-column label="二氧化碳浓度" prop="co2" />
          <el-table-column label="体态" prop="tiTai" />
          <el-table-column label="时间" prop="createTime" />
        </el-table>
        <el-row>
          <el-col>
            <el-pagination
              @size-change="getSmDataList"
              @current-change="getSmDataList"
              v-model:current-page="pageInfo.pageNum"
              v-model:page-size="pageInfo.pageSize"
              layout="prev, pager, next"
              :total="pageInfo.total"
            />
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
  </v-dialog>
</template>

<style scoped></style>
