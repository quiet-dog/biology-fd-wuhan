<script lang='ts' setup>
import { onMounted, reactive, ref, toRaw } from 'vue';
import { PureTableBar } from "@/components/RePureTableBar";
import { Download, Refresh, Search, Upload } from "@element-plus/icons-vue";
import { CommonUtils } from '@/utils/common';
import { dayjs, Sort } from 'element-plus';
import { PaginationProps } from '@pureadmin/table';
import { DoorEventQuery, editDoor, getDoorEventList } from '@/api/door/door';
import importFormModal from "./import-form-modal.vue";

defineOptions({
  name: "chuqin"
});

const searchFormParams = reactive<DoorEventQuery>({
  name: "",
  // doorDate: dayjs().startOf("day").valueOf(),
  beginTime: dayjs().startOf("day").format("YYYY-MM-DD"),
  endTime: dayjs().endOf("day").format("YYYY-MM-DD"),
});

const columns: TableColumnList = [
  {
    label: "员工编号",
    prop: "code",
  },
  {
    label: "姓名",
    prop: "name",
  },
  {
    label: "性别",
    prop: "sex",
  },
  {
    label: "部门",
    prop: "department",
  },
  {
    label: "是否出勤",
    prop: "enterStatus",
    slot: "enterStatus",
  },
  {
    label: "出勤时间",
    prop: "doorDate",
    slot: "doorDate",
  }
];
const defaultSort: Sort = {
  prop: "createTime",
  order: "descending"
};


const tableRef = ref();
const pageLoading = ref(true);
const sortState = ref<Sort>(defaultSort);
const dataList = ref([]);
const pagination: PaginationProps = {
  total: 0,
  pageSize: 10,
  currentPage: 1,
  // background: true
};

const onSearch = tableRef => {
  archiveListFun();
  // 点击搜索的时候，需要重置排序，重新排序的时候会重置分页并发起查询请求
  tableRef.getTableRef();
};

const archiveListFun = async () => {
  pageLoading.value = true;

  CommonUtils.fillSortParams(searchFormParams, sortState.value);
  CommonUtils.fillPaginationParams(searchFormParams, pagination);
  const { data } = await getDoorEventList(toRaw(searchFormParams)).finally(() => {
    pageLoading.value = false;
  });
  dataList.value = data.rows;
  pagination.total = data.total;
};

function resetForm() {
  searchFormParams.name = "";
  // searchFormParams.department = "";
  // searchFormParams.post = "";
  // searchFormParams.education = "";
  // searchFormParams.contact = "";

  // 重置 pagination 中的属性
  pagination.total = 0;
  pagination.pageSize = 10;
  pagination.currentPage = 1;
  pagination.background = true;
  archiveListFun();
}

const changeStatus = (status, row) => {
  if (status) {
    row.enterStatus = "通行";
    row.doorDate = dayjs().valueOf();;
  } else {
    row.enterStatus = "";
    row.doorDate = 0;
  }

  editDoor(row).then(res => {
    if (res.code == 200) {
      archiveListFun();
    }
  });
};

const changeDatePicker = (val) => {
  searchFormParams.beginTime = dayjs(val).startOf("day").format("YYYY-MM-DD");
  searchFormParams.endTime = dayjs(val).endOf("day").format("YYYY-MM-DD");
};

const importRef = ref();
function openImportDialog() {
  importRef.value.handleOpened();
}

onMounted(() => {
  archiveListFun();
})
</script>

<template>
  <div class="main">
    <el-form ref="searchFormRef" :inline="true" :model="searchFormParams"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]">
      <el-form-item label="姓名：">
        <el-input class="!w-[200px]" placeholder="请输入姓名" clearable v-model="searchFormParams.name" />
      </el-form-item>
      <el-form-item label="出勤时间：">
        <el-date-picker @change="changeDatePicker" v-model="searchFormParams.doorDate" type="date" format="[Week] ww" placeholder="请选择日期" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="archiveListFun">搜索</el-button>
        <el-button :icon="Refresh" @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>

    <PureTableBar title="出勤列表" :columns="columns" :tableRef="tableRef?.getTableRef()" @refresh="onSearch">
      <template #buttons>
        <el-button type="success" :icon="Upload" @click="openImportDialog">
          导入
        </el-button>
        <!-- <el-button type="warning" :icon="Download" @click="exportClick"
          >导出</el-button
        > -->
      </template>
      <template v-slot="{ size, dynamicColumns }">
        <pure-table ref="tableRef" adaptive :adaptiveConfig="{ offsetBottom: 32 }" align-whole="center"
          row-key="chuQinId" showOverflowTooltip table-layout="auto" :size="size" :columns="dynamicColumns"
          :data="dataList" :pagination="pagination" :paginationSmall="size === 'small' ? true : false"
          @page-size-change="archiveListFun" @page-current-change="archiveListFun" :header-cell-style="{
            background: 'var(--el-table-row-hover-bg-color)',
            color: 'var(--el-text-color-primary)'
          }" style="height: auto">
          <template #enterStatus="{ row }">
            <el-checkbox v-model="row.isChuQin" @change="(status)=>changeStatus(status,row)" :label="row.enterStatus === '通行' ? '是':'否'" size="large" />
          </template>
          <template #doorDate="{ row }">
            <span>{{ row.doorDate != 0 && row.doorDate != null ? dayjs(row.doorDate).format("YYYY-MM-DD HH:MM:ss") : ""
              }}</span>
          </template>

        </pure-table>
      </template>
    </PureTableBar>
    <importFormModal ref="importRef" @refresh="archiveListFun" />
  </div>
</template>

<style scoped></style>
