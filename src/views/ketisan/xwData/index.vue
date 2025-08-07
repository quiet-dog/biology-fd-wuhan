<script lang='ts' setup>
import { XwAlarmListReq } from '@/api/xwAlarm/types';
import { onMounted, reactive, ref, toRaw } from 'vue';
import { Plus, Refresh, Search } from "@element-plus/icons-vue";
import { dayjs, Sort } from 'element-plus';
import { CommonUtils } from '@/utils/common';
import { xwAlarmList } from '@/api/xwAlarm';
import { PaginationProps } from '@pureadmin/table';
import { PureTableBar } from "@/components/RePureTableBar";
import detailFormModal from "./detai-form-modal.vue";

const tableRef = ref();
const searchFormParams = reactive<XwAlarmListReq>({
  cameraId: "",
  seatNumer:"",
});
const defaultSort: Sort = {
  prop: "createTime",
  order: "descending"
};
const pageLoading = ref(true);
const sortState = ref<Sort>(defaultSort);
const dataList = ref([]);
const searchFormRef = ref();
const pagination: PaginationProps = {
  total: 0,
  pageSize: 10,
  currentPage: 1,
  background: true
};


const columns: TableColumnList = [
  {
    label: "报警序号",
    prop: "xwAlarmId"
  },
  {
    label: "机位号",
    prop: "seatNumber"
  },
  {
    label: "摄像头ID",
    prop: "cameraId"
  },
  {
    label: "报警标志",
    prop: "flag",
  },
  {
    label: "报警时间",
    prop: "pushTime",
  },
  {
    label: "操作",
    fixed: "right",
    width: 200,
    slot: "operation"
  }
];

const archiveListFun = async () => {
  pageLoading.value = true;

  CommonUtils.fillSortParams(searchFormParams, sortState.value);
  CommonUtils.fillPaginationParams(searchFormParams, pagination);
  // @ts-expect-error
  const { data } = await xwAlarmList(toRaw(searchFormParams)).finally(() => {
    pageLoading.value = false;
  });
  dataList.value = data.rows;
  pagination.total = data.total;
};

//重置
function resetForm() {
  searchFormParams.cameraId = "";
  searchFormParams.beginTime = undefined;
  searchFormParams.endTime = undefined;

  // 重置 pagination 中的属性
  pagination.total = 0;
  pagination.pageSize = 10;
  pagination.currentPage = 1;
  pagination.background = true;
  archiveListFun();
}

const onSearch = tableRef => {
  archiveListFun();
  // 点击搜索的时候，需要重置排序，重新排序的时候会重置分页并发起查询请求
  tableRef.getTableRef();
};

const detailVisible = ref(false)
const detailRow = ref()
function openDetailDialog(row) {
  detailRow.value = row
  detailVisible.value = true
}
onMounted(() => {
  archiveListFun()
})
</script>

<template>
  <div class="main">
    <el-form ref="searchFormRef" :inline="true" :model="searchFormParams"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]">
      <el-form-item label="摄像头ID：">
        <el-input class="!w-[200px]" placeholder="请输入设备sn号" clearable v-model="searchFormParams.cameraId" />
      </el-form-item>
      <!-- <el-form-item label="设备名称：">
        <el-input class="!w-[200px]" placeholder="请输入设备名称" clearable v-model="searchFormParams.name" />
      </el-form-item>
      <el-form-item label="所属区域：">
        <el-input class="!w-[200px]" placeholder="请输入所属区域：" clearable v-model="searchFormParams.area" />
      </el-form-item>
      <el-form-item label="设备状态：">
        <el-options>

        </el-options>
      </el-form-item> -->
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="archiveListFun">搜索</el-button>
        <el-button :icon="Refresh" @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
    <PureTableBar title="行为监测设备列表" :columns="columns" :tableRef="tableRef?.getTableRef()" @refresh="onSearch">
      <!-- <template #buttons>
        <el-button type="primary" :icon="Plus" @click="openDialog('add')">新增</el-button>
      </template> -->

      <template v-slot="{ size, dynamicColumns }">
        <pure-table ref="tableRef" adaptive :adaptiveConfig="{ offsetBottom: 32 }" align-whole="center"
          row-key="policiesId" showOverflowTooltip table-layout="auto" :size="size" :columns="dynamicColumns"
          :data="dataList" :pagination="pagination" :paginationSmall="size === 'small' ? true : false"
          @page-size-change="archiveListFun" @page-current-change="archiveListFun" :header-cell-style="{
            background: 'var(--el-table-row-hover-bg-color)',
            color: 'var(--el-text-color-primary)'
          }" style="height: auto">

          <template #operation="{ row }">
        
            <el-button class="reset-margin" link type="primary" :size="size" @click="openDetailDialog(row)">
              查看
            </el-button>
          </template>
        </pure-table>
      </template>

    </PureTableBar>
    <detailFormModal v-model="detailVisible" :row="detailRow" />
  </div>
</template>

<style scoped></style>
