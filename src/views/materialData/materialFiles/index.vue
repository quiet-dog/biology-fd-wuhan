<template>
  <div class="main">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="searchFormParams"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
    >
      <el-form-item label="物料名称：">
        <el-input
          class="!w-[200px]"
          placeholder="请输入物料名称"
          clearable
          v-model="searchFormParams.name"
        />
      </el-form-item>
      <el-form-item label="物料类型：">
        <el-input
          class="!w-[200px]"
          placeholder="请输入物料类型"
          clearable
          v-model="searchFormParams.materialsType"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="archiveListFun">搜索</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
    <PureTableBar
      title="物料档案列表"
      :columns="columns"
      :tableRef="tableRef?.getTableRef()"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button type="primary" @click="analyzeFormModalClick"
          >库存分析</el-button
        >
        <el-button type="success" :icon="Upload" @click="openImportDialog"
          >导入</el-button
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
              @click="thresholdSettingClick(row)"
            >
              阈值设置
            </el-button>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
    <policiesArchivesFormModal v-model="modalVisible" :row="opRow" />
    <detailFromModal ref="detailFromModalRef" />
    <importFormModal ref="importRef" @refresh="archiveListFun" />
    <analyzeFormModal ref="analyzeFormModalRef" @refresh="archiveListFun" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive, toRaw, h } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { PaginationProps } from "@pureadmin/table";
import {
  materialFilesListRes,
  materialFilesList
} from "@/api/materialData/materialFiles";
import detailFromModal from "./detail-from-modal.vue";
import importFormModal from "./import-form-modal.vue";
import { Sort } from "element-plus";
import { CommonUtils } from "@/utils/common";
import { Upload } from "@element-plus/icons-vue";
import policiesArchivesFormModal from "./policiesArchives-form-modal.vue";
import analyzeFormModal from "./analyze-from-modal.vue";

const tableRef = ref();
const columns: TableColumnList = [
  {
    label: "物料编号",
    prop: "code"
  },
  {
    label: "物料名称",
    prop: "name"
  },
  {
    label: "物料类型",
    prop: "type"
  },
  {
    label: "物料标签",
    prop: "tag"
  },
  {
    label: "库存量",
    prop: "stock"
  },
  {
    label: "当前入库量",
    prop: "lastStock"
  },
  {
    label: "物料单位",
    prop: "unit"
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
  order: "ascending"
};

const pageLoading = ref(true);
const dataList = ref([]);
const sortState = ref<Sort>(defaultSort);

const searchFormRef = ref();
const searchFormParams = reactive<materialFilesListRes>({
  name: "",
  materialsType: ""
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

  const { data } = await materialFilesList(toRaw(searchFormParams)).finally(
    () => {
      pageLoading.value = false;
    }
  );
  dataList.value = data.rows;
  pagination.total = data.total;
};

function resetForm() {
  searchFormParams.name = "";
  searchFormParams.materialsType = "";

  // 重置 pagination 中的属性
  pagination.total = 0;
  pagination.pageSize = 10;
  pagination.currentPage = 1;
  pagination.background = true;
  archiveListFun();
}

const detailFromModalRef = ref();
const openDetailDialog = row => {
  detailFromModalRef.value.handleOpened(row.materialsId);
};

//报警频次分析
const analyzeFormModalRef = ref();
const analyzeFormModalClick = () => {
  analyzeFormModalRef.value.handleOpened();
};

const modalVisible = ref(false);
const opRow = ref();
const thresholdSettingClick = row => {
  opRow.value = row;
  modalVisible.value = true;
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

onMounted(() => {
  archiveListFun();
});

defineOptions({
  name: "processNode"
});
</script>

<style lang="scss" scoped></style>
