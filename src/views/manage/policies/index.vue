<script setup lang="ts">
import { ref, reactive, computed, onMounted, toRaw } from "vue";
import {
  getPoliciesListApi,
  PoliciesListCommand,
  PoliciesPageResponse
} from "@/api/manage/policies";
import { Sort } from "element-plus";
import { PaginationProps } from "@pureadmin/table";
import { CommonUtils } from "@/utils/common";
import { PureTableBar } from "@/components/RePureTableBar";
import PoliciesFormModal from "./policies-form-modal.vue";
import detailFromModal from "./detail-from-modal.vue";
import { Plus, Search, Refresh } from "@element-plus/icons-vue";
import dayjs from "dayjs";

defineOptions({
  name: "ManagePolicies"
});

const tableRef = ref();
const searchFormRef = ref();
const defaultSort: Sort = {
  prop: "createTime",
  order: "descending"
};

const searchFormParams = reactive<PoliciesListCommand>({
  policiesCode: "",
  policiesName: "",
  type: ""
});

const typeOptions = reactive([
  {
    value: "国家法律",
    label: "国家法律"
  },
  {
    value: "行政法规",
    label: "行政法规"
  },
  {
    value: "地方性法规",
    label: "地方性法规"
  },
  {
    value: "部门规章",
    label: "部门规章"
  },
  {
    value: "地方政府规章",
    label: "地方政府规章"
  },
])

const pageLoading = ref(true);

const pagination: PaginationProps = {
  total: 0,
  pageSize: 10,
  currentPage: 1,
  background: true
};

const sortState = ref<Sort>(defaultSort);

const dataList = ref([]);

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

const columns: TableColumnList = [
  {
    label: "政策法规编号",
    prop: "policiesId"
  },
  {
    label: "名称",
    prop: "policiesName"
  },
  {
    label: "类型",
    prop: "type"
  },
  {
    label: "发布日期",
    prop: "createTime",
    slot: "createTime"
  },
  {
    label: "操作",
    fixed: "right",
    width: 200,
    slot: "operation"
  }
];

async function getPoliciesList() {
  pageLoading.value = true;

  CommonUtils.fillSortParams(searchFormParams, sortState.value);
  CommonUtils.fillPaginationParams(searchFormParams, pagination);

  const { data } = await getPoliciesListApi(toRaw(searchFormParams)).finally(
    () => {
      pageLoading.value = false;
    }
  );
  dataList.value = data.rows;
  pagination.total = data.total;
}

function resetForm() {
  searchFormParams.policiesName = "";
  searchFormParams.beginTime = undefined;
  searchFormParams.endTime = undefined;
  searchFormParams.type = "";

  pagination.total = 0;
  pagination.pageSize = 10;
  pagination.currentPage = 1;
  pagination.background = true;
  getPoliciesList();
}

const onSearch = tableRef => {
  getPoliciesList();
  // 点击搜索的时候，需要重置排序，重新排序的时候会重置分页并发起查询请求
  tableRef.getTableRef().sort("createTime", "descending");
};

const opType = ref<"add" | "update">("add");
const modalVisible = ref(false);
const opRow = ref<PoliciesPageResponse>();
function openDialog(type: "add" | "update", row?: PoliciesPageResponse) {
  opType.value = type;
  opRow.value = row;
  modalVisible.value = true;
}

// 详情
const detailRef = ref();
const openDetailDialog = row => {
  detailRef.value.handleOpened(row.policiesId);
};

onMounted(() => {
  getPoliciesList();
});
</script>

<template>
  <div class="main">
    <el-form ref="searchFormRef" :inline="true" :model="searchFormParams"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]">
      <el-form-item label="名称：" prop="title">
        <el-input v-model="searchFormParams.policiesName" placeholder="请输入名称" clearable class="!w-[200px]" />
      </el-form-item>

      <el-form-item label="类型：" prop="type">
        <el-select v-model="searchFormParams.type">
          <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>

      <el-form-item label="发布日期：">
        <el-date-picker class="!w-[240px]" v-model="timeRange" value-format="YYYY-MM-DD" type="daterange"
          range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" :loading="pageLoading" @click="getPoliciesList">
          搜索
        </el-button>
        <el-button :icon="Refresh" @click="resetForm"> 重置 </el-button>
      </el-form-item>
    </el-form>

    <PureTableBar title="政策法规" :columns="columns" :tableRef="tableRef?.getTableRef()" @refresh="onSearch">
      <template #buttons>
        <el-button type="primary" :icon="Plus" @click="openDialog('add')">新增</el-button>
      </template>

      <template v-slot="{ size, dynamicColumns }">
        <pure-table ref="tableRef" adaptive :adaptiveConfig="{ offsetBottom: 32 }" align-whole="center"
          row-key="policiesId" showOverflowTooltip table-layout="auto" :size="size" :columns="dynamicColumns"
          :data="dataList" :default-sort="defaultSort" :pagination="pagination"
          :paginationSmall="size === 'small' ? true : false" @page-size-change="getPoliciesList"
          @page-current-change="getPoliciesList" :header-cell-style="{
            background: 'var(--el-table-row-hover-bg-color)',
            color: 'var(--el-text-color-primary)'
          }" style="height: auto">
          <template #createTime="{ row }">
            {{ dayjs(row.createTime).format("YYYY-MM-DD") }}
          </template>
          <template #operation="{ row }">
            <el-button class="reset-margin" link type="primary" :size="size" @click.stop="openDetailDialog(row)">
              查看
            </el-button>
          </template>
        </pure-table>
      </template>
    </PureTableBar>

    <PoliciesFormModal v-model="modalVisible" :type="opType" :row="opRow" @success="onSearch(tableRef)" />
    <detailFromModal ref="detailRef" />
  </div>
</template>

<style lang="scss" scoped></style>
