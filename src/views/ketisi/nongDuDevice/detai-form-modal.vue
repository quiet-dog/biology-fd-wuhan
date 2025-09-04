<script lang="ts" setup>
import { addNongDuDevice } from "@/api/nongDuDevice";
import { AddNongDuDeviceReq, NongDuDeviceRow } from "@/api/nongDuDevice/types";
import { ElMessage, FormRules } from "element-plus";
import { computed, reactive, ref, toRaw } from "vue";
import VDialog from "@/components/VDialog/VDialog.vue";
import {
  personnelInfo,
  personnelList
} from "@/api/personnelData/personnelProfile";
import { caiYangDataList, exportCaiYangData } from "@/api/caiYangData";
import { ExportDownload } from "@/utils/exportdownload";

interface Props {
  modelValue: boolean;
  row: NongDuDeviceRow;
}
const props = defineProps<Props>();
const loading = ref(false);

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

const multipleSelection = ref([]);

async function handleConfirm() {
  try {
    loading.value = true;
  } catch (e) {
  } finally {
    loading.value = false;
  }
}

function cancelConfirm() {
  visible.value = false;
}
const list = ref([]);
const total = ref(0);
const pageInfo = ref({
  pageNum: 1,
  pageSize: 10,
  beginTime: undefined,
  endTime: undefined
});

function getList() {
  caiYangDataList({
    // @ts-expect-error
    deviceSn: props.row,
    ...pageInfo.value,
    orderColumn: "createTime",
    orderDirection: "descending",
    timeRangeColumn: "create_time"
  }).then(res => {
    // @ts-expect-error
    list.value = res.data.rows;
    total.value = res.data.total;
  });
}

function handleOpened() {
  if (props.row) {
    getList();
  }
}

const datePicker = ref([]);

function changeDate(value) {
  if (value) {
    pageInfo.value.beginTime = value[0];
    pageInfo.value.endTime = value[1];
  } else {
    pageInfo.value.beginTime = undefined;
    pageInfo.value.endTime = undefined;
  }
  getList();
}

function handleClosed() {}

const exportClick = () => {
  exportCaiYangData(
    toRaw({ ...pageInfo.value, caiCangDataIds: multipleSelection.value })
  ).then(res => {
    console.log(res);
    ExportDownload(res, "采样历史数据列表");
  });
};
</script>

<template>
  <v-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    title="采样历史记录"
    v-model="visible"
    :loading="loading"
    @confirm="handleConfirm"
    @cancel="cancelConfirm"
    @opened="handleOpened"
    @closed="handleClosed"
  >
    <el-form>
      <el-row>
        <el-col :span="8">
          <el-form-item label="消杀时间：">
            <el-date-picker
              @change="changeDate"
              v-model="datePicker"
              value-format="YYYY-MM-DD"
              type="daterange"
              range-separator="-"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" />
        <el-col :span="4">
          <el-button style="float: right" type="warning" @click="exportClick"
            >导出</el-button
          >
        </el-col>
      </el-row>
    </el-form>

    <el-table
      @selection-change="
        rows => (multipleSelection = rows.map(item => item.caiYangDataId))
      "
      :data="list"
      height="500"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="createTime" label="开始时间" />
      <el-table-column prop="endTimeStr" label="结束时间" />
      <el-table-column prop="runTime" label="工作时长" />
    </el-table>

    <el-pagination
      style="float: right; margin-top: 10px"
      @size-change="getList"
      @current-change="getList"
      background
      layout="prev, pager, next"
      v-model:page-size="pageInfo.pageSize"
      v-model:current-page="pageInfo.pageNum"
      :total="total"
    />
  </v-dialog>
</template>

<style scoped></style>
