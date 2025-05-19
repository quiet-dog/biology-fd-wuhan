<template>
  <div class="main">
    <el-form ref="searchFormRef" :inline="true" :model="searchFormParams"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]">
      <el-form-item label="姓名：">
        <el-input class="!w-[200px]" placeholder="请输入姓名" clearable v-model="searchFormParams.name" />
      </el-form-item>
      <el-form-item label="部门：">
        <el-input class="!w-[200px]" placeholder="请输入部门" clearable v-model="searchFormParams.department" />
      </el-form-item>
      <el-form-item label="岗位：">
        <el-input class="!w-[200px]" placeholder="请输入岗位" clearable v-model="searchFormParams.post" />
      </el-form-item>
      <el-form-item label="学历：">
        <el-select class="!w-[200px]" placeholder="请选择学历" clearable v-model="searchFormParams.education">
          <el-option label="博士研究生" value="博士研究生" />
          <el-option label="硕士研究生" value="硕士研究生" />
          <el-option label="本科" value="本科" />
          <el-option label="专科" value="专科" />
          <el-option label="高中及以下" value="高中及以下" />
        </el-select>
      </el-form-item>
      <el-form-item label="联系方式：">
        <el-input v-model="searchFormParams.contact" class="!w-[200px]" placeholder="请输入联系方式" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="archiveListFun">搜索</el-button>
        <el-button :icon="Refresh" @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
    <PureTableBar title="人员档案列表" :columns="columns" :tableRef="tableRef?.getTableRef()" @refresh="onSearch">
      <template #buttons>
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
        <pure-table ref="tableRef" adaptive :adaptiveConfig="{ offsetBottom: 32 }" align-whole="center"
          row-key="policiesId" showOverflowTooltip table-layout="auto" :size="size" :columns="dynamicColumns"
          :data="dataList" :pagination="pagination" :paginationSmall="size === 'small' ? true : false"
          @page-size-change="archiveListFun" @page-current-change="archiveListFun" :header-cell-style="{
            background: 'var(--el-table-row-hover-bg-color)',
            color: 'var(--el-text-color-primary)'
          }" @selection-change="
            rows => (multipleSelection = rows.map(item => item.personnelId))
          " style="height: auto">
          <template #entryTime="{ row }">
            <span>{{ dayjs(row.entryTime).format("YYYY-MM-DD") }}</span>
          </template>
          <template #leaveTime="{ row }">
            <span>{{
              row.leaveTime ? dayjs(row.leaveTime).format("YYYY-MM-DD") : "--"
              }}</span>
          </template>
          <template #operation="{ row }">
            <el-button class="reset-margin" link type="primary" :size="size" @click="openDetailDialog(row, false)">
              查看
            </el-button>
            <el-button class="reset-margin" link type="primary" :size="size" @click="openDetailDialog(row, true)">
              修改
            </el-button>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
    <detailFromModal @refresh="archiveListFun" ref="detailFromModalRef"></detailFromModal>
    <importFormModal ref="importRef" @refresh="archiveListFun" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive, toRaw } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { PaginationProps } from "@pureadmin/table";
import {
  personnelListRes,
  personnelList,
  exportPersonnel
} from "@/api/personnelData/personnelProfile";
import detailFromModal from "./detail-from-modal.vue";
import importFormModal from "./import-form-modal.vue";
import { Sort } from "element-plus";
import { CommonUtils } from "@/utils/common";
import { ExportDownload, ExportPdfDownload, ExportWordDownload } from "@/utils/exportdownload";
import { Download, Refresh, Search, Upload } from "@element-plus/icons-vue";
import dayjs from "dayjs";
const tableRef = ref();
const columns: TableColumnList = [
  {
    type: "selection",
    align: "left"
  },
  {
    label: "员工编号",
    prop: "code"
  },
  {
    label: "姓名",
    prop: "name"
  },
  {
    label: "性别",
    prop: "sex"
  },
  {
    label: "部门",
    prop: "department"
  },
  {
    label: "岗位",
    prop: "post"
  },
  {
    label: "学历",
    prop: "education"
  },
  {
    label: "联系方式",
    prop: "contact"
  },
  {
    label: "入职时间",
    prop: "entryTime",
    slot: "entryTime"
  },
  {
    label: "离职时间",
    prop: "leaveTime",
    slot: "leaveTime"
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
const sortState = ref<Sort>(defaultSort);
const searchFormRef = ref();
const searchFormParams = reactive<personnelListRes>({
  name: "",
  department: "",
  post: "",
  education: "",
  contact: "",
  exportType: "excel",
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
  const { data } = await personnelList(toRaw(searchFormParams)).finally(() => {
    pageLoading.value = false;
  });
  dataList.value = data.rows;
  pagination.total = data.total;
};

const exportClick = (type: string) => {
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

  exportPersonnel(
    toRaw({ ...searchFormParams, personnelIds: multipleSelection.value,exportType: type })
  ).then(res => {
    if (type == "pdf") {
      ExportPdfDownload(res, "人员档案");
    } else if (type == "word") {
      ExportWordDownload(res, "人员档案");
    } else {
      ExportDownload(res, "人员档案");
    }
  });
};

// 详情弹窗
const detailFromModalRef = ref();
const openDetailDialog = (row, isEdit) => {
  detailFromModalRef.value.handleOpened(row.personnelId, isEdit);
};
const onSearch = tableRef => {
  archiveListFun();
  // 点击搜索的时候，需要重置排序，重新排序的时候会重置分页并发起查询请求
  tableRef.getTableRef();
};

function resetForm() {
  searchFormParams.name = "";
  searchFormParams.department = "";
  searchFormParams.post = "";
  searchFormParams.education = "";
  searchFormParams.contact = "";

  // 重置 pagination 中的属性
  pagination.total = 0;
  pagination.pageSize = 10;
  pagination.currentPage = 1;
  pagination.background = true;
  archiveListFun();
}

const importRef = ref();
function openImportDialog() {
  importRef.value.handleOpened();
}

onMounted(() => {
  archiveListFun();
});

defineOptions({
  name: "processNode"
});
</script>

<style lang="scss" scoped></style>
