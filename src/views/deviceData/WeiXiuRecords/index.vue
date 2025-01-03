<template>
  <div class="main">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="searchFormParams"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
    >
      <el-form-item label="设备编号：">
        <el-input
          class="!w-[200px]"
          v-model="searchFormParams.equipmentCode"
          placeholder="请输入设备编号"
          clearable
        />
      </el-form-item>
      <el-form-item label="维修日期：">
        <el-date-picker
          class="!w-[240px]"
          v-model="timeRange"
          type="daterange"
          range-separator="~"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>
      <el-form-item label="维修人员：">
        <el-input
          class="!w-[200px]"
          v-model="searchFormParams.repairPersonnel"
          placeholder="请输入维修人员"
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
      title="维修记录"
      :columns="columns"
      :tableRef="tableRef?.getTableRef()"
      @refresh="onSearch"
    >
      <template #buttons>
        <!-- <el-button type="success" :icon="Upload" @click="openImportDialog">
          导入
        </el-button> -->
        <el-button type="primary" :icon="Plus" @click="openDialog"
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
          <template #repairDate="{ row }">
            <span>{{ dayjs(row.repairDate).format("YYYY-MM-DD") }}</span>
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
          </template>
        </pure-table>
      </template>
    </PureTableBar>
    <policiesArchivesFormModal
      v-model="modalVisible"
      @success="onSearch(tableRef)"
    />
    <detailFromModal ref="detailRef" />
    <importFormModal ref="importRef" @refresh="archiveListFun" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive, toRaw, computed } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { PaginationProps } from "@pureadmin/table";
import {
  equipmentRepairListRes,
  equipmentRepairList,
  equipmentRepairRes
} from "@/api/deviceData/WeiXiuRecords";
import policiesArchivesFormModal from "./policiesArchives-form-modal.vue";
import detailFromModal from "./detail-from-modal.vue";
import { Sort } from "element-plus";
import { CommonUtils } from "@/utils/common";
import { Plus, Refresh, Search, Upload } from "@element-plus/icons-vue";
import importFormModal from "./import-form-modal.vue";
import dayjs from "dayjs";

const tableRef = ref();
const columns: TableColumnList = [
  {
    label: "维修编号",
    prop: "recordId"
  },
  {
    label: "设备编号",
    prop: "equipment.equipmentCode"
  },
  {
    label: "维修日期",
    prop: "repairDate",
    slot: "repairDate"
  },
  {
    label: "维修内容",
    prop: "repairContent"
  },
  {
    label: "维修人员",
    prop: "repairPersonnel"
  },
  {
    label: "维修结果",
    prop: "repairResult"
  },
  {
    label: "维修费用",
    prop: "repairCost"
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
    if (searchFormParams.startRepairDate && searchFormParams.endRepairDate) {
      return [searchFormParams.startRepairDate, searchFormParams.endRepairDate];
    } else {
      return null;
    }
  },
  set(v) {
    if (v?.length === 2) {
      searchFormParams.startRepairDate = v[0];
      searchFormParams.endRepairDate = v[1];
    } else {
      searchFormParams.startRepairDate = undefined;
      searchFormParams.endRepairDate = undefined;
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
const searchFormParams = reactive<equipmentRepairListRes>({
  equipmentCode: "",
  repairPersonnel: "",
  startRepairDate: undefined,
  endRepairDate: undefined
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

  const { data } = await equipmentRepairList(toRaw(searchFormParams)).finally(
    () => {
      pageLoading.value = false;
    }
  );
  dataList.value = data.rows;
  pagination.total = data.total;
};

function resetForm() {
  searchFormParams.equipmentCode = "";
  searchFormParams.repairPersonnel = "";
  searchFormParams.startRepairDate = undefined;
  searchFormParams.endRepairDate = undefined;

  // 重置 pagination 中的属性
  pagination.total = 0;
  pagination.pageSize = 10;
  pagination.currentPage = 1;
  pagination.background = true;
  archiveListFun();
}
const modalVisible = ref(false);
function openDialog() {
  modalVisible.value = true;
}

const detailRef = ref();
const openDetailDialog = (row: equipmentRepairRes) => {
  detailRef.value.handleOpened(row.recordId);
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
