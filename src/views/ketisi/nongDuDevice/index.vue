<script lang="ts" setup>
import { NongDuDeviceListReq } from "@/api/nongDuDevice/types";
import { onMounted, reactive, ref, toRaw } from "vue";
import { Download, Plus, Refresh, Search } from "@element-plus/icons-vue";
import { dayjs, Sort } from "element-plus";
import { CommonUtils } from "@/utils/common";
import { exportNongDuDevice, nongDuDeviceList } from "@/api/nongDuDevice";
import { PaginationProps } from "@pureadmin/table";
import { PureTableBar } from "@/components/RePureTableBar";
import addEditFormModal from "./addEdit-form-modal.vue";
import detailFormModal from "./detai-form-modal.vue";
import { ExportDownload } from "@/utils/exportdownload";

const tableRef = ref();
const searchFormParams = reactive<NongDuDeviceListReq>({
  pageNum: 1,
  pageSize: 10,
  deviceSn: "",
  area: "",
  online: "",
  workStatus: ""
});
const defaultSort: Sort = {
  prop: "createTime",
  order: "descending"
};
const pageLoading = ref(true);
const sortState = ref<Sort>(defaultSort);
const dataList = ref([]);
const searchFormRef = ref();
const pagination: PaginationProps = {
  total: 0,
  pageSize: 10,
  currentPage: 1,
  background: true
};

const columns: TableColumnList = [
  {
    type: "selection",
    align: "left"
  },
  {
    label: "设备编号",
    prop: "deviceSn"
  },
  {
    label: "设备名称",
    prop: "name"
  },
  {
    label: "所属区域",
    prop: "area"
  },
  {
    label: "在线状态",
    prop: "isOnlineStr"
  },
  {
    label: "工作状态",
    prop: "workStatus"
  },
  {
    label: "末次通讯时间",
    prop: "lastTimeStr"
  },
  {
    label: "操作",
    fixed: "right",
    width: 200,
    slot: "operation"
  }
];

const archiveListFun = async () => {
  pageLoading.value = true;

  CommonUtils.fillSortParams(searchFormParams, sortState.value);
  CommonUtils.fillPaginationParams(searchFormParams, pagination);
  // @ts-expect-error
  const { data } = await nongDuDeviceList(toRaw(searchFormParams)).finally(
    () => {
      pageLoading.value = false;
    }
  );
  dataList.value = data.rows;
  pagination.total = data.total;
};

//重置
function resetForm() {
  searchFormParams.area = "";
  searchFormParams.deviceSn = "";
  searchFormParams.beginTime = undefined;
  searchFormParams.endTime = undefined;
  searchFormParams.online = "";
  searchFormParams.workStatus = "";

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

const opType = ref<"add" | "edit">("add");
const modalVisible = ref(false);
const opRow = ref();
function openDialog(type: "add" | "edit", row?) {
  opType.value = type;
  modalVisible.value = true;
  opRow.value = row;
}

const detailVisible = ref(false);
const detailRow = ref();
function openDetailDialog(row) {
  detailRow.value = row.deviceSn;
  detailVisible.value = true;
}

const multipleSelection = ref([]);
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

  exportNongDuDevice(
    toRaw({ ...searchFormParams, nongDuDeviceIds: multipleSelection.value })
  ).then(res => {
    ExportDownload(res, "采样设备列表");
  });
};
onMounted(() => {
  archiveListFun();
});
</script>

<template>
  <div class="main">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="searchFormParams"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
    >
      <el-form-item label="设备状态：">
        <el-select v-model="searchFormParams.online">
          <el-option label="在线" :value="'在线'" />
          <el-option label="离线" :value="'离线'" />
        </el-select>
      </el-form-item>

      <el-form-item label="工作状态：">
        <el-select v-model="searchFormParams.workStatus">
          <el-option label="空闲" :value="'0'" />
          <el-option label="采样" :value="'1'" />
          <el-option label="采样完成" :value="'2'" />
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
      title="采样设备列表"
      :columns="columns"
      :tableRef="tableRef?.getTableRef()"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button type="primary" :icon="Plus" @click="openDialog('add')"
          >新增</el-button
        >
        <el-button type="warning" :icon="Download" @click="exportClick"
          >导出</el-button
        >
      </template>

      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          @selection-change="
            rows => (multipleSelection = rows.map(item => item.nongDuDeviceId))
          "
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
              @click="openDialog('edit', row)"
            >
              修改
            </el-button>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
    <addEditFormModal
      v-model="modalVisible"
      :type="opType"
      :row="opRow"
      @success="onSearch(tableRef)"
    />
    <detailFormModal v-model="detailVisible" :row="detailRow" />
  </div>
</template>

<style scoped></style>
