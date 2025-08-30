<script lang="ts" setup>
import { addXwDevice } from "@/api/xwDevice/index";
import { AddXwDeviceReq, XwDeviceRow } from "@/api/xwDevice/types";
import { ElMessage, FormRules } from "element-plus";
import { computed, reactive, ref } from "vue";
import VDialog from "@/components/VDialog/VDialog.vue";
import {
  personnelInfo,
  personnelList
} from "@/api/personnelData/personnelProfile";
import { xsDataList } from "@/api/xsData";
import { xwAlarmList } from "@/api/xwAlarm";

const loading = ref(false);
const visible = ref(false);

const cameraId = ref("");
const dataList = ref([]);

async function handleConfirm() {
  try {
    loading.value = true;
  } catch (e) {
    console.error(e);
    ElMessage.error((e as Error)?.message || "提交失败");
  } finally {
    loading.value = false;
  }
}

const pageInfo = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0,
  orderColumn: "createTime",
  orderDirection: "desc"
});

function cancelConfirm() {
  visible.value = false;
}

function getList() {
  xwAlarmList({
    pageNum: pageInfo.value.pageNum,
    pageSize: pageInfo.value.pageSize,
    cameraId: cameraId.value,
    orderColumn: "createTime",
    orderDirection: "desc"
  }).then(res => {
    // @ts-expect-error
    dataList.value = res.data.rows;
    // @ts-expect-error
    pageInfo.value.total = res.data.total;
  });
}

function handleOpened() {
  visible.value = true;
  getList();
}

function open(id: string) {
  cameraId.value = id;
  visible.value = true;
}
defineExpose({
  open
});

function handleClosed() {}
</script>

<template>
  <v-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    title="历史数据"
    v-model="visible"
    :loading="loading"
    @confirm="handleConfirm"
    @cancel="cancelConfirm"
    @opened="handleOpened"
    @closed="handleClosed"
  >
    <el-table height="500px" :data="dataList">
      <el-table-column label="报警序号" prop="xwAlarmId" />
      <el-table-column label="机位号" prop="seatNumber" />
      <el-table-column label="机位对应内容" prop="content" />
      <el-table-column label="报警时间" prop="createTime" />
    </el-table>
    <el-pagination
      @size-change="getList"
      @current-change="getList"
      v-model:current-page="pageInfo.pageNum"
      v-model:page-size="pageInfo.pageSize"
      layout="prev, pager, next"
      :total="pageInfo.total"
    />
  </v-dialog>
</template>

<style scoped></style>
