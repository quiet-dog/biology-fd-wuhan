<template>
  <v-detail-dialog show-full-screen :fixed-body-height="false" use-body-scrolling :is-show-confirm="false"
    title="环境数据分析" v-model="visible" :disableFooter="true" @cancel="cancelConfirm">
    <el-form :model="formData" class="form-container">
      <div class="form-row">
        <el-form-item label="描述：" class="form-item">
          <el-select v-model="formData.environmentId" placeholder="请选择描述" @change="selectChange" style="width: 240px">
            <div v-infinite-scroll="loadArchiveListFun">
              <el-option v-for="item in dataList" :key="item.environmentId"
                :label="`${item.description} - ${item.unitName}`" :value="item.environmentId" />
            </div>

          </el-select>
        </el-form-item>

        <!-- <el-form-item label="日期：" class="form-item">
          <el-date-picker v-model="formData.timeRange" type="date" placeholder="选择日期" value-format="YYYY-MM-DD"
            @change="handleTimeChange" />
        </el-form-item> -->
      </div>
    </el-form>

    <div class="chart_container" ref="chartRef" />
  </v-detail-dialog>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, reactive, toRaw } from "vue";
import { FormInstance, Sort } from "element-plus";
import VDetailDialog from "@/components/VDetailDialog/VDetailDialog.vue";
import * as echarts from "echarts";
import { detectionList, getTongJiNenghaoApi } from "@/api/environmentalData/alarmLevelSetting";
import dayjs from "dayjs";
import { environmentalFilesList, environmentalFilesListRes } from "@/api/environmentalData/environmentalArchives";
import { PaginationProps } from "@pureadmin/table";
import { CommonUtils } from "@/utils/common";

const visible = ref(false);
const formRef = ref<FormInstance>();

const myChart = ref(null);
const chartRef = ref();
const option = {
  grid: {
    left: "5%",
    right: "5%",
    bottom: "5%",
    top: "10%",
    containLabel: true
  },
  tooltip: {},
  xAxis: {
    type: 'category',
  },
  yAxis: {
    type: "value",
    name: "数值"
  },
  series: [
    {
      name: "数值",
      type: "line",
      data: [],
      itemStyle: { color: "#409EFF" },
    }
  ]
};

const formData = ref({
  // detectionId: null,
  // beginTime: "",
  // des: "",
  // endTime: "",
  // timeRange: ""
  dayType: "week",
  environmentId: 0,
});

const form = ref({
  pageSize: 10,
  pageNum: 1
});

const dataList = ref([]);

// 添加返回类型定义
interface DetectionResponse {
  data: {
    rows: Array<{
      environmentId: string;
      environment: {
        description: string;
        environmentId: string;
      };
      createTime: string;
      value: number;
      detectionId: string;
    }>;
  };
}

const loadArchiveListFun = () => {
  if(searchFormParams.pageNum * searchFormParams.pageSize >= pagination.total) {
    return;
  }
  searchFormParams.pageNum++;
  archiveListFun();
}

const searchFormParams = reactive<environmentalFilesListRes>({
  description: "",
  tag: "",
  environmentIds: [],
  exportType: "pdf",
  type: ["水", "电"],
  pageSize: 10,
  pageNum: 1,
});
const defaultSort: Sort = {
  prop: "createTime",
  order: "descending"
};
const sortState = ref<Sort>(defaultSort);
const pagination: PaginationProps = {
  total: 0,
  pageSize: 10,
  currentPage: 1,
  background: true
};

const archiveListFun = async () => {
  CommonUtils.fillSortParams(searchFormParams, sortState.value);
  CommonUtils.fillPaginationParams(searchFormParams, pagination);

  const { data } = await environmentalFilesList(
    toRaw(searchFormParams)
  ).finally(() => {
  });
  if (data.rows.length > 0 && dataList.value.length === 0) {
    dataList.value = [...dataList.value, ...data.rows];
  } else {
    dataList.value = data.rows;
  }
  pagination.total = data.total;
};

const detectionDataFun = async () => {
  const data = await getTongJiNenghaoApi(formData.value)
  console.log("获取的统计数据：", data);

  // 更新图表数据
  option.series[0].data = data.data.data
  // 设置x轴
  option.xAxis.data = data.data.time;

  // 初始化或更新图表
  if (!myChart.value) {
    myChart.value = echarts.init(chartRef.value);
  }
  myChart.value.setOption(option);
};

const handleOpened = async () => {
  visible.value = true;
  console.log("handleOpened");
  await archiveListFun();

  // 默认选中第一个
  if (dataList.value.length > 0) {
    formData.value.environmentId = dataList.value[0].environmentId;
  }

  // 设置默认时间为今天，使用 ISO 格式
  const today = dayjs().format("YYYY-MM-DD");
  // formData.value.timeRange = today;
  // formData.value.beginTime = `${today}T00:00:00.000Z`;
  // formData.value.endTime = `${today}T23:59:59.999Z`;

  await detectionDataFun();
};

function cancelConfirm() {
  visible.value = false;
  formRef.value?.resetFields();
}

const selectChange = async val => {
  if (val) {
    await detectionDataFun();
  }
};


// 添加窗口resize监听
onMounted(() => {
  window.addEventListener("resize", () => {
    myChart.value?.resize();
  });
});

onUnmounted(() => {
  window.removeEventListener("resize", () => {
    myChart.value?.resize();
  });
  myChart.value?.dispose();
});

defineExpose({
  handleOpened
});
</script>

<style lang="scss" scoped>
.form-container {
  width: 100%;
}

.form-row {
  display: flex;
  justify-content: flex-start;
  gap: 20px;

  .form-item {
    margin-bottom: 0;
  }
}

.chart_container {
  width: 100%;
  height: 400px;
  margin-top: 10px;
}
</style>
