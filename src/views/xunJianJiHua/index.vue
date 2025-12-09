<script setup lang="ts">
import { updateXunJianApi, XunJianPageResponse } from "@/api/manage/xunJian.ts";
import { useHook } from "./utils/hook.tsx";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { PureTableBar } from "@/components/RePureTableBar";
import EditPen from "@iconify-icons/ep/edit-pen";
import { ref } from "vue";
import XunJianFormModal from "./xunJian-form-modal.vue";
// import detailFromModal from "./detail-from-modal.vue";
import Delete from "@iconify-icons/ep/delete";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import { Plus } from "@element-plus/icons-vue";
import dayjs from "dayjs";
import Echarts from "./echarts.vue";

defineOptions({
  name: "ManageXunJian"
});

const tableRef = ref();
const searchFormRef = ref();
const echartsRef = ref();
const {
  dataList,
  columns,
  defaultSort,
  pagination,
  getXunJianList,
  handleDelete,
  onSearch,
  searchFormParams,
  timeRange,
  pageLoading,
  resetForm
} = useHook();

const opType = ref<"add" | "update">("add");
const modalVisible = ref(false);
const opRow = ref<XunJianPageResponse>();
function openDialog(type: "add" | "update", row?: XunJianPageResponse) {
  opType.value = type;
  opRow.value = row;
  modalVisible.value = true;
}

function getTimeStart(value: number[]) {
  if (Array.isArray(value) && value.length > 0) {
    return dayjs().startOf("day").add(value[0], "second").format("HH:mm");
  }
  return "--";
}

function getTimeEnd(value: number[]) {
  if (Array.isArray(value) && value.length > 1) {
    return dayjs().startOf("day").add(value[1], "second").format("HH:mm");
  }
  return "--";
}

function changeEnable(val, row) {
  row.enable = val;
  updateXunJianApi(row).then(res => {
    getXunJianList();
  });
}

function openEcharts() {
  echartsRef.value.open();
}

// const detailFromModalRef = ref();
// const openDetailDialog = row => {
//   detailFromModalRef.value.handleOpened(row.xunJianId);
// };
</script>

<template>
  <div class="main">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="searchFormParams"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
    >
      <el-form-item label="巡检类型" prop="title">
        <el-input
          v-model="searchFormParams.title"
          placeholder="请输入文档标题"
          clearable
          class="!w-[200px]"
        />
      </el-form-item>

      <el-form-item label="巡检频率：" prop="xunJianPinLu">
        <el-select
          v-model="searchFormParams.xunJianPinLu"
          placeholder="请选择类型"
          clearable
          class="!w-[180px]"
        >
          <el-option label="每日" value="每日" />
          <el-option label="每周" value="每周" />
          <el-option label="每月" value="每月" />
        </el-select>
      </el-form-item>
      <el-form-item label="创建日期：">
        <el-date-picker
          class="!w-[240px]"
          v-model="timeRange"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon(Search)"
          :loading="pageLoading"
          @click="getXunJianList"
        >
          搜索
        </el-button>
        <el-button
          :icon="useRenderIcon(Refresh)"
          @click="resetForm(searchFormRef, tableRef)"
        >
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <PureTableBar
      title="巡检计划列表"
      :columns="columns"
      :tableRef="tableRef?.getTableRef()"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button type="primary" :icon="Plus" @click="openDialog('add')"
          >新增</el-button
        >
        <el-button type="primary" @click="openEcharts">巡检记录</el-button>
      </template>

      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          ref="tableRef"
          adaptive
          :adaptiveConfig="{ offsetBottom: 32 }"
          align-whole="center"
          row-key="xunJianId"
          showOverflowTooltip
          table-layout="auto"
          :size="size"
          :columns="dynamicColumns"
          :data="dataList"
          :default-sort="defaultSort"
          :pagination="pagination"
          :paginationSmall="size === 'small' ? true : false"
          @page-size-change="getXunJianList"
          @page-current-change="getXunJianList"
          :header-cell-style="{
            background: 'var(--el-table-row-hover-bg-color)',
            color: 'var(--el-text-color-primary)'
          }"
          style="height: auto"
        >
          <template #timeRange="{ row }">
            <span>{{ getTimeStart(row.timeRange) }}</span>
          </template>
          <template #timeRangeEnd="{ row }">
            <span>{{ getTimeEnd(row.timeRange) }}</span>
          </template>
          <template #enable="{ row }">
            <span>
              <el-switch
                v-model="row.enable"
                @change="changeEnable($event, row)"
              />
            </span>
          </template>

          <template #createTime="{ row }">
            <span>{{ dayjs(row.createTime).format("YYYY-MM-DD") }}</span>
          </template>
          <template #operation="{ row }">
            <!-- <el-button class="reset-margin" link type="primary" :size="size" @click="openDetailDialog(row)">
              查看
            </el-button> -->
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

    <XunJianFormModal
      v-model="modalVisible"
      :type="opType"
      :row="opRow"
      @success="onSearch(tableRef)"
    />
    <Echarts ref="echartsRef" />
    <!-- <detailFromModal ref="detailFromModalRef" /> -->
  </div>
</template>

<style lang="scss" scoped></style>
