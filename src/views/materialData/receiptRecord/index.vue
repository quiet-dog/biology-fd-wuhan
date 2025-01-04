<template>
  <div class="main">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="searchFormParams"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
    >
      <el-form-item label="领用人姓名：">
        <el-input
          v-model="searchFormParams.name"
          class="!w-[200px]"
          placeholder="请输入领用人姓名"
          clearable
        />
      </el-form-item>
      <el-form-item label="所属部门：">
        <el-input
          v-model="searchFormParams.department"
          class="!w-[200px]"
          placeholder="请输入所属部门"
          clearable
        />
      </el-form-item>
      <el-form-item label="物料名称：">
        <el-input
          v-model="searchFormParams.materialName"
          class="!w-[200px]"
          placeholder="请输入物料名称"
          clearable
        />
      </el-form-item>
      <el-form-item label="领用日期：">
        <el-date-picker
          class="!w-[240px]"
          type="daterange"
          v-model="timeRange"
          value-format="YYYY-MM-DD"
          range-separator="~"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
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
      title="领用记录列表"
      :columns="columns"
      :tableRef="tableRef?.getTableRef()"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button type="primary" @click="analyzeModalVisible = true"
          >领用分析</el-button
        >
        <el-button type="primary" :icon="Plus" @click="openDialog('add')"
          >新增</el-button
        >
         <el-button type="success" :icon="Upload" @click="openImportDialog"
          >导入</el-button
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
        </pure-table>
      </template>
    </PureTableBar>
    <addEditFormModal
      v-model="modalVisible"
      :type="opType"
      @success="onSearch(tableRef)"
      @closed="analyzeModalVisible = false"
    />
    <analyzeFormModal
      v-model="analyzeModalVisible"
      @success="analyzeModalVisible = false"
      @closed="analyzeModalVisible = false"
    />
    <importFormModal @refresh="archiveListFun" ref="importRef"  />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive, toRaw, computed } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { PaginationProps } from "@pureadmin/table";
import { Plus, Refresh, Search } from "@element-plus/icons-vue";
import addEditFormModal from "./addEdit-form-modal.vue";
import { Sort } from "element-plus";
import { CommonUtils } from "@/utils/common";
import { receiveListRes, receiveList } from "@/api/materialData/receiptRecord";
import dayjs from "dayjs";
import analyzeFormModal from "./analyze-from-modal.vue";
import { Upload } from "@element-plus/icons-vue";
import importFormModal from "./import-form-modal.vue";

const analyzeModalVisible = ref(false);
const importRef = ref();
const openImportDialog = () => {
  importRef.value.handleOpened();
};


const tableRef = ref();
const columns: TableColumnList = [
  {
    label: "领用编号",
    prop: "receiverInfo.code"
  },
  {
    label: "领用人姓名",
    prop: "receiverInfo.name"
  },
  {
    label: "领用人工号",
    prop: "receiverInfo.code"
  },
  {
    label: "所属部门",
    prop: "receiverInfo.department"
  },
  {
    label: "物料编号",
    prop: "materialsInfo.code"
  },
  {
    label: "物料名称",
    prop: "materialsInfo.name"
  },
  {
    label: "用途说明",
    prop: "receiveExplain"
  },
  {
    label: "领用日期",
    prop: "createTime",
    slot: "createTime"
  },
  {
    label: "领用数量",
    prop: "receiveNum"
  },
  {
    label: "物料单位",
    prop: "materialsInfo.unit"
  }
];

const timeRange = computed<[string, string] | null>({
  get() {
    if (searchFormParams.beginTime && searchFormParams.endTime) {
      return [searchFormParams.beginTime, searchFormParams.endTime];
    } else {
      return null;
    }
  },
  set(v) {
    if (v?.length === 2) {
      searchFormParams.beginTime = v[0];
      searchFormParams.endTime = v[1];
    } else {
      searchFormParams.beginTime = undefined;
      searchFormParams.endTime = undefined;
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
const searchFormParams = reactive<receiveListRes>({
  name: "",
  department: "",
  materialName: ""
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

  const { data } = await receiveList(toRaw(searchFormParams)).finally(() => {
    pageLoading.value = false;
  });
  dataList.value = data.rows;
  pagination.total = data.total;
};

function resetForm() {
  searchFormParams.name = "";
  searchFormParams.department = "";
  searchFormParams.materialName = "";
  searchFormParams.beginTime = undefined;
  searchFormParams.endTime = undefined;
  // 重置 pagination 中的属性
  pagination.total = 0;
  pagination.pageSize = 10;
  pagination.currentPage = 1;
  pagination.background = true;
  archiveListFun();
}
const opType = ref<"add">("add");
const modalVisible = ref(false);
function openDialog(type: "add") {
  opType.value = type;
  modalVisible.value = true;
}

const onSearch = tableRef => {
  archiveListFun();
  // 点击搜索的时候，需要重置排序，重新排序的时候会重置分页并发起查询请求
  tableRef.getTableRef();
};

onMounted(() => {
  archiveListFun();
});

defineOptions({
  name: "receiptRecord"
});
</script>

<style lang="scss" scoped></style>
