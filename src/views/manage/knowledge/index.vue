<script setup lang="ts">
import { KnowledgePageResponse } from "@/api/manage/knowledge";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { PureTableBar } from "@/components/RePureTableBar";
import { useHook } from "./utils/hook";
import EditPen from "@iconify-icons/ep/edit-pen";
import { ref } from "vue";
import KnowledgeFormModal from "./knowledge-form-modal.vue";
import detailFromModal from "./detail-from-modal.vue";
import Delete from "@iconify-icons/ep/delete";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import { Plus } from "@element-plus/icons-vue";
import dayjs from "dayjs";

defineOptions({
  name: "ManageKnowledge"
});

const tableRef = ref();
const searchFormRef = ref();
const {
  dataList,
  columns,
  defaultSort,
  pagination,
  getKnowledgeList,
  handleDelete,
  onSearch,
  knowledgeTypeList,
  searchFormParams,
  timeRange,
  pageLoading,
  resetForm
} = useHook();

const opType = ref<"add" | "update">("add");
const modalVisible = ref(false);
const opRow = ref<KnowledgePageResponse>();
function openDialog(type: "add" | "update", row?: KnowledgePageResponse) {
  opType.value = type;
  opRow.value = row;
  modalVisible.value = true;
}

const detailFromModalRef = ref();
const openDetailDialog = row => {
  detailFromModalRef.value.handleOpened(row.knowledgeId);
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
      <el-form-item label="文档标题" prop="title">
        <el-input
          v-model="searchFormParams.title"
          placeholder="请输入文档标题"
          clearable
          class="!w-[200px]"
        />
      </el-form-item>

      <el-form-item label="类型：" prop="knowledgeType">
        <el-select
          v-model="searchFormParams.knowledgeType"
          placeholder="请选择类型"
          clearable
          class="!w-[180px]"
        >
          <el-option label="流程制度" value="流程制度" />
          <el-option label="技术文档" value="技术文档" />
          <el-option label="案例分析" value="案例分析" />
          <el-option label="培训资料" value="培训资料" />
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
          @click="getKnowledgeList"
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
          row-key="knowledgeId"
          showOverflowTooltip
          table-layout="auto"
          :size="size"
          :columns="dynamicColumns"
          :data="dataList"
          :default-sort="defaultSort"
          :pagination="pagination"
          :paginationSmall="size === 'small' ? true : false"
          @page-size-change="getKnowledgeList"
          @page-current-change="getKnowledgeList"
          :header-cell-style="{
            background: 'var(--el-table-row-hover-bg-color)',
            color: 'var(--el-text-color-primary)'
          }"
          style="height: auto"
        >
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
              @click="openDetailDialog(row)"
            >
              查看
            </el-button>
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

    <KnowledgeFormModal
      v-model="modalVisible"
      :type="opType"
      :row="opRow"
      @success="onSearch(tableRef)"
      :type-options="knowledgeTypeList"
    />
    <detailFromModal ref="detailFromModalRef" />
  </div>
</template>

<style lang="scss" scoped></style>
