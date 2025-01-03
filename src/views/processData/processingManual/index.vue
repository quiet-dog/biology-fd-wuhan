<template>
  <div class="main">
    <el-form
      :inline="true"
      ref="searchFormRef"
      :model="searchFormParams"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
    >
      <el-form-item label="工艺名称：">
        <el-input
          class="!w-[200px]"
          placeholder="请输入工艺名称"
          clearable
          v-model="searchFormParams.craftName"
        />
      </el-form-item>
      <el-form-item label="工艺节点：">
        <el-input
          class="!w-[200px]"
          placeholder="请输入工艺节点"
          clearable
          v-model="searchFormParams.craftNode"
        />
      </el-form-item>
      <el-form-item label="责任划分：">
        <el-input
          class="!w-[200px]"
          placeholder="请输入责任划分"
          clearable
          v-model="searchFormParams.responsibilityDivision"
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
      title="处置手册列表"
      :columns="columns"
      :tableRef="tableRef?.getTableRef()"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button type="success" :icon="Upload" @click="openImportDialog">
          导入
        </el-button>
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
    <processingManualFormModal
      v-model="modalVisible"
      :type="opType"
      :row="opRow"
      @success="onSearch(tableRef)"
    />

    <detailFromModal ref="detailFromModalRef" />
    <importFormModal ref="importRef" @refresh="archiveListFun" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive, toRaw } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { PaginationProps } from "@pureadmin/table";
import {
  manualListRes,
  manualList,
  addmanualRes,
  renewmanualRes
} from "@/api/processData/processingManual";
import { message } from "@/utils/message";
import processingManualFormModal from "./processingManual-form-modal.vue";
import detailFromModal from "./detail-from-modal.vue";
import { Sort } from "element-plus";
import { CommonUtils } from "@/utils/common";
import { Plus, Refresh, Search, Upload } from "@element-plus/icons-vue";
import importFormModal from "./import-form-modal.vue";

const tableRef = ref();
const columns: TableColumnList = [
  {
    label: "处置编号",
    prop: "craftDisposeManualId"
  },
  {
    label: "所属工艺",
    prop: "craftArchive.craftArchiveName"
  },
  {
    label: "工艺节点",
    prop: "craftNode.nodeName"
  },
  {
    label: "发生问题",
    prop: "problemDescription"
  },
  {
    label: "责任划分",
    prop: "responsibilityDivision"
  },
  {
    label: "所需时间",
    prop: "requiredTime",
    slot: "requiredTime"
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
const sortState = ref<Sort>(defaultSort);
const dataList = ref([]);

const searchFormRef = ref();
const searchFormParams = reactive<manualListRes>({
  craftNode: "",
  craftName: "",
  responsibilityDivision: ""
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

  const { data } = await manualList(toRaw(searchFormParams)).finally(() => {
    pageLoading.value = false;
  });
  dataList.value = data.rows;
  pagination.total = data.total;
};

const opType = ref<"add" | "update">("add");
const modalVisible = ref(false);
const opRow = ref<addmanualRes>();
function openDialog(type: "add" | "update", row?: renewmanualRes) {
  opType.value = type;
  opRow.value = row;
  modalVisible.value = true;
}

const detailFromModalRef = ref();
const openDetailDialog = row => {
  detailFromModalRef.value.handleOpened(row.craftDisposeManualId);
};

//导入
const importRef = ref();
const openImportDialog = () => {
  importRef.value.handleOpened();
};

const onSearch = tableRef => {
  archiveListFun();
  // 点击搜索的时候，需要重置排序，重新排序的时候会重置分页并发起查询请求
  tableRef.getTableRef();
};

const resetForm = () => {
  searchFormParams.craftNode = "";
  searchFormParams.craftName = "";
  searchFormParams.responsibilityDivision = null;

  pagination.total = 0;
  pagination.pageSize = 10;
  pagination.currentPage = 1;
  pagination.background = true;
  archiveListFun();
};

onMounted(() => {
  archiveListFun();
});

defineOptions({
  name: "processNode"
});
</script>

<style lang="scss" scoped></style>
