<template>
  <v-detail-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    title="丢失分析"
    v-model="visible"
    :disableFooter="true"
    @cancel="cancelConfirm"
    @opened="handleOpened"
    @closed="handleClosed"
  >
    <el-radio-group v-model:model-value="radio1" @change="radioChange">
      <el-radio-button label="week">周</el-radio-button>
      <el-radio-button label="month">月</el-radio-button>
      <el-radio-button label="year">年</el-radio-button>
    </el-radio-group>

    <div class="chart_container" ref="chartRef"></div>
  </v-detail-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue";
import { FormInstance } from "element-plus";
import VDetailDialog from "@/components/VDetailDialog/VDetailDialog.vue";
import * as echarts from "echarts";
import { getstatistics } from "@/api/materialData/personnelReporting";

const visible = ref(false);
const formRef = ref<FormInstance>();

const radio1 = ref("week");

let myChart: any = null;
const chartRef = ref();
const option = {
  grid: {
    left: "5%", // 左侧边距
    right: "5%", // 右侧边距
    bottom: "5%",
    top: "10%",
    containLabel: true
  },
  xAxis: {
    type: "category",
    data: []
  },
  yAxis: {
    type: "value"
  },
  series: [
    {
      data: [],
      type: "bar"
    }
  ]
};

const getstatisticsList = async () => {
  const { data } = await getstatistics({ dayType: radio1.value });
  option.series.forEach(item => {
    item.data = data.seriesData;
  });
  option.xAxis.data = data.xdata;

  if (myChart) {
    myChart.setOption(option); // 确保更新图表
  }
};

const radioChange = async val => {
  radio1.value = val;
  await getstatisticsList();
};

const handleOpened = () => {
  visible.value = true;
  getstatisticsList();
  if (chartRef.value) {
    myChart = echarts.init(chartRef.value);
    myChart.setOption(option);
  }
};

function cancelConfirm() {
  visible.value = false;
}

function handleClosed() {
  radio1.value = "week";
}

defineExpose({
  handleOpened
});
</script>

<style lang="scss" scoped>
.chart_container {
  width: 100%;
  height: 400px;
  margin-top: 10px;
}
</style>
