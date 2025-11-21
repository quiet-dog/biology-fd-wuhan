<template>
  <v-detail-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    :is-show-confirm="false"
    title="环境数据分析"
    v-model="visible"
    :disableFooter="true"
    @cancel="cancelConfirm"
  >
    <el-form :model="formData" class="form-container">
      <div class="form-row">
        <el-form-item label="描述：" class="form-item">
          <el-select
            v-model="formData.detectionId"
            placeholder="请选择描述"
            @change="selectChange"
            style="width: 240px"
          >
            <div v-infinite-scroll="loadArchiveListFun">
              <el-option
                v-for="item in dataList"
                :key="item.detectionId"
                :label="`${item.description} - ${item.unitName}`"
                :value="item.environmentId"
              />
            </div>
          </el-select>
        </el-form-item>

        <el-form-item label="日期：" class="form-item">
          <el-date-picker
            v-model="formData.timeRange"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            @change="handleTimeChange"
          />
        </el-form-item>
      </div>
    </el-form>

    <div class="chart_container" ref="chartRef" />
  </v-detail-dialog>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue";
import { FormInstance } from "element-plus";
import VDetailDialog from "@/components/VDetailDialog/VDetailDialog.vue";
import * as echarts from "echarts";
import {
  detectionList,
  getHistoryDataByEnvironmentId
} from "@/api/environmentalData/alarmLevelSetting";
import dayjs from "dayjs";
import { environmentalFilesList } from "@/api/environmentalData/environmentalArchives";

const visible = ref(false);
const formRef = ref<FormInstance>();

let myChart = null;
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
    type: "category",

    data: [],
    boundaryGap: false
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
      smooth: true, // 平滑折线
      label: {
        show: true,
        position: "top",
        formatter: "{c}" // 显示数值
      },
      lineStyle: {
        width: 2
      },
      itemStyle: {
        color: "#3A77FF"
      }
    }
  ]
};

const formData = ref({
  detectionId: null,
  beginTime: "",
  des: "",
  endTime: "",
  timeRange: ""
});

const form = ref({
  pageSize: 10,
  pageNum: 1,
  total: 0
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

// const environmentQuery = ref({
//   pageNum: 1,
//   pageSize: 10,
//   total: 0
// });
const archiveListFun = async () => {
  // const { data } = (await detectionList({
  //   ...form.value,
  //   description: "",
  //   tag: ""
  // })) as DetectionResponse;
  // const uniqueMap = new Map();
  // if (data.rows && data.rows.length > 0) {
  //   dataList.value.push(
  //     ...data.rows.reduce((acc, item) => {
  //       if (!uniqueMap.has(item.detectionId)) {
  //         uniqueMap.set(item.detectionId, true);
  //         acc.push({
  //           detectionId: item.detectionId,
  //           environment: item.environment
  //         });
  //       }
  //       return acc;
  //     }, [])
  //   );
  // }

  const { data } = await environmentalFilesList(form.value);
  form.value.total = data.total;
  dataList.value = [...dataList.value, ...data.rows];
};

const detectionDataFun = async () => {
  if (
    formData.value.detectionId == undefined ||
    formData.value.detectionId == null ||
    formData.value.detectionId == 0
  ) {
    return;
  }
  getHistoryDataByEnvironmentId({
    environmentId: formData.value.detectionId,
    beginTime: dayjs(formData.value.beginTime).format("YYYY-MM-DD")
  }).then(res => {
    option.series[0].data = res.data.yData;
    option.xAxis.data = res.data.xData;
    // option.yAxis.min = 1;
    // if (res.data.xData.every(item => item === null)) {
    //   option.yAxis.max = 6;
    // } else {
    //   option.yAxis.max = Math.max(...res.data.xData, 6);
    // }
    // 初始化或更新图表
    if (myChart == null) {
      myChart = echarts.init(chartRef.value);
    }
    myChart.setOption(option, true);
  });

  // 更新图表数据

  // 初始化或更新图表
  if (myChart == null) {
    myChart = echarts.init(chartRef.value);
  }
  myChart.setOption(option, true);
};

const loadArchiveListFun = () => {
  if (form.value.pageNum * 10 > form.value.total) {
    return;
  }
  form.value.pageNum++;
  archiveListFun();
};

const handleOpened = async () => {
  visible.value = true;
  await archiveListFun();

  // 默认选中第一个
  if (dataList.value.length > 0) {
    formData.value.detectionId = dataList.value[0].detectionId;
  }

  // 设置默认时间为今天，使用 ISO 格式
  const today = dayjs().format("YYYY-MM-DD");
  formData.value.timeRange = today;
  formData.value.beginTime = `${today}T00:00:00.000Z`;
  formData.value.endTime = `${today}T23:59:59.999Z`;

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

const handleTimeChange = val => {
  if (val) {
    formData.value.beginTime = `${val} 00:00:00`;
    formData.value.endTime = `${val} 23:59:59`;
  } else {
    // 当清空时间时，设置为今天
    const today = dayjs().format("YYYY-MM-DD");
    formData.value.timeRange = today;
    formData.value.beginTime = `${today} 00:00:00`;
    formData.value.endTime = `${today}T23:59:59.999Z`;
  }

  if (formData.value.detectionId) {
    detectionDataFun();
  }
};

// 添加窗口resize监听
onMounted(() => {
  window.addEventListener("resize", () => {
    myChart?.resize();
  });
});

onUnmounted(() => {
  window.removeEventListener("resize", () => {
    myChart?.resize();
  });
  myChart?.dispose();
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
