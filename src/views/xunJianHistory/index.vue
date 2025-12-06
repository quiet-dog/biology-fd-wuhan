<script setup lang="ts">
import { XunJianPageResponse } from "@/api/manage/xunJian.ts";
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

defineOptions({
  name: "ManageXunJian"
});

const tableRef = ref();
const searchFormRef = ref();
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

function changeXunJianShiJian(val: number[], type: string) {
  if (Array.isArray(val) && val.length > 0) {
    if (type == "持续巡检") {
      if (val.length == 2) {
        return `${dayjs()
          .startOf("day")
          .add(val[0], "second")
          .format("HH:mm")}-${dayjs()
          .startOf("day")
          .add(val[1], "second")
          .format("HH:mm")}`;
      }
    } else {
      return dayjs().startOf("day").add(val[0], "second").format("HH:mm");
    }
  }
  return "--";
}

const weekMap = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

function changeRiQi(row) {
  if (row.xunJianPinLu == "每日") {
    return dayjs(row.createTime).format("YYYY-MM-DD");
  }

  if (row.xunJianPinLu == "每周") {
    return row.dayRange.map(i => weekMap[i % 7]).join(", ");
  }

  if (row.xunJianPinLu == "每月") {
    return row.dayRange.map(i => `${i + 1}号`).join(", ");
  }
  return "--";
}

// const detailFromModalRef = ref();
// const openDetailDialog = row => {
//   detailFromModalRef.value.handleOpened(row.xunJianId);
// };
const xunJianEventRef = ref<InstanceType<typeof XunJianFormModal>>();
const openEventListDialog = row => {
  xunJianEventRef.value.handleOpenDialog(row.xunJianHistoryId);
};
</script>

<template>
  <div class="main">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="searchFormParams"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
    >
      <el-form-item label="巡检范围" prop="area">
        <el-input
          v-model="searchFormParams.area"
          placeholder="请输入文档标题"
          clearable
          class="!w-[200px]"
        />
      </el-form-item>

      <el-form-item label="类型：" prop="status">
        <el-select
          v-model="searchFormParams.status"
          placeholder="请选择类型"
          clearable
          class="!w-[180px]"
        >
          <el-option label="巡检中" value="巡检中" />
          <el-option label="已完成" value="已完成" />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间">
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
      title="知识库"
      :columns="columns"
      :tableRef="tableRef?.getTableRef()"
      @refresh="onSearch"
    >
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          ref="tableRef"
          adaptive
          :adaptiveConfig="{ offsetBottom: 32 }"
          align-whole="center"
          row-key="xunJianHistoryId"
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
            <span>{{
              changeXunJianShiJian(row.timeRange, row.xunJianLeiXing)
            }}</span>
          </template>
          <template #xunJianRiQi="{ row }">
            <span>{{ changeRiQi(row) }}</span>
          </template>
          <template #status="{ row }">
            <el-tag v-if="row.status == '巡检中'" type="danger">巡检中</el-tag>
            <el-tag v-if="row.status == '已完成'" type="success">已完成</el-tag>
          </template>

          <template #createTime="{ row }">
            <span>{{ dayjs(row.createTime).format("YYYY-MM-DD") }}</span>
          </template>
          <template #updateTime="{ row }">
            <span>{{
              row.updateTime ? dayjs(row.updateTime).format("YYYY-MM-DD") : "-"
            }}</span>
          </template>
          <template #operation="{ row }">
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              @click="openEventListDialog(row)"
            >
              查看
            </el-button>
          </template>
        </pure-table>
      </template>
    </PureTableBar>

    <XunJianFormModal ref="xunJianEventRef" />
  </div>
</template>

<style lang="scss" scoped></style>
