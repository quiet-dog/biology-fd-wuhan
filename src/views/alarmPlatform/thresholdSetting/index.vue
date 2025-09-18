<template>
  <div class="main">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="searchFormParams"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
    >
      <el-form-item label="传感器名称：">
        <el-input
          class="!w-[200px]"
          v-model="searchFormParams.sensorName"
          placeholder="请输入传感器名称"
          clearable
        />
      </el-form-item>
      <el-form-item label="传感器型号：">
        <el-input
          class="!w-[200px]"
          v-model="searchFormParams.sensorModel"
          placeholder="请输入传感器型号："
          clearable
        />
      </el-form-item>
      <el-form-item label="设备指标：">
        <el-input
          class="!w-[200px]"
          v-model="searchFormParams.equipmentIndex"
          placeholder="请输入设备指标"
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
      title="阈值设置"
      :columns="columns"
      :tableRef="tableRef?.getTableRef()"
      @refresh="onSearch"
    >
      <template #buttons>
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
          <template #equipment="{ row }">
            {{
              `${row.equipment?.equipmentName}-${row.equipment?.installationLocation}-${row.equipment?.equipmentCode}`
            }} </template
          >>
          <template #operation="{ row }">
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
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive, toRaw } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { PaginationProps } from "@pureadmin/table";
import {
  thresholdListRes,
  thresholdList,
  renewthresholdRes
} from "@/api/alarmPlatform/thresholdSetting";
import policiesArchivesFormModal from "./policiesArchives-form-modal.vue";
import { Sort } from "element-plus";
import { CommonUtils } from "@/utils/common";
import { Plus, Refresh, Search } from "@element-plus/icons-vue";

const tableRef = ref();
const columns: TableColumnList = [
  {
    label: "编号",
    prop: "thresholdId"
  },
  {
    label: "传感器名称",
    prop: "sensorName"
  },
  {
    label: "传感器型号",
    prop: "sensorModel"
  },
  {
    label: "所属设备",
    prop: "equipment",
    slot: "equipment"
  },
  {
    label: "设备指标",
    prop: "equipmentIndex"
  },
  {
    label: "指标单位",
    prop: "unit"
  },
  {
    label: "当前值",
    prop: "value"
  },
  {
    label: "级别层级",
    prop: "values.length"
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
const searchFormParams = reactive<thresholdListRes>({
  sensorName: "",
  sensorModel: "",
  equipmentIndex: ""
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

  const { data } = await thresholdList(toRaw(searchFormParams)).finally(() => {
    pageLoading.value = false;
  });
  dataList.value = data.rows;
  pagination.total = data.total;
};

function resetForm() {
  searchFormParams.sensorName = "";
  searchFormParams.sensorModel = "";
  searchFormParams.equipmentIndex = "";

  pagination.total = 0;
  pagination.pageSize = 10;
  pagination.currentPage = 1;
  pagination.background = true;
  archiveListFun();
}
const opType = ref<"add" | "update">("add");
const modalVisible = ref(false);
const opRow = ref<renewthresholdRes>();
function openDialog(type: "add" | "update", row) {
  opType.value = type;
  if (type == "update") {
    const {
      equipmentId,
      sensorName,
      sensorModel,
      equipmentIndex,
      unit,
      values,
      outId,
      thresholdId,
      emergencys,
      sops
    } = row;
    opRow.value = {
      equipmentId,
      sensorName,
      sensorModel,
      equipmentIndex,
      unit,
      values,
      outId,
      thresholdId,
      emergencyIds: emergencys,
      sopIds: sops
    };
  } else {
    opRow.value = {};
  }

  modalVisible.value = true;
}

const onSearch = tableRef => {
  archiveListFun();
  // 点击搜索的时候，需要重置排序，重新排序的时候会重置分页并发起查询请求
  tableRef.getTableRef().sort("createTime", "ascending");
};

onMounted(() => {
  archiveListFun();
});
defineOptions({
  name: "thresholdSetting"
});
</script>

<style lang="scss" scoped></style>
