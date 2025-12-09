<template>
  <v-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    title="查看报警趋势"
    v-model="visible"
    @closed="handleClosed"
    @cancel="handleClosed"
    :confirm-show="false"
  >
    <div>
      <el-select
        v-model="selectValue"
        placeholder="请选择"
        @change="changeSelectValue"
      >
        <el-option label="周" value="week" />
        <el-option label="月" value="month" />
        <el-option label="年" value="year" />
      </el-select>
    </div>
    <div class="auto-div" ref="chartRef" />
  </v-dialog>
</template>

<script setup lang="ts">
import { getXunJianEcharts } from "@/api/xunJian";
import VDialog from "@/components/VDialog/VDialog.vue";
import { nextTick, ref } from "vue";
import * as echarts from "echarts";
const chartRef = ref(null);

const visible = ref(false);

function handleClosed() {
  visible.value = false;
}
function handleOpened() {
  visible.value = true;
}

function handleCancel() {
  visible.value = false;
}

const selectValue = ref("week");

function changeSelectValue(val) {
  getXunJianEcharts(val).then(res => {
    console.log(res);
    options.xAxis.data = res.data.xData;
    options.series[0].data = res.data.yData;
    nextTick(() => {
      myChart.setOption(options, true);
    });
  });
}

// 绘制线性趋势图xData,yData
const options = {
  xAxis: {
    type: "category",
    data: []
  },
  yAxis: {
    type: "value",
    // 数量
    name: "数量"
  },
  series: [
    {
      name: "巡检记录",
      type: "line",
      data: []
    }
  ],
  tooltip: {
    trigger: "axis",
    formatter: params => {
      return `${params[0].name}: ${params[0].value}`;
    }
  }
};

let myChart = null;

function open() {
  getXunJianEcharts(selectValue.value).then(res => {
    console.log(res);
    visible.value = true;
    options.xAxis.data = res.data.xData;
    options.series[0].data = res.data.yData;
    nextTick(() => {
      if (chartRef.value != null && myChart == null) {
        myChart = echarts.init(chartRef.value);
      }
      myChart.setOption(options, true);
    });
  });
}

defineExpose({
  open
});
</script>

<style scoped>
.auto-div {
  width: 800px;
  height: 400px;
  margin: 0 auto;
}
</style>
