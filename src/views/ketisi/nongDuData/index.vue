<script lang='ts' setup>
import { NongDuDataListReq } from '@/api/nongDuData/types';
import { onMounted, reactive, ref, toRaw } from 'vue';
import { Download, Plus, Refresh, Search } from "@element-plus/icons-vue";
import { dayjs, Sort } from 'element-plus';
import { CommonUtils } from '@/utils/common';
import { exportNongDuData, nongDuDataList } from '@/api/nongDuData';
import { PaginationProps } from '@pureadmin/table';
import { PureTableBar } from "@/components/RePureTableBar";
import { ExportDownload } from '@/utils/exportdownload';

const tableRef = ref();
const searchFormParams = reactive<NongDuDataListReq>({
  pageNum: 1,
  pageSize: 10,
  deviceSn: "",
  area: "",
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
    type: "selection",
    align: "left"
  },
  {
    label: "生物浓度",
    prop: "biologicalConcentration",
  },
  {
    label: "粒子浓度",
    prop: "particleConcentration",
  },
  {
    label: "采样时间",
    prop: "createTime",
  },
  {
    label: "报警状态",
    prop: "alarmStatus",
  },
];

const archiveListFun = async () => {
  pageLoading.value = true;

  CommonUtils.fillSortParams(searchFormParams, sortState.value);
  CommonUtils.fillPaginationParams(searchFormParams, pagination);
  // @ts-expect-error
  const { data } = await nongDuDataList(toRaw(searchFormParams)).finally(() => {
    pageLoading.value = false;
  });
  dataList.value = data.rows;
  pagination.total = data.total;
};

//重置
function resetForm() {
  searchFormParams.area = "";
  searchFormParams.deviceSn = "";
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

const opType = ref<"add" | "edit">("add");
const modalVisible = ref(false);
const opRow = ref()
function openDialog(type: "add" | "edit", row?) {
  opType.value = type;
  modalVisible.value = true;
  opRow.value = row;
}

const detailVisible = ref(false)
const detailRow = ref()
function openDetailDialog(row) {
  detailRow.value = row
  detailVisible.value = true
}

const multipleSelection = ref([]);
const exportClick = () => {
  if (multipleSelection.value.length == 0) {
    CommonUtils.fillSortParams(searchFormParams, sortState.value);
    CommonUtils.fillPaginationParams(searchFormParams, {
      ...pagination,
      pageSize: 10000,
      currentPage: 1,
    });
  } else {
    CommonUtils.fillSortParams(searchFormParams, sortState.value);
    CommonUtils.fillPaginationParams(searchFormParams, {
      ...pagination,
      pageSize: undefined,
      currentPage: undefined,
    });
  }

  exportNongDuData(
    toRaw({ ...searchFormParams, nongDuDataIds: multipleSelection.value })
  ).then(res => {
    ExportDownload(res, "浓度数据列表");
  });
}
onMounted(() => {
  archiveListFun()
})
</script>

<template>
  <div class="main">
    <el-form ref="searchFormRef" :inline="true" :model="searchFormParams"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]">
      <el-form-item label="设备编号：">
        <el-input class="!w-[200px]" placeholder="请输入设备SN号" clearable v-model="searchFormParams.deviceSn" />
      </el-form-item>
      <el-form-item label="所属区域：">
        <el-input class="!w-[200px]" placeholder="请输入设备名称" clearable v-model="searchFormParams.area" />
      </el-form-item>
      <!-- <el-form-item label="设备状态：">
        <el-options>
        </el-options>
      </el-form-item> -->
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="archiveListFun">搜索</el-button>
        <el-button :icon="Refresh" @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
    <PureTableBar title="监测历史数据列表" :columns="columns" :tableRef="tableRef?.getTableRef()" @refresh="onSearch">
      <template #buttons>
        <el-button type="primary" :icon="Plus" @click="openDialog('add')">新增</el-button>
        <el-button type="warning" :icon="Download" @click="exportClick">导出</el-button>

      </template>

      <template v-slot="{ size, dynamicColumns }">
        <pure-table @selection-change="
          rows => (multipleSelection = rows.map(item => item.nongDuDataId))
        " ref="tableRef" adaptive :adaptiveConfig="{ offsetBottom: 32 }" align-whole="center"
          row-key="policiesId" showOverflowTooltip table-layout="auto" :size="size" :columns="dynamicColumns"
          :data="dataList" :pagination="pagination" :paginationSmall="size === 'small' ? true : false"
          @page-size-change="archiveListFun" @page-current-change="archiveListFun" :header-cell-style="{
            background: 'var(--el-table-row-hover-bg-color)',
            color: 'var(--el-text-color-primary)'
          }" style="height: auto">

        </pure-table>
      </template>

    </PureTableBar>

  </div>
</template>

<style scoped></style>
