<template>
  <div class="main">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="searchFormParams"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
    >
      <el-form-item label="工艺名称：">
        <el-input
          class="!w-[200px]"
          v-model="searchFormParams.craftArchiveName"
          placeholder="请输入工艺名称"
          clearable
        />
      </el-form-item>
      <el-form-item label="版本：">
        <el-input
          class="!w-[200px]"
          v-model="searchFormParams.version"
          placeholder="请输入版本"
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
      title="工艺档案"
      :columns="columns"
      :tableRef="tableRef?.getTableRef()"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button type="primary" :icon="Plus" @click="openDialog('add')">
          新增
        </el-button>
        <el-button type="success" :icon="Upload" @click="openImportDialog">
          导入
        </el-button>
        <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>
        <el-dropdown>
          <el-button type="warning" :icon="Download" >导出</el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="exportClick('excel')">excel</el-dropdown-item>
              <el-dropdown-item @click="exportClick('word')">word</el-dropdown-item>
              <el-dropdown-item @click="exportClick('pdf')">pdf</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
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
          @selection-change="
            rows => (multipleSelection = rows.map(item => item.craftArchiveId))
          "
          style="height: auto"
        >
          <template #createDate="{ row }">
            <span>{{ dayjs(row.createDate).format("YYYY-MM-DD") }}</span>
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
    <policiesArchivesFormModal
      v-model="modalVisible"
      :type="opType"
      :row="opRow"
      @success="onSearch(tableRef)"
    />
    <detailFromModal ref="detailRef"></detailFromModal>
    <importFormModal
      ref="importRef"
      @refresh="archiveListFun"
    ></importFormModal>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive, toRaw } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { PaginationProps } from "@pureadmin/table";
import {
  archiveListRes,
  archiveList,
  exportArchive,
  renewArchiveRes
} from "@/api/processData/processArchives";
import policiesArchivesFormModal from "./policiesArchives-form-modal.vue";
import detailFromModal from "./detail-from-modal.vue";
import { Sort } from "element-plus";
import { CommonUtils } from "@/utils/common";
import { ExportDownload, ExportPdfDownload, ExportWordDownload } from "@/utils/exportdownload";
import importFormModal from "./import-form-modal.vue";
import {
  Plus,
  Upload,
  Download,
  Refresh,
  Search
} from "@element-plus/icons-vue";
import dayjs from "dayjs";

const tableRef = ref();
const columns: TableColumnList = [
  {
    type: "selection",
    align: "left"
  },
  {
    label: "工艺编号",
    prop: "craftArchiveCode"
  },
  {
    label: "工艺名称",
    prop: "craftArchiveName"
  },
  {
    label: "版本",
    prop: "version"
  },
  {
    label: "工艺制定人员",
    prop: "creator"
  },
  {
    label: "创建日期",
    prop: "createDate",
    slot: "createDate"
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
const searchFormParams = reactive<archiveListRes>({
  craftArchiveCode: "",
  craftArchiveName: "",
  version: "",
  ids: [],
  exportType:"pdf",
});
const pagination: PaginationProps = {
  total: 0,
  pageSize: 10,
  currentPage: 1,
  background: true
};
const multipleSelection = ref([]);
const archiveListFun = async () => {
  pageLoading.value = true;

  CommonUtils.fillSortParams(searchFormParams, sortState.value);
  CommonUtils.fillPaginationParams(searchFormParams, pagination);

  const { data } = await archiveList(toRaw(searchFormParams)).finally(() => {
    pageLoading.value = false;
  });
  dataList.value = data.rows;
  pagination.total = data.total;
};

// 导出
const exportClick = (type:string) => {
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

  exportArchive(
    toRaw({ ...searchFormParams, ids: multipleSelection.value,exportType:type })
  ).then(res => {
    if (type == "pdf") {
      ExportPdfDownload(res, "工艺档案");
    } else if (type == "word") {
      ExportWordDownload(res, "工艺档案");
    } else {
      ExportDownload(res, "工艺档案");
    }
  });
};

//重置
function resetForm() {
  searchFormParams.craftArchiveCode = "";
  searchFormParams.craftArchiveName = "";
  searchFormParams.version = "";

  // 重置 pagination 中的属性
  pagination.total = 0;
  pagination.pageSize = 10;
  pagination.currentPage = 1;
  pagination.background = true;
  archiveListFun();
}
const opType = ref<"add" | "update">("add");
const modalVisible = ref(false);
const opRow = ref<renewArchiveRes>();
function openDialog(type: "add" | "update", row?: renewArchiveRes) {
  opType.value = type;
  opRow.value = row;
  modalVisible.value = true;
}

// 详情
const detailRef = ref();
const openDetailDialog = (row: renewArchiveRes) => {
  detailRef.value.handleOpened(row.craftArchiveId);
};

//导入
const importRef = ref();
const openImportDialog = () => {
  importRef.value.handleOpened();
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
