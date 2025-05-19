<template>
  <div class="main">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="searchFormParams"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
    >
      <el-form-item label="报警类型：">
        <el-select
          class="!w-[200px]"
          placeholder="请选择报警类型"
          clearable
          v-model="searchFormParams.type"
        >
          <el-option label="设备报警" value="设备报警" />
          <el-option label="环境报警" value="环境报警" />
          <el-option label="物料报警" value="物料报警" />
          <el-option label="工艺节点报警" value="工艺节点报警" />
        </el-select>
      </el-form-item>
      <el-form-item label="报警时间：">
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
      <el-form-item label="报警级别：">
        <el-select
          class="!w-[200px]"
          placeholder="请选择报警级别"
          clearable
          v-model="searchFormParams.level"
        >
          <el-option v-for="item in typeOptions" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="archiveListFun"
          >搜索</el-button
        >
        <el-button :icon="Refresh" @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
    <PureTableBar
      title="报警事件列表"
      :columns="columns"
      :tableRef="tableRef?.getTableRef()"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button type="primary" @click="analyzeFormModalClick">
          报告频次分析
        </el-button>
        <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>
        <el-dropdown>
          <el-button type="warning" :icon="Download" >报告导出</el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="exportClick('excel')">excel</el-dropdown-item>
              <el-dropdown-item @click="exportClick('word')">word</el-dropdown-item>
              <el-dropdown-item @click="exportClick('pdf')">pdf</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
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
            rows => (multipleSelection = rows.map(item => item.eventId))
          "
          style="height: auto"
        >
          <template #level="{ row }">
            <el-tag
              :style="getLevelStyle(row.level)"
              effect="plain"
              size="small"
            >
              {{ row.level ? row.level : "-" }}
            </el-tag>
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
    <analyzeFormModal ref="analyzeFormModalRef" />
    <detailFormModal ref="detailFormModalRef" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive, toRaw, computed } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { PaginationProps } from "@pureadmin/table";
import {
  alarmEventsListRes,
  alarmEventsList,
  exportAlarmEvents,
  typesList
} from "@/api/alarmPlatform/alarmEvents";
import { Sort } from "element-plus";
import { CommonUtils } from "@/utils/common";
import { Plus, Refresh, Search, Download } from "@element-plus/icons-vue";
import { ExportDownload, ExportPdfDownload, ExportWordDownload } from "@/utils/exportdownload";
import analyzeFormModal from "./analyze-from-modal.vue";
import detailFormModal from "./detail-from-modal.vue";

const tableRef = ref();
const columns: TableColumnList = [
  {
    type: "selection",
    align: "left"
  },
  {
    label: "报警编号",
    prop: "eventId"
  },
  {
    label: "报警类型",
    prop: "type"
  },
  {
    label: "报警时间",
    prop: "createTime"
  },
  {
    label: "报警级别",
    prop: "level",
    slot: "level"
  },
  {
    label: "报警描述",
    prop: "description"
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

const searchFormRef = ref();
const searchFormParams = reactive<alarmEventsListRes>({
  type: "",
  level: "",
  eventIds: []
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

  const { data } = await alarmEventsList(toRaw(searchFormParams)).finally(
    () => {
      pageLoading.value = false;
    }
  );
  dataList.value = data.rows;
  pagination.total = data.total;
};

const typeOptions = ref([]);
const typesListFun = async () => {
  const { data } = await typesList();
  typeOptions.value = data;
};

//报警频次分析
const analyzeFormModalRef = ref();
const analyzeFormModalClick = () => {
  analyzeFormModalRef.value.handleOpened();
};

const detailFormModalRef = ref();
const openDetailDialog = row => {
  detailFormModalRef.value.handleOpened(row.eventId);
};

// 导出
const exportClick = (type:string) => {
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

  exportAlarmEvents(
    toRaw({ ...searchFormParams, eventIds: multipleSelection.value,exportType:type })
  ).then(res => {
    console.log(res);
    if (type == "pdf") {
      ExportPdfDownload(res, "报警事件");
    } else if (type == "word") {
      ExportWordDownload(res, "报警事件");
    } else {
      ExportDownload(res, "报警事件");
    }
  });
};

function resetForm() {
  searchFormParams.type = "";
  searchFormParams.level = "";
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
  tableRef.getTableRef().sort("createTime", "ascending");
};

onMounted(() => {
  archiveListFun();
  typesListFun();
});
defineOptions({
  name: "processArchives"
});

// 修改报警级别样式映射函数
const getLevelStyle = (level: string) => {
  const colorMap = {
    一级: {
      color: "#F53F3F",
      backgroundColor: "#FFECE8",
      borderColor: "#F53F3F"
    },
    紧急: {
      color: "#F53F3F",
      backgroundColor: "#FFECE8",
      borderColor: "#F53F3F"
    },
    二级: {
      color: "#FF7D00",
      backgroundColor: "#FFF3E8",
      borderColor: "#FF7D00"
    },
    重要: {
      color: "#FF7D00",
      backgroundColor: "#FFF3E8",
      borderColor: "#FF7D00"
    },
    三级: {
      color: "#B99E00",
      backgroundColor: "#FFF7CC",
      borderColor: "#FADC19"
    },
    中度: {
      color: "#B99E00",
      backgroundColor: "#FFF7CC",
      borderColor: "#FADC19"
    },
    四级: {
      color: "#168CFF",
      backgroundColor: "#E8F3FF",
      borderColor: "#168CFF"
    },
    一般: {
      color: "#168CFF",
      backgroundColor: "#E8F3FF",
      borderColor: "#168CFF"
    },
    五级: {
      color: "#00B42A",
      backgroundColor: "#E8FFEA",
      borderColor: "#00B42A"
    },

    轻微: {
      color: "#00B42A",
      backgroundColor: "#E8FFEA",
      borderColor: "#00B42A"
    }
  };
  return (
    colorMap[level] || {
      color: "#000000",
      backgroundColor: "transparent",
      borderColor: "transparent"
    }
  );
};
</script>

<style lang="scss" scoped></style>
