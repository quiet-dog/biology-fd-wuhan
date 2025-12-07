<template>
  <v-detail-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    :is-show-confirm="false"
    title="历史趋势"
    v-model="visible"
    :disableFooter="true"
    @cancel="cancelConfirm"
  >
    <div class="chart_container" ref="chartRef" />
  </v-detail-dialog>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue";
import VDetailDialog from "@/components/VDetailDialog/VDetailDialog.vue";
import * as echarts from "echarts";
import { getXunJianAlarmCount } from "@/api/environmentalData/alarmLevelSetting";

const visible = ref(false);

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
    type: "category"
  },
  yAxis: {
    type: "value",
    name: "数量"
  },
  series: [
    {
      name: "数量",
      type: "line",
      data: [],
      itemStyle: { color: "#409EFF" }
    }
  ]
};

const detectionDataFun = async () => {
  const data = await getXunJianAlarmCount("day");
  console.log("获取的统计数据：", data);

  // 更新图表数据
  option.series[0].data = data.data.data;
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
  await detectionDataFun();
};

function cancelConfirm() {
  visible.value = false;
}

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
