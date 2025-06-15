<script lang='ts' setup>
import { getNenghaoList } from '@/api/environmentalData/alarmLevelSetting';
import { environmentalFilesList, environmentalFilesListRes } from '@/api/environmentalData/environmentalArchives';
import { CommonUtils } from '@/utils/common';
import { PaginationProps } from '@pureadmin/table';
import dayjs from 'dayjs';
import { Sort } from 'element-plus/es/components';
import { reactive } from 'vue';
import { onMounted } from 'vue';
import { toRaw } from 'vue';
import { h } from 'vue';
import { ref } from 'vue';
import { PureTableBar } from "@/components/RePureTableBar";

const tableRef = ref();
const dataList = ref([]);
const selectDataList = ref([]);
const pagination: PaginationProps = {
  total: 0,
  pageSize: 10,
  currentPage: 1,
  background: true
};
const defaultSort: Sort = {
  prop: "createTime",
  order: "descending"
};

const pageLoading = ref(true);
const sortState = ref<Sort>(defaultSort);
const columns: TableColumnList = [
  {
    label: "序号",
    prop: "detectionId"
  },
  {
    label: "描述",
    prop: "environment",
    cellRenderer: row => {
      return h(
        "span",
        row.row?.environment?.description +
        "--" +
        row.row?.environment?.unitName
      );
    }
  },
  {
    label: "类型",
    prop: "type"
  },
  {
    label: "位号",
    prop: "environment.tag"
  },
  {
    label: "数值",
    prop: "currentValue",
    slot: "currentValue"
  },
  {
    label: "本月使用量",
    prop: "totalValue",
  },
  {
    label: "时间",
    prop: "createTime",
    slot: "createTime"
  }
];
const searchFormParams = reactive<detectionListRes>({
  // description: "",
  // tag: ""
  type: "",
  environmentId: 0
});

function resetForm() {
  searchFormParams.type = "";
  searchFormParams.environmentId = 0;
  // 重置 pagination 中的属性
  pagination.total = 0;
  pagination.pageSize = 10;
  pagination.currentPage = 1;
  pagination.background = true;
  archiveListFun();
}

const archiveListFun = async () => {
  pageLoading.value = true;

  CommonUtils.fillSortParams(searchFormParams, sortState.value);
  CommonUtils.fillPaginationParams(searchFormParams, pagination);

  const { data } = await getNenghaoList(toRaw(searchFormParams)).finally(() => {
    pageLoading.value = false;
  });
  dataList.value = data.rows;
  pagination.total = data.total;
};




// 修改 getValueColorClass 方法
const getValueColorClass = row => {
  const value = row.value;
  const alarmLevels = row.environment?.alarmlevels || [];

  for (const level of alarmLevels) {
    if (value >= level.min && value <= level.max) {
      switch (level.level) {
        case "一级":
        case "紧急":
          return "text-urgent";
        case "二级":
        case "重要":
          return "text-important";
        case "三级":
        case "中度":
          return "text-warning";
        case "四级":
        case "一般":
          return "text-info";
        case "五级":
        case "轻微":
          return "text-success";
        default:
          return "";
      }
    }
  }
  return "text-info"; // 默认颜色
};


const searchEnvFormParams = reactive<environmentalFilesListRes>({
  description: "",
  tag: "",
  environmentIds: [],
  type:["水","电"]
});
const envArchiveListFun = async () => {
  // pageLoading.value = true;

  CommonUtils.fillSortParams(searchEnvFormParams, sortState.value);
  CommonUtils.fillPaginationParams(searchEnvFormParams, pagination);

  const { data } = await environmentalFilesList(
    toRaw(searchEnvFormParams)
  ).finally(() => {
    // pageLoading.value = false;
  });
  selectDataList.value = data.rows;
  // pagination.total = data.total;
};
function loadArchiveListFun() {
  searchEnvFormParams.pageNum+= 1;
  envArchiveListFun();
}


onMounted(() => {
  archiveListFun();
  envArchiveListFun();
});

</script>

<template>
  <div>

    <el-form ref="searchFormRef" :inline="true" :model="searchFormParams"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]">
      <el-form-item label="类型" prop="type">
        <el-select v-model="searchFormParams.type" placeholder="请选择类型" class="w-[200px]">
          <el-option label="电" value="电"></el-option>
          <el-option label="水" value="水"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="描述：" class="form-item">
          <el-select v-model="searchFormParams.environmentId" placeholder="请选择描述"  style="width: 240px">
           <div v-infinite-scroll="loadArchiveListFun">
            <!-- {{ row.description }}{{ "--" }}{{ row.unitName }} -->
              <el-option
                v-for="item in selectDataList"
                :key="item.environmentId"
                :label="`${item.description}--${item.unitName}`"
                :value="item.environmentId"
              />
            </div>
          </el-select>
        </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="archiveListFun">查询</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>



    </el-form>

    <PureTableBar title="能耗监测列表" :columns="columns" :tableRef="tableRef?.getTableRef()">
      <!-- <template #buttons>
        <el-button type="primary" @click="analyzeFormModalClick"
          >环境数据分析</el-button
        >
      </template> -->

      <template v-slot="{ size, dynamicColumns }">
        <pure-table ref="tableRef" adaptive :adaptiveConfig="{ offsetBottom: 32 }" align-whole="center"
          row-key="policiesId" showOverflowTooltip table-layout="auto" :size="size" :columns="dynamicColumns"
          :data="dataList" :pagination="pagination" :paginationSmall="size === 'small' ? true : false"
          @page-size-change="archiveListFun" @page-current-change="archiveListFun" :header-cell-style="{
            background: 'var(--el-table-row-hover-bg-color)',
            color: 'var(--el-text-color-primary)'
          }" style="height: auto">
          <template #currentValue="{ row }">
            <span :class="getValueColorClass(row)">{{ row.currentValue }}</span>
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

<style scoped></style>
