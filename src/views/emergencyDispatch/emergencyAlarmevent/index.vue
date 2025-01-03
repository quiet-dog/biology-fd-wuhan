<template>
  <div class="main">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="searchFormParams"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
    >
      <el-form-item label="事件名称：">
        <el-input
          class="!w-[200px]"
          placeholder="请输入事件名称"
          clearable
          v-model="searchFormParams.eventName"
        />
      </el-form-item>
      <el-form-item label="处理人员：">
        <el-input
          class="!w-[200px]"
          placeholder="请输入处理人员"
          clearable
          v-model="searchFormParams.handlerName"
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
      title="报警事件列表"
      :columns="columns"
      :tableRef="tableRef?.getTableRef()"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button type="primary" :icon="Plus" @click="openDialog('add')"
          >新增</el-button
        >
        <el-button type="warning" :icon="Download" @click="exportClick">
          报告导出
        </el-button>
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
          <template #handlers="{ row }">
            <span v-for="item in row.handlers">{{ item.name }}</span>
          </template>
          <template #type="{ row }">
            {{ row.type ?? "--" }}
          </template>
          <template #operation="{ row }">
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              @click="detailsClcik(row)"
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
    <detailFormModal ref="detailForModalRef" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive, toRaw } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { PaginationProps } from "@pureadmin/table";
import {
  emergencyEventListRes,
  emergencyEventList,
  exportAlarmEvents
} from "@/api/emergencyDispatch/emergencyAlarmevent";
import { ExportDownload } from "@/utils/exportdownload";
import addEditFormModal from "./addEdit-form-modal.vue";
import detailFormModal from "./detail-from-modal.vue";
import { Sort } from "element-plus";
import { CommonUtils } from "@/utils/common";
import { Plus, Refresh, Search, Download } from "@element-plus/icons-vue";

const tableRef = ref();
const columns: TableColumnList = [
  {
    type: "selection",
    align: "left"
  },
  {
    label: "事件编号",
    prop: "emergencyEventId"
  },
  {
    label: "事件名称",
    prop: "eventName"
  },
  {
    label: "事件类型",
    prop: "type",
    slot: "type"
  },
  {
    label: "处理人员",
    prop: "handlers",
    slot: "handlers"
  },
  {
    label: "事件内容",
    prop: "content"
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

const searchFormParams = reactive<emergencyEventListRes>({
  eventName: "",
  handlerName: ""
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

  const { data } = await emergencyEventList(toRaw(searchFormParams)).finally(
    () => {
      pageLoading.value = false;
    }
  );
  dataList.value = data.rows;
  pagination.total = data.total;
};

const opType = ref<"add" | "update">("add");
const modalVisible = ref(false);
function openDialog(type: "add" | "update") {
  opType.value = type;
  modalVisible.value = true;
}

const detailForModalRef = ref();
const detailsClcik = row => {
  detailForModalRef.value.handleOpened(row.emergencyEventId);
};

const multipleSelection = ref([]);

// 导出
const exportClick = () => {
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

  exportAlarmEvents(
    toRaw({ ...searchFormParams, eventIds: multipleSelection.value })
  ).then(res => {
    console.log(res);
    ExportDownload(res, "报警事件列表");
  });
};

const onSearch = tableRef => {
  archiveListFun();
  // 点击搜索的时候，需要重置排序，重新排序的时候会重置分页并发起查询请求
  tableRef.getTableRef();
};

function resetForm() {
  searchFormParams.eventName = "";
  searchFormParams.handlerName = "";

  // 重置 pagination 中的属性
  pagination.total = 0;
  pagination.pageSize = 10;
  pagination.currentPage = 1;
  pagination.background = true;
  archiveListFun();
}

onMounted(() => {
  archiveListFun();
});

defineOptions({
  name: "emergencyAlarmevent"
});
</script>

<style lang="scss" scoped></style>
