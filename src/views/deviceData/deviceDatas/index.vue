<template>
  <div>
    <el-form
      :inline="true"
      ref="searchFormRef"
      :model="searchFormParams"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
    >
      <el-form-item label="设备名称：">
        <el-input
          class="!w-[200px]"
          placeholder="请输入设备名称"
          clearable
          v-model="searchFormParams.equipmentName"
        />
      </el-form-item>
      <el-form-item label="监测指标：">
        <el-select
          class="!w-[200px]"
          placeholder="请选择监测指标"
          clearable
          v-model="searchFormParams.monitoringIndicator"
        >
          <el-option label="压差" value="压差" />
          <el-option label="温度" value="温度" />
          <el-option label="转速" value="转速" />
          <el-option label="浓度" value="浓度" />
          <el-option label="湿度" value="湿度" />
          <el-option label="风速" value="风速" />
          <el-option label="PH值" value="PH值" />
          <el-option label="溶氧" value="溶氧" />
          <el-option label="压力" value="压力" />
          <el-option label="体积" value="体积" />
          <el-option label="搅拌" value="搅拌" />
        </el-select>
      </el-form-item>
      <el-form-item label="时间：">
        <el-date-picker
          class="!w-[240px]"
          type="date"
          value-format="YYYY-MM-DD"
          v-model="searchFormParams.beginTime"
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
      title="设备数据列表"
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
          <template #equipmentData="{ row }">
            <span :style="{ color: getEquipmentDataColor(row) }">
              {{ row.equipmentData }}
            </span>
          </template>
          <template #createTime="{ row }">
            <span>{{
              dayjs(row.createTime).format("YYYY-MM-DD HH:mm:ss")
            }}</span>
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
  deviceDataListRes,
  deviceDataList
} from "@/api/deviceData/deviceDatas";
import { Sort } from "element-plus";
import { CommonUtils } from "@/utils/common";
import { Refresh, Search } from "@element-plus/icons-vue";
import dayjs from "dayjs";

const tableRef = ref();
const columns: TableColumnList = [
  {
    label: "编号",
    prop: "equipmentDataId"
  },
  {
    label: "设备名称",
    prop: "equipment.equipmentName"
  },
  {
    label: "设备编号",
    prop: "equipment.equipmentCode"
  },
  {
    label: "监测指标",
    prop: "threshold.equipmentIndex"
  },
  {
    label: "设备数据",
    prop: "equipmentData",
    slot: "equipmentData"
  },
  {
    label: "时间",
    prop: "createTime",
    slot: "createTime"
  }
];
const defaultSort: Sort = {
  prop: "createTime",
  order: "descending"
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
const searchFormParams = reactive<deviceDataListRes>({
  equipmentName: "",
  monitoringIndicator: ""
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

  const { data } = await deviceDataList(toRaw(searchFormParams)).finally(() => {
    pageLoading.value = false;
  });
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
  searchFormParams.equipmentName = "";
  searchFormParams.monitoringIndicator = "";
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

// 修改获取设备数据颜色的方法
const getEquipmentDataColor = row => {
  if (!row.threshold?.values?.length) return "inherit";

  const value = Number(row.equipmentData);
  const thresholds = row.threshold.values;

  // 按照level等级排序
  const sortedThresholds = [...thresholds].sort((a, b) => {
    const levelA = Number(a.level.replace(/[^0-9]/g, ""));
    const levelB = Number(b.level.replace(/[^0-9]/g, ""));
    return levelB - levelA;
  });

  for (const threshold of sortedThresholds) {
    if (value >= threshold.min && value <= threshold.max) {
      // 根据不同等级返回不同颜色
      switch (threshold.level) {
        case "一级":
          return "#F53F3F"; // 紧急 - 红色
        case "紧急":
          return "#F53F3F"; // 紧急 - 红色
        case "二级":
          return "#FF7D00"; // 重要 - 橙色
        case "重要":
          return "#FF7D00"; // 重要 - 橙色
        case "三级":
          return "#FADC19"; // 一般 - 黄色
        case "中度":
          return "#FADC19"; // 一般 - 黄色
        case "四级":
          return "#168CFF"; // 一般 - 蓝色
        case "一般":
          return "#168CFF"; // 一般 - 绿色
        case "五级":
          return "#00B42A"; // 一般 - 绿色
        case "轻微":
          return "#00B42A"; // 一般 - 绿色

        default:
          return "#168CFF";
      }
    }
  }

  return "inherit";
};
</script>

<style lang="scss" scoped></style>
