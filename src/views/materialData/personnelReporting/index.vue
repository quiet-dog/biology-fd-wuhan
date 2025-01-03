<template>
  <div class="main">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="searchFormParams"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
    >
      <el-form-item label="上报人姓名：">
        <el-input
          class="!w-[200px]"
          placeholder="请输入上报人姓名"
          clearable
          v-model="searchFormParams.reporterName"
        />
      </el-form-item>
      <el-form-item label="上报日期：">
        <el-date-picker
          class="!w-[240px]"
          type="daterange"
          v-model="timeRange"
          value-format="YYYY-MM-DD"
          range-separator="~"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>
      <el-form-item label="上报类型：">
        <el-select
          class="!w-[200px]"
          placeholder="请选择上报类型"
          clearable
          v-model="searchFormParams.reportType"
        >
          <el-option label="丢失" value="丢失" />
          <el-option label="损坏" value="损坏" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="archiveListFun"
          >搜索</el-button
        >
        <el-button :icon="Refresh" @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
    <PureTableBar
      title="人员上报列表"
      :columns="columns"
      :tableRef="tableRef?.getTableRef()"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button type="primary" @click="analyzeFormModalClick"
          >丢失分析</el-button
        >
        <el-button type="primary" :icon="Plus" @click="openDialog('add')"
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
          <template #userId="{ row }">
            <span>{{ row.reporterInfo.user.jobCode }}</span>
          </template>
          <template #createTime="{ row }">
            <span>{{ dayjs(row.createTime).format("YYYY-MM-DD") }}</span>
          </template>
          <template #isHighRisk="{ row }">
            <span>{{ row.isHighRisk ? "是" : "否" }}</span>
          </template>
          <template #operation="{ row }">
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              @click="openDetailDialog(row)"
            >
              查看
            </el-button>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
    <addEditFormModal
      v-model="modalVisible"
      :type="opType"
      @success="onSearch(tableRef)"
    />
    <detailFromModal ref="detailFromModalRef" />
    <analyzeFormModal ref="analyzeFormModalRef" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive, toRaw, computed } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { PaginationProps } from "@pureadmin/table";
import {
  reportListRes,
  reportList
} from "@/api/materialData/personnelReporting";
import { Sort } from "element-plus";
import { CommonUtils } from "@/utils/common";
import addEditFormModal from "./addEdit-form-modal.vue";
import { Plus, Refresh, Search } from "@element-plus/icons-vue";
import detailFromModal from "./detail-from-modal.vue";
import analyzeFormModal from "./analyze-from-modal.vue";
import dayjs from "dayjs";

const tableRef = ref();
const columns: TableColumnList = [
  {
    label: "上报编号",
    prop: "reportId"
  },
  {
    label: "上报人姓名",
    prop: "reporterInfo.user.postName"
  },
  {
    label: "上报人工号",
    prop: "reporterInfo.user.jobCode",
    slot: "userId"
  },
  {
    label: "所属部门",
    prop: "reporterInfo.user.deptName"
  },
  {
    label: "物料编号",
    prop: "materialsInfo.code"
  },
  {
    label: "物料名称",
    prop: "materialsInfo.name"
  },
  {
    label: "上报日期",
    prop: "createTime",
    slot: "createTime"
  },
  {
    label: "上报类型",
    prop: "reportType"
  },
  {
    label: "物料数量",
    prop: "reportNum"
  },
  {
    label: "物料单位",
    prop: "materialsInfo.unit"
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
    if (searchFormParams.beginTime && searchFormParams.endTime) {
      return [searchFormParams.beginTime, searchFormParams.endTime];
    } else {
      return null;
    }
  },
  set(v) {
    if (v?.length === 2) {
      searchFormParams.beginTime = v[0];
      searchFormParams.endTime = v[1];
    } else {
      searchFormParams.beginTime = undefined;
      searchFormParams.endTime = undefined;
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
const searchFormParams = reactive<reportListRes>({
  reporterName: "",
  reportType: "",
  pageNum: 1,
  pageSize: 10
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
  const { data } = await reportList(toRaw(searchFormParams)).finally(() => {
    pageLoading.value = false;
  });
  dataList.value = data.rows;
  pagination.total = data.total;
};

const opType = ref<"add">("add");
const modalVisible = ref(false);
function openDialog(type: "add") {
  opType.value = type;
  modalVisible.value = true;
}

const detailFromModalRef = ref();
const openDetailDialog = row => {
  detailFromModalRef.value.handleOpened(row.reportId);
};

//丢失分析
const analyzeFormModalRef = ref();
const analyzeFormModalClick = () => {
  analyzeFormModalRef.value.handleOpened();
};

//重置
function resetForm() {
  searchFormParams.reporterName = "";
  searchFormParams.reportType = "";
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

onMounted(() => {
  archiveListFun();
});

defineOptions({
  name: "personnelReporting"
});
</script>

<style lang="scss" scoped></style>
