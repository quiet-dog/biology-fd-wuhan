<template>
  <div class="main">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="searchFormParams"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
    >
      <el-form-item label="描述：">
        <el-input
          v-model="searchFormParams.description"
          style="width: 200px"
          placeholder="请输入描述"
          clearable
        />
      </el-form-item>
      <el-form-item label="位号：">
        <el-input
          v-model="searchFormParams.tag"
          style="width: 200px"
          placeholder="请输入位号"
          clearable
        />
      </el-form-item>
      <!-- <el-form-item label="时间：">
        <el-date-picker
          class="!w-[240px]"
          v-model="timeRange"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="~"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item> -->

      <el-form-item>
        <el-button type="primary" :icon="Search" @click="archiveListFun"
          >搜索</el-button
        >
        <el-button :icon="Refresh" @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
    <PureTableBar
      title="环境档案列表"
      :columns="columns"
      :tableRef="tableRef?.getTableRef()"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button type="primary" :icon="Plus" @click="openDialog('add')"
          >新增</el-button
        >
        <el-button type="warning" :icon="Download" @click="exportClick"
          >报告导出</el-button
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
          @selection-change="
            rows => (multipleSelection = rows.map(item => item.environmentId))
          "
          style="height: auto"
        >
          <template #description="{ row }">
            <span>{{ row.description }}{{ "--" }}{{ row.unitName }}</span>
          </template>
          <template #operation="{ row }">
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              @click="openViewDialog(row)"
            >
              查看
            </el-button>
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              @click="thresholdCLick(row)"
            >
              阈值设置
            </el-button>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
    <addEditFormModal
      v-model="modalVisible"
      :type="opType"
      @success="onSearch(tableRef)"
    />
    <thresholdFormModal
      @success="onSearch(tableRef)"
      v-model="modalVisible2"
      :row="opRow"
    />
    <viewFormModal v-model="viewModalVisible" :row="viewRow" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive, toRaw, computed } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { PaginationProps } from "@pureadmin/table";
import {
  environmentalFilesListRes,
  environmentalFilesList,
  exportEnvironmentalFiles
} from "@/api/environmentalData/environmentalArchives";
import { Sort } from "element-plus";
import { CommonUtils } from "@/utils/common";
import { ExportDownload } from "@/utils/exportdownload";
import { Plus, Refresh, Search, Download } from "@element-plus/icons-vue";
import addEditFormModal from "./addedit-form-modal.vue";
import thresholdFormModal from "./threshold-form-modal.vue";
import dayjs from "dayjs";
import viewFormModal from "./view-form-modal.vue";

const tableRef = ref();
const columns: TableColumnList = [
  {
    type: "selection",
    align: "left"
  },
  {
    label: "序号",
    prop: "environmentId"
  },
  {
    label: "描述",
    prop: "description",
    slot: "description"
  },
  {
    label: "位号",
    prop: "tag"
  },
  {
    label: "类型",
    prop: "type"
  },
  {
    label: "范围",
    prop: "scope"
  },
  {
    label: "信号",
    prop: "esignal"
  },
  {
    label: "设备仪表供应商",
    prop: "supplier"
  },
  {
    label: "区域",
    prop: "earea"
  },
  {
    label: "设备仪表型号",
    prop: "model"
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
const dataList = ref([]);
const sortState = ref<Sort>(defaultSort);

const searchFormRef = ref();
const searchFormParams = reactive<environmentalFilesListRes>({
  description: "",
  tag: "",
  environmentIds: []
});

const pagination: PaginationProps = {
  total: 0,
  pageSize: 10,
  currentPage: 1,
  background: true
};
const multipleSelection = ref([]);

const archiveListFun = async () => {
  pageLoading.value = true;

  CommonUtils.fillSortParams(searchFormParams, sortState.value);
  CommonUtils.fillPaginationParams(searchFormParams, pagination);

  const { data } = await environmentalFilesList(
    toRaw(searchFormParams)
  ).finally(() => {
    pageLoading.value = false;
  });
  dataList.value = data.rows;
  pagination.total = data.total;
};

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

  exportEnvironmentalFiles(
    toRaw({ ...searchFormParams, environmentIds: multipleSelection.value })
  ).then(res => {
    ExportDownload(res, "环境检测");
  });
};

const opType = ref<"add" | "update">("add");
const modalVisible = ref(false);
function openDialog(type: "add" | "update") {
  opType.value = type;
  modalVisible.value = true;
}

const modalVisible2 = ref(false);
const opRow = ref();
const thresholdCLick = row => {
  opRow.value = row;
  modalVisible2.value = true;
};
function resetForm() {
  searchFormParams.description = "";
  searchFormParams.tag = "";
  searchFormParams.beginTime = undefined;
  searchFormParams.endTime = undefined;

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

const viewModalVisible = ref(false);
const viewRow = ref();

const openViewDialog = row => {
  viewRow.value = row;
  viewModalVisible.value = true;
};

onMounted(() => {
  archiveListFun();
});

defineOptions({
  name: "processNode"
});
</script>

<style lang="scss" scoped></style>
