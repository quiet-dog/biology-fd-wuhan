<script lang="ts" setup>
import { SmDataListReq } from "@/api/smData/types";
import { onMounted, reactive, ref, toRaw } from "vue";
import { Download, Plus, Refresh, Search } from "@element-plus/icons-vue";
import { dayjs, Sort } from "element-plus";
import { CommonUtils } from "@/utils/common";
import { exportSmData, smDataList } from "@/api/smData";
import { PaginationProps } from "@pureadmin/table";
import { PureTableBar } from "@/components/RePureTableBar";
import XinDianEchart from "@/components/XinDianEchart/index.vue";
import HuXiEchart from "@/components/HuXiEchart/index.vue";
import { ExportDownload } from "@/utils/exportdownload";

const tableRef = ref();
const searchFormParams = reactive<SmDataListReq>({
  pageNum: 1,
  pageSize: 10,
  smDeviceSn: "",
  timeRangeColumn: "create_time"
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
    label: "序号",
    prop: "smDataId"
  },
  {
    label: "设备SN号",
    prop: "deviceSn"
  },
  {
    label: "操作员",
    prop: "personnelName"
  },
  {
    label: "心率",
    prop: "xinlv"
  },
  {
    label: "血氧",
    prop: "xueYang"
  },
  {
    label: "体温",
    prop: "temp"
  },
  {
    label: "二氧化碳浓度",
    prop: "co2"
  },
  // {
  //   label: "状态",
  //   prop: "co2",
  // },
  {
    label: "时间",
    prop: "createTime"
  },
  {
    label: "操作",
    fixed: "right",
    width: 200,
    slot: "operation"
  }
];
const xinDianEchartRef = ref<InstanceType<typeof XinDianEchart>>();
const huXiEchartRef = ref<InstanceType<typeof HuXiEchart>>();

const archiveListFun = async () => {
  pageLoading.value = true;

  CommonUtils.fillSortParams(searchFormParams, sortState.value);
  CommonUtils.fillPaginationParams(searchFormParams, pagination);
  // @ts-expect-error
  const { data } = await smDataList(toRaw(searchFormParams)).finally(() => {
    pageLoading.value = false;
  });
  dataList.value = data.rows;
  pagination.total = data.total;
};

//重置
function resetForm() {
  searchFormParams.smDeviceSn = "";
  searchFormParams.beginTime = undefined;
  searchFormParams.endTime = undefined;
  searchFormParams.smDataId = [];
  caiYangTime.value = [];

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

function handleXinDianDetail(id: number) {
  xinDianEchartRef.value.handleOpened(id);
}

function handleHuXiDetail(id: number) {
  huXiEchartRef.value.handleOpened(id);
}

const multipleSelection = ref([]);
const exportClick = () => {
  if (multipleSelection.value.length == 0) {
    CommonUtils.fillSortParams(searchFormParams, sortState.value);
    CommonUtils.fillPaginationParams(searchFormParams, {
      ...pagination,
      pageSize: 10000,
      currentPage: 1
    });
  } else {
    CommonUtils.fillSortParams(searchFormParams, sortState.value);
    CommonUtils.fillPaginationParams(searchFormParams, {
      ...pagination,
      pageSize: undefined,
      currentPage: undefined
    });
  }

  exportSmData(
    toRaw({ ...searchFormParams, smDataIds: multipleSelection.value })
  ).then(res => {
    console.log(res);
    ExportDownload(res, "生命数据列表");
  });
};
const caiYangTime = ref([]);
function changeCaiYangTime(val) {
  if (Array.isArray(val) && val.length > 0) {
    searchFormParams.beginTime = val[0];
    searchFormParams.endTime = val[1];
  } else {
    searchFormParams.beginTime = undefined;
    searchFormParams.endTime = undefined;
  }
}
onMounted(() => {
  archiveListFun();
});
</script>

<template>
  <div class="main">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="searchFormParams"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
    >
      <el-form-item label="设备SN号：">
        <el-input
          class="!w-[200px]"
          placeholder="请输入设备SN号"
          clearable
          v-model="searchFormParams.smDeviceSn"
        />
      </el-form-item>
      <el-form-item label="采样时间">
        <el-date-picker
          v-model="caiYangTime"
          type="daterange"
          placeholder="请选择采样时间"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          @change="changeCaiYangTime"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="archiveListFun"
          >搜索</el-button
        >
        <el-button :icon="Refresh" @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
    <PureTableBar
      title="设备数据列表"
      :columns="columns"
      :tableRef="tableRef?.getTableRef()"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button type="warning" :icon="Download" @click="exportClick"
          >导出</el-button
        >
      </template>

      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          @selection-change="
            rows => (multipleSelection = rows.map(item => item.smDataId))
          "
          ref="tableRef"
          adaptive
          :adaptiveConfig="{ offsetBottom: 32 }"
          align-whole="center"
          row-key="smDataId"
          showOverflowTooltip
          table-layout="auto"
          :size="size"
          :columns="dynamicColumns"
          :data="dataList"
          :pagination="pagination"
          :paginationSmall="size === 'small' ? true : false"
          @page-size-change="archiveListFun"
          @page-current-change="archiveListFun"
          :header-cell-style="{
            background: 'var(--el-table-row-hover-bg-color)',
            color: 'var(--el-text-color-primary)'
          }"
          style="height: auto"
        >
          <template #operation="{ row }">
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              @click="handleHuXiDetail(row.smDataId)"
            >
              查看呼吸率
            </el-button>
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              @click="handleXinDianDetail(row.smDataId)"
            >
              查看心电
            </el-button>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
    <XinDianEchart ref="xinDianEchartRef" />
    <HuXiEchart ref="huXiEchartRef" />
  </div>
</template>

<style scoped></style>
