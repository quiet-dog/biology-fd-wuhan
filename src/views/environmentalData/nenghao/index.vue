<script lang='ts' setup>
import { detectionList, detectionListRes } from '@/api/environmentalData/alarmLevelSetting';
import { CommonUtils } from '@/utils/common';
import { PaginationProps } from '@pureadmin/table';
import dayjs from 'dayjs';
import { Sort } from 'element-plus/es/components';
import { reactive } from 'vue';
import { toRaw } from 'vue';
import { h } from 'vue';
import { ref } from 'vue';

const tableRef = ref();
const dataList = ref([]);
const pagination: PaginationProps = {
  total: 0,
  pageSize: 10,
  currentPage: 1,
  background: true
};
const defaultSort: Sort = {
  prop: "createTime",
  order: "descending"
};

const pageLoading = ref(true);
const sortState = ref<Sort>(defaultSort);
const columns: TableColumnList = [
  {
    label: "序号",
    prop: "detectionId"
  },
  {
    label: "描述",
    prop: "environment",
    cellRenderer: row => {
      return h(
        "span",
        row.row?.environment?.description +
          "--" +
          row.row?.environment?.unitName
      );
    }
  },
   {
    label: "类型",
    prop: "type"
  },
  {
    label: "位号",
    prop: "environment.tag"
  },
  {
    label: "数值",
    prop: "currentValue",
    slot: "currentValue"
  },
  {
    label: "本月使用量",
    prop: "totalValue",
  },
  {
    label: "时间",
    prop: "createTime",
    slot: "createTime"
  }
];
const searchFormParams = reactive<detectionListRes>({
  // description: "",
  // tag: ""
});

const archiveListFun = async () => {
  pageLoading.value = true;

  CommonUtils.fillSortParams(searchFormParams, sortState.value);
  CommonUtils.fillPaginationParams(searchFormParams, pagination);

  const { data } = await detectionList(toRaw(searchFormParams)).finally(() => {
    pageLoading.value = false;
  });
  dataList.value = data.rows;
  pagination.total = data.total;
};

// 修改 getValueColorClass 方法
const getValueColorClass = row => {
  const value = row.value;
  const alarmLevels = row.environment?.alarmlevels || [];

  for (const level of alarmLevels) {
    if (value >= level.min && value <= level.max) {
      switch (level.level) {
        case "一级":
        case "紧急":
          return "text-urgent";
        case "二级":
        case "重要":
          return "text-important";
        case "三级":
        case "中度":
          return "text-warning";
        case "四级":
        case "一般":
          return "text-info";
        case "五级":
        case "轻微":
          return "text-success";
        default:
          return "";
      }
    }
  }
  return "text-info"; // 默认颜色
};
</script>

<template>
  <div>



   <PureTableBar
      title="能耗监测列表"
      :columns="columns"
      :tableRef="tableRef?.getTableRef()"
    >
      <!-- <template #buttons>
        <el-button type="primary" @click="analyzeFormModalClick"
          >环境数据分析</el-button
        >
      </template> -->

      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          ref="tableRef"
          adaptive
          :adaptiveConfig="{ offsetBottom: 32 }"
          align-whole="center"
          row-key="policiesId"
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
          <template #currentValue="{ row }">
            <span :class="getValueColorClass(row)">{{ row.currentValue }}</span>
          </template>
          <template #createTime="{ row }">
            <span>{{
              dayjs(row.createTime).format("YYYY-MM-DD HH:mm:ss")
            }}</span>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
  </div>
</template>

<style scoped>

</style>
