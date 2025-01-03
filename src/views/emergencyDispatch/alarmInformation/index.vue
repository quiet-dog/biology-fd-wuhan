<template>
  <div>
    <el-form
      :inline="true"
      ref="searchFormRef"
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
          <!-- <el-option label="工艺报警" value="工艺报警" />
          <el-option label="物料报警" value="物料报警" /> -->
        </el-select>
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
      <el-form-item label="报警时间：">
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
      title="报警信息列表"
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
              @click.stop="detailsClcik(row)"
            >
              查看
            </el-button>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
    <detailFromModal ref="detailFromModalRef" />
  </div>
</template>

<script lang="ts" setup>
import detailFromModal from "./detail-from-modal.vue";
import { ref, reactive, toRaw, onMounted, computed } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { PaginationProps } from "@pureadmin/table";
import {
  alarmInformationListRes,
  alarmInformationList
} from "@/api/emergencyDispatch/alarmInformation";
import { typesList } from "@/api/alarmPlatform/alarmEvents";
import { Sort } from "element-plus";
import { CommonUtils } from "@/utils/common";
import {
  Plus,
  Upload,
  Download,
  Refresh,
  Search
} from "@element-plus/icons-vue";

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

const tableRef = ref();
const columns: TableColumnList = [
  {
    label: "报警编号",
    prop: "emergencyAlarmId"
  },
  {
    label: "报警类型",
    prop: "type"
  },
  {
    label: "报警级别",
    prop: "level",
    slot: "level"
  },
  {
    label: "创建日期",
    prop: "createTime",
    slot: "createTime"
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

const detailFromModalRef = ref();
const detailsClcik = row => {
  detailFromModalRef.value.handleOpened(row.emergencyAlarmId);
};

const pageLoading = ref(true);
const sortState = ref<Sort>(defaultSort);
const dataList = ref([]);
const searchFormRef = ref();
const searchFormParams = reactive<alarmInformationListRes>({
  type: "",
  level: ""
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

  const { data } = await alarmInformationList(toRaw(searchFormParams)).finally(
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

const onSearch = tableRef => {
  archiveListFun();
  // 点击搜索的时候，需要重置排序，重新排序的时候会重置分页并发起查询请求
  tableRef.getTableRef();
};

//重置
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
onMounted(() => {
  archiveListFun();
  typesListFun();
});

defineOptions({
  name: "alarmInformation"
});
</script>

<style lang="scss" scoped></style>
