<template>
  <div class="main">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="searchFormParams"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
    >
      <el-form-item label="描述：">
        <el-input
          class="!w-[200px]"
          v-model="searchFormParams.description"
          placeholder="请输入描述"
          clearable
        />
      </el-form-item>
      <el-form-item label="位号：">
        <el-input
          class="!w-[200px]"
          v-model="searchFormParams.tag"
          placeholder="请输入位号"
          clearable
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
      title="环境监测列表"
      :columns="columns"
      :tableRef="tableRef?.getTableRef()"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button type="primary" @click="toAnalyzeFormModalClick"
          >区域环境数据分析</el-button
        >

        <el-button type="primary" @click="analyzeFormModalClick"
          >环境数据分析</el-button
        >
      </template>

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
          <template #value="{ row }">
            <span :class="getValueColorClass(row)">{{ row.value }}</span>
          </template>
          <template #createTime="{ row }">
            <span>{{
              dayjs(row.createTime).format("YYYY-MM-DD HH:mm:ss")
            }}</span>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
    <analyzeFormModal ref="analyzeFormModalRef" />
    <toAnalyzeFormModal ref="toAnalyzeFormModalRef" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive, toRaw, h } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { PaginationProps } from "@pureadmin/table";
import {
  detectionListRes,
  detectionList
} from "@/api/environmentalData/alarmLevelSetting";
import analyzeFormModal from "./analyze-from-modal.vue";
import toAnalyzeFormModal from "./to-analyze-from-modal.vue";
import { Sort } from "element-plus";
import { CommonUtils } from "@/utils/common";
import { Plus, Refresh, Search } from "@element-plus/icons-vue";
import dayjs from "dayjs";

const tableRef = ref();
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
    label: "位号",
    prop: "environment.tag"
  },
  {
    label: "数值",
    prop: "value",
    slot: "value"
  },
  {
    label: "时间",
    prop: "createTime",
    slot: "createTime"
  }
];
const defaultSort: Sort = {
  prop: "createTime",
  order: "descending"
};

const pageLoading = ref(true);
const sortState = ref<Sort>(defaultSort);
const dataList = ref([]);

const searchFormRef = ref();
const searchFormParams = reactive<detectionListRes>({
  description: "",
  tag: ""
});

const pagination: PaginationProps = {
  total: 0,
  pageSize: 10,
  currentPage: 1,
  background: true
};

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

function resetForm() {
  searchFormParams.description = "";
  searchFormParams.tag = "";

  // 重置 pagination 中的属性
  pagination.total = 0;
  pagination.pageSize = 10;
  pagination.currentPage = 1;
  pagination.background = true;
  archiveListFun();
}

//报警频次分析
const analyzeFormModalRef = ref();
const analyzeFormModalClick = () => {
  analyzeFormModalRef.value.handleOpened();
};

const toAnalyzeFormModalRef = ref();
const toAnalyzeFormModalClick = () => {
  toAnalyzeFormModalRef.value.handleOpened();
};


const onSearch = tableRef => {
  archiveListFun();
  // 点击搜索的时候，需要重置排序，重新排序的时候会重置分页并发起查询请求
  tableRef.getTableRef().sort("createTime", "ascending");
};

onMounted(() => {
  archiveListFun();
});
defineOptions({
  name: "processArchives"
});

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

<style lang="scss" scoped>
.text-urgent {
  color: #f53f3f;
}
.text-important {
  color: #ff7d00;
}
.text-warning {
  color: #fadc19;
}
.text-info {
  color: #168cff;
}
.text-success {
  color: #00b42a;
}
</style>
