<template>
  <div>
    <el-form
      :inline="true"
      ref="searchFormRef"
      :model="searchFormParams"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
    >
      <el-form-item label="物料名称：">
        <el-input
          class="!w-[200px]"
          placeholder="请输入物料名称"
          clearable
          v-model="searchFormParams.materialsName"
        />
      </el-form-item>
      <el-form-item label="报警时间：">
        <el-date-picker
          class="!w-[240px]"
          type="daterange"
          value-format="YYYY-MM-DD"
          v-model="timeRange"
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
      title="库存报警列表"
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
          <template #createTime="{ row }">
            <span>{{
              dayjs(row.createTime).format("YYYY-MM-DD HH:mm:ss")
            }}</span>
          </template>
          <template #stock="{ row }">
            <span :style="getStockStyle(row)">
              {{ row.stock }}
            </span>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, toRaw, onMounted, computed } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { PaginationProps } from "@pureadmin/table";
import {
  materialAlarmRes,
  materialAlarmList
} from "@/api/materialData/materialAlarm";
import { Sort } from "element-plus";
import { CommonUtils } from "@/utils/common";
import { Refresh, Search } from "@element-plus/icons-vue";
import dayjs from "dayjs";

const tableRef = ref();
const columns: TableColumnList = [
  {
    label: "物料编号",
    prop: "materials.code"
  },
  {
    label: "物料名称",
    prop: "materials.name"
  },
  {
    label: "报警时间",
    prop: "createTime",
    slot: "createTime"
  },
  {
    label: "库存量",
    prop: "stock",
    slot: "stock"
  },
  {
    label: "物料单位",
    prop: "materials.unit"
  }
];
const defaultSort: Sort = {
  prop: "createTime",
  order: "ascending"
};

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

const pageLoading = ref(true);
const sortState = ref<Sort>(defaultSort);
const dataList = ref([]);
const searchFormRef = ref();
const searchFormParams = reactive<materialAlarmRes>({
  materialsName: "",
  sort: "descending",
  orderColumn: "createTime",
  orderDirection: "descending"
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

  const { data } = await materialAlarmList(toRaw(searchFormParams)).finally(
    () => {
      pageLoading.value = false;
    }
  );
  dataList.value = data.rows;
  pagination.total = data.total;
};

const onSearch = tableRef => {
  archiveListFun();
  // 点击搜索的时候，需要重置排序，重新排序的时候会重置分页并发起查询请求
  tableRef.getTableRef();
};

//重置
function resetForm() {
  searchFormParams.materialsName = "";
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
});

defineOptions({
  name: "alarmInformation"
});

const getStockStyle = row => {
  if (!row?.materials?.values?.length) return {};

  const getColorByLevel = level => {
    const colorMap = {
      一级: "#F53F3F",
      二级: "#FF7D00",
      三级: "#168CFF",
      紧急: "#F53F3F",
      重要: "#FF7D00",
      中度: "#FADC19",
      四级: "#168CFF",
      五级: "#00B42A",
      一般: "#00B42A",
      轻微: "#00B42A"
    };
    return colorMap[level] || "";
  };

  const stock = row.stock;
  for (const value of row.materials.values) {
    const isTriggered =
      (value.scondition === "小于等于" &&
        stock / row.materials.total <= value.value) ||
      (value.scondition === "大于等于" &&
        stock / row.materials.total >= value.value) ||
      (value.scondition === "大于等于" &&
        stock / row.materials.total >= value.value) ||
      (value.scondition === "小于" &&
        stock / row.materials.total < value.value) ||
      (value.scondition === "大于" &&
        stock / row.materials.total > value.value);

    if (isTriggered) {
      return { color: getColorByLevel(value.level) };
    }
  }
  return {};
};
</script>

<style lang="scss" scoped></style>
