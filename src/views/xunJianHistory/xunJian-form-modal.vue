<script setup lang="ts">
import {
  addXunJianApi,
  AddXunJianCommand,
  XunJianPageResponse,
  XunJianTypeEntity,
  updateXunJianApi,
  UpdateXunJianCommand
} from "@/api/manage/xunJian.ts";
import VDialog from "@/components/VDialog/VDialog.vue";
import { ElMessage, FormInstance, FormRules } from "element-plus";
import { computed, onMounted, reactive, ref } from "vue";
import CUplopad from "@/components/CUpload/index.vue";
import { json } from "stream/consumers";
import dayjs from "dayjs";
import { alarmEventsList } from "@/api/alarmPlatform/alarmEvents";




const loading = ref(false);



const visible = ref(false)

const Paths = ref([]);
async function handleConfirm() {
  visible.value = false
}
function handleOpened() {
  visible.value = true
}


function cancelConfirm() {
  visible.value = false;
}
function handleClosed() {
  visible.value = false;
}

const weekSelect = [{
  label: "周一",
  value: 0,
}, {
  label: "周二",
  value: 1,
}, {
  label: "周三",
  value: 2
}, {
  label: "周四",
  value: 3
}, {
  label: "周五",
  value: 4
}, {
  label: "周六",
  value: 5
}, {
  label: "周日",
  value: 6
}]

const total = ref(0)
const query = ref({
  page: 1,
  pageSize: 10,
  xunJianHistoryId: 0
})
const list = ref([])
function getList() {
  alarmEventsList(query.value).then(res => {
    list.value = res.data.rows;
    total.value = res.data.total;
  })
}

function handleOpenDialog(value: number) {
  query.value.xunJianHistoryId = value
  getList()
  handleOpened()
}

defineExpose({
  handleOpenDialog
})


onMounted(() => {
})
</script>

<template>
  <v-dialog :hiddenFooter="true" show-full-screen :fixed-body-height="false" use-body-scrolling title="巡检数据"
    v-model="visible" :loading="loading" @confirm="handleConfirm" @cancel="cancelConfirm" @opened="handleOpened"
    @closed="handleClosed">
    <el-table :data="list">
      <el-table-column prop="description" label="异常数据描述" />
      <el-table-column prop="createTime" label="时间" />
    </el-table>
    <el-pagination style="float: right;" v-model:page-size="query.pageSize" layout="prev, pager, next" :total="total"
      v-model:current-page="query.page" @current-change="getList" />
  </v-dialog>
</template>

<style lang="scss" scoped></style>
