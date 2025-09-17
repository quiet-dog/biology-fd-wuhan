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
          v-model="searchFormParams.equipmentName"
          placeholder="请输入设备名称"
          clearable
        />
      </el-form-item>
      <el-form-item label="设备型号：">
        <el-input
          class="!w-[200px]"
          v-model="searchFormParams.equipmentType"
          placeholder="请输入设备型号"
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
      title="巡检手册"
      :columns="columns"
      :tableRef="tableRef?.getTableRef()"
      @refresh="onSearch"
    >
      <template #buttons>
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
          <template #createTime="{ row }">
            <span>{{ dayjs(row.createTime).format("YYYY-MM-DD") }}</span>
          </template>
          <template #isEnabled="{ row }">
            <el-switch
              v-model="row.isEnabled"
              @change="value => isEnabledChange(value, row)"
            />
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
    <detailFromModal ref="detailRef"></detailFromModal>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive, toRaw } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { PaginationProps } from "@pureadmin/table";
import {
  inspectionManualRes,
  inspectionManualList,
  renewInspectionManualRes,
  renewInspectionManual
} from "@/api/deviceData/JianXiuManual";
import policiesArchivesFormModal from "./policiesArchives-form-modal.vue";
import detailFromModal from "./detail-from-modal.vue";
import { Sort, ElMessage } from "element-plus";
import { CommonUtils } from "@/utils/common";
import { Plus, Refresh, Search } from "@element-plus/icons-vue";
import dayjs from "dayjs";

const tableRef = ref();
const columns: TableColumnList = [
  {
    label: "编号",
    prop: "manualId"
  },
  {
    label: "设备名称",
    prop: "equipment.equipmentName"
  },
  {
    label: "设备型号",
    prop: "equipment.equipmentType"
  },
  {
    label: "适用范围",
    prop: "suitableScope"
  },
  {
    label: "创建日期",
    prop: "createTime",
    slot: "createTime"
  },
  {
    label: "启用/禁用",
    prop: "isEnabled",
    slot: "isEnabled"
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
const searchFormParams = reactive<inspectionManualRes>({
  equipmentName: "",
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

  const { data } = await inspectionManualList(toRaw(searchFormParams)).finally(
    () => {
      pageLoading.value = false;
    }
  );
  dataList.value = data.rows;
  pagination.total = data.total;
};

const isEnabledChange = async (value, row) => {
  const {
    equipmentId,
    manualVersion,
    manualCode,
    isEnabled,
    manualFilePath,
    suitableScope,
    manualId
  } = row;
  renewInspectionManual({
    equipmentId,
    manualVersion,
    manualCode,
    isEnabled,
    manualFilePath,
    suitableScope,
    manualId
  })
    .then(res => {
      ElMessage.success(value ? "启用成功！" : "禁用成功！");
      archiveListFun();
    })
    .catch(err => {});
};

function resetForm() {
  searchFormParams.equipmentName = "";
  searchFormParams.equipmentType = "";

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
const openDetailDialog = (row: renewInspectionManualRes) => {
  detailRef.value.handleOpened(row.manualId);
};

const onSearch = tableRef => {
  archiveListFun();
  // 点击搜索的时候，需要重置排序，重新排序的时候会重置分页并发起查询请求
  tableRef.getTableRef().sort("createTime", "descending");
};

onMounted(() => {
  archiveListFun();
});
defineOptions({
  name: "JianXiuManual"
});
</script>

<style lang="scss" scoped></style>
