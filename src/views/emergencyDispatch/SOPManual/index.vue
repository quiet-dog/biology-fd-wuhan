<template>
  <div class="main">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="searchFormParams"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
    >
      <el-form-item label="SOP名称：">
        <el-input
          class="!w-[200px]"
          placeholder="请输入SOP名称"
          clearable
          v-model="searchFormParams.name"
        />
      </el-form-item>
      <el-form-item label="适用范围：">
        <el-input
          class="!w-[200px]"
          placeholder="请输入适用范围"
          clearable
          v-model="searchFormParams.scope"
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
      title="SOP手册"
      :columns="columns"
      :tableRef="tableRef?.getTableRef()"
      @refresh="onSearch"
    >
      <template #buttons>
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
          <template #isHighRisk="{ row }">
            <span>{{ row.isHighRisk ? "是" : "否" }}</span>
          </template>

          <template #updateTime="{ row }">
            <span>{{
              row.updateTime ? dayjs(row.updateTime).format("YYYY-MM-DD") : "-"
            }}</span>
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

            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              @click="openDialog('update', row)"
            >
              修改
            </el-button>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
    <sopManualFormModal
      v-model="modalVisible"
      :type="opType"
      :row="opRow"
      @success="onSearch(tableRef)"
    />

    <detailFromModal ref="detailFromModalRef" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive, toRaw } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { PaginationProps } from "@pureadmin/table";
import {
  sopListRes,
  sopList,
  addsopRes,
  renewsopRes
} from "@/api/emergencyDispatch/SOPManual";
import sopManualFormModal from "./sopManual-form-modal.vue";
import detailFromModal from "./detail-from-modal.vue";
import { Sort } from "element-plus";
import { CommonUtils } from "@/utils/common";
import { Plus, Refresh, Search } from "@element-plus/icons-vue";
import dayjs from "dayjs";

const tableRef = ref();
const columns: TableColumnList = [
  {
    label: "SOP编号",
    prop: "sopId"
  },
  {
    label: "SOP名称",
    prop: "name"
  },
  {
    label: "适用范围",
    prop: "scope"
  },
  {
    label: "更新时间",
    prop: "updateTime",
    slot: "updateTime"
  },
  {
    label: "操作",
    slot: "operation",
    fixed: "right",
    width: 200
  }
];

const defaultSort: Sort = {
  prop: "createTime",
  order: "descending"
};

const pageLoading = ref(true);
const dataList = ref([]);

const searchFormRef = ref();
const sortState = ref<Sort>(defaultSort);
const searchFormParams = reactive<sopListRes>({
  name: "",
  scope: ""
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

  const { data } = await sopList(toRaw(searchFormParams)).finally(() => {
    pageLoading.value = false;
  });
  dataList.value = data.rows;
  pagination.total = data.total;
};

function resetForm() {
  searchFormParams.name = "";
  searchFormParams.scope = "";

  // 重置 pagination 中的属性
  pagination.total = 0;
  pagination.pageSize = 10;
  pagination.currentPage = 1;
  pagination.background = true;
  archiveListFun();
}

const opType = ref<"add" | "update">("add");
const modalVisible = ref(false);
const opRow = ref<addsopRes>();
function openDialog(type: "add" | "update", row?: renewsopRes) {
  opType.value = type;
  opRow.value = row;
  modalVisible.value = true;
}

const detailFromModalRef = ref();
const openDetailDialog = row => {
  detailFromModalRef.value.handleOpened(row.sopId);
};

const onSearch = tableRef => {
  archiveListFun();
  // 点击搜索的时候，需要重置排序，重新排序的时候会重置分页并发起查询请求
  tableRef.getTableRef();
};

onMounted(() => {
  archiveListFun();
});

defineOptions({
  name: "processNode"
});
</script>

<style lang="scss" scoped></style>
