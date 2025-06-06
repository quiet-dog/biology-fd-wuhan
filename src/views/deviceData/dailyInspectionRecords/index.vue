<template>
  <div class="main">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="searchFormParams"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
    >
      <el-form-item label="巡检编号：">
        <el-input
          class="!w-[200px]"
          v-model="searchFormParams.recordId"
          placeholder="请输入巡检编号"
          clearable
        />
      </el-form-item>
      <el-form-item label="巡检日期：">
        <el-date-picker
          class="!w-[240px]"
          v-model="timeRange"
          type="daterange"
          range-separator="~"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
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
      title="日常巡检记录列表"
      :columns="columns"
      :tableRef="tableRef?.getTableRef()"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button type="primary" :icon="Plus" @click="openDialog"
          >新增</el-button
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
          <template #inspectionDate="{ row }">
            <span>{{ dayjs(row.inspectionDate).format("YYYY-MM-DD") }}</span>
          </template>
          <template #operation="{ row }">
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              @click.stop="openDetailDialog(row)"
            >
              查看
            </el-button>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
    <policiesArchivesFormModal
      v-model="modalVisible"
      @success="onSearch(tableRef)"
    />
    <detailFromModal ref="detailRef"></detailFromModal>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive, toRaw, computed } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { PaginationProps } from "@pureadmin/table";
import {
  dailyInspectionRes,
  dailyInspectionList,
  renewDailyInspectionRes
} from "@/api/deviceData/dailyInspectionRecords";
import policiesArchivesFormModal from "./policiesArchives-form-modal.vue";
import detailFromModal from "./detail-from-modal.vue";
import { Sort } from "element-plus";
import { CommonUtils } from "@/utils/common";
import { Plus, Refresh, Search, Upload } from "@element-plus/icons-vue";
import dayjs from "dayjs";

const tableRef = ref();
const columns: TableColumnList = [
  {
    label: "巡检编号",
    prop: "recordId"
  },
  {
    label: "巡检日期",
    prop: "inspectionDate",
    slot: "inspectionDate"
  },
  {
    label: "任务描述",
    prop: "taskDescription"
  },
  {
    label: "巡检人员",
    prop: "inspector"
  },
  {
    label: "异常数",
    prop: "anomalyCount"
  },
  {
    label: "巡检结果",
    prop: "inspectionResult"
  },
  {
    label: "操作",
    slot: "operation",
    fixed: "right",
    width: 200
  }
];

const timeRange = computed<[string, string] | null>({
  get() {
    if (searchFormParams.startDate && searchFormParams.endDate) {
      return [searchFormParams.startDate, searchFormParams.endDate];
    } else {
      return null;
    }
  },
  set(v) {
    if (v?.length === 2) {
      searchFormParams.startDate = v[0];
      searchFormParams.endDate = v[1];
    } else {
      searchFormParams.startDate = undefined;
      searchFormParams.endDate = undefined;
    }
  }
});
const defaultSort: Sort = {
  prop: "createTime",
  order: "descending"
};

const pageLoading = ref(true);
const sortState = ref<Sort>(defaultSort);
const dataList = ref([]);

const searchFormRef = ref();
const searchFormParams = reactive<dailyInspectionRes>({
  recordId: "",
  startDate: undefined,
  endDate: undefined
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

  const { data } = await dailyInspectionList(toRaw(searchFormParams)).finally(
    () => {
      pageLoading.value = false;
    }
  );
  dataList.value = data.rows;
  pagination.total = data.total;
};

function resetForm() {
  searchFormParams.recordId = "";
  searchFormParams.startDate = undefined;
  searchFormParams.endDate = undefined;

  // 重置 pagination 中的属性
  pagination.total = 0;
  pagination.pageSize = 10;
  pagination.currentPage = 1;
  pagination.background = true;
  archiveListFun();
}
const modalVisible = ref(false);
function openDialog() {
  modalVisible.value = true;
}

const detailRef = ref();
const openDetailDialog = (row: renewDailyInspectionRes) => {
  detailRef.value.handleOpened(row.recordId);
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
</script>

<style lang="scss" scoped></style>
