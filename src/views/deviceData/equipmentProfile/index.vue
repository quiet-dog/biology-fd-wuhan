<template>
  <div class="main">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="searchFormParams"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
    >
      <el-form-item label="设备名称：">
        <el-input
          class="!w-[200px]"
          placeholder="请输入设备名称"
          clearable
          v-model="searchFormParams.equipmentName"
        />
      </el-form-item>
      <el-form-item label="设备型号：">
        <el-input
          class="!w-[200px]"
          placeholder="请输入设备型号"
          clearable
          v-model="searchFormParams.equipmentType"
        />
      </el-form-item>
      <el-form-item label="生产厂家：">
        <el-input
          class="!w-[200px]"
          placeholder="请输入生产厂家"
          clearable
          v-model="searchFormParams.manufacturer"
        />
      </el-form-item>
      <el-form-item label="购置日期：">
        <el-date-picker
          class="!w-[240px]"
          v-model="timeRange"
          type="daterange"
          range-separator="~"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>
      <!-- <el-form-item label="使用状态：">
        <el-select
          class="!w-[200px]"
          placeholder="请选择使用状态"
          clearable
          v-model="searchFormParams.usageStatus"
        >
          <el-option label="使用中" value="使用中" />
          <el-option label="维修中" value="维修中" />
          <el-option label="闲置" value="闲置" />
        </el-select>
      </el-form-item> -->
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="archiveListFun"
          >搜索</el-button
        >
        <el-button :icon="Refresh" @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>

    <PureTableBar
      title="设备档案列表"
      :columns="columns"
      :tableRef="tableRef?.getTableRef()"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button type="success" :icon="Upload" @click="openImportDialog">
          导入
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
          <template #isHighRisk="{ row }">
            <span>{{ row.isHighRisk ? "是" : "否" }}</span>
          </template>
          <template #purchaseDate="{ row }">
            <span>{{ dayjs(row.purchaseDate).format("YYYY-MM-DD") }}</span>
          </template>
          <template #isOnline="{ row }">
            <el-tag :type="row.isOnline ? 'success' : 'danger'">
              {{ row.isOnline ? "在线" : "离线" }}
            </el-tag>
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

    <detailFromModal ref="detailFromModalRef" />
    <importFormModal ref="importRef" @refresh="archiveListFun" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive, computed } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { PaginationProps } from "@pureadmin/table";
import {
  equipmentListRes,
  equipmentList
} from "@/api/deviceData/equipmentProfile";
import detailFromModal from "./detail-from-modal.vue";
import { CommonUtils } from "@/utils/common";
import { Sort } from "element-plus";
import { Plus, Upload, Refresh, Search } from "@element-plus/icons-vue";
import dayjs from "dayjs";
import importFormModal from "./import-form-modal.vue";

const tableRef = ref();
const columns: TableColumnList = [
  {
    label: "设备编号",
    prop: "equipmentCode"
  },
  {
    label: "设备名称",
    prop: "equipmentName"
  },
  {
    label: "设备型号",
    prop: "equipmentType"
  },
  {
    label: "生产厂家",
    prop: "manufacturer"
  },
  {
    label: "购置日期",
    prop: "purchaseDate",
    slot: "purchaseDate"
  },
  {
    label: "安装位置",
    prop: "installationLocation",
    slot: "installationLocation"
  },
  {
    label: "在线状态",
    prop: "isOnline",
    slot: "isOnline"
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
    if (
      searchFormParams.startPurchaseDate &&
      searchFormParams.endPurchaseDate
    ) {
      return [
        searchFormParams.startPurchaseDate,
        searchFormParams.endPurchaseDate
      ];
    } else {
      return null;
    }
  },
  set(v) {
    if (v?.length === 2) {
      searchFormParams.startPurchaseDate = v[0];
      searchFormParams.endPurchaseDate = v[1];
    } else {
      searchFormParams.startPurchaseDate = undefined;
      searchFormParams.endPurchaseDate = undefined;
    }
  }
});

const defaultSort: Sort = {
  prop: "purchaseDate",
  order: "descending"
};

const pageLoading = ref(true);
const dataList = ref([]);
const sortState = ref<Sort>(defaultSort);
const searchFormRef = ref();
const searchFormParams = reactive<equipmentListRes>({
  equipmentName: "",
  manufacturer: "",
  startPurchaseDate: undefined,
  endPurchaseDate: undefined,
  usageStatus: "",
  equipmentType: ""
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
  const { data } = await equipmentList(searchFormParams).finally(() => {
    pageLoading.value = false;
  });
  dataList.value = data.rows;
  pagination.total = data.total;
};

const detailFromModalRef = ref();
const openDetailDialog = row => {
  detailFromModalRef.value.handleOpened(row.equipmentId);
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

//重置
function resetForm() {
  searchFormParams.equipmentName = "";
  searchFormParams.startPurchaseDate = undefined;
  searchFormParams.endPurchaseDate = undefined;
  searchFormParams.manufacturer = "";
  searchFormParams.usageStatus = "";
  searchFormParams.equipmentType = "";

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
  name: "processNode"
});
</script>

<style lang="scss" scoped></style>
