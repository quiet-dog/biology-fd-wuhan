<template>
  <v-detail-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    title="报警频次分析"
    v-model="visible"
    :disableFooter="true"
    @cancel="cancelConfirm"
    @opened="handleOpened"
  >
    <el-radio-group v-model:model-value="radio1" @change="radioChange">
      <el-radio-button label="week">周</el-radio-button>
      <!-- <el-radio-button label="month">年</el-radio-button> -->
      <el-radio-button label="year">月</el-radio-button>
    </el-radio-group>

    <div class="chart_container" ref="chartRef" />
  </v-detail-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue";
import { FormInstance } from "element-plus";
import VDetailDialog from "@/components/VDetailDialog/VDetailDialog.vue";
import * as echarts from "echarts";
import { getstatistics } from "@/api/alarmPlatform/alarmEvents";
import dayjs from "dayjs";

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
  legend: {},
  tooltip: {},
  dataset: {
    source: []
  },
  xAxis: {
    type: "category"
  },
  yAxis: {},
  series: [{ type: "bar" }, { type: "bar" }, { type: "bar" }, { type: "bar" }]
};

const getstatisticsList = () => {
  getstatistics({ dayType: radio1.value }).then(res => {
    option.dataset.source = transformToDatasetSource(res.data);
    if (myChart) {
      myChart.setOption(option); // 确保图表已经初始化
    }
  });
};

// 转换函数
function transformToDatasetSource(data) {
  // 提取报警类型
  const types = data.map(item => item.type);

  // 获取当前日期
  const currentDate = dayjs(); // 使用 dayjs 获取当前日期

  // 初始化 source 的表头
  const source = [["product", ...types]];

  // data.forEach(item => {
  //   sp
  // });

  let timeAxisLength = 0;
  const startOfWeek = currentDate.startOf("week").add(1, "day"); // 本周周一（加1秒）

  if (radio1.value === "week") {
    timeAxisLength = 7; // 周数据有7天
  } else if (radio1.value === "month") {
    timeAxisLength = currentDate.daysInMonth(); // 月数据是当前月的天数
  } else if (radio1.value === "year") {
    timeAxisLength = 12; // 年数据是12个月
  }

  // 根据 radio1 选择的类型生成日期标签
  let dateLabels = [];
  for (let i = 0; i < timeAxisLength; i++) {
    let label: string;

    if (radio1.value === "week") {
      // 周数据：从本周周一到周日
      const weekDate = startOfWeek.add(i, "day"); // 往后推加i天
      label = weekDate.format("YYYY-MM-DD"); // 格式化为 YYYY-MM-DD
    } else if (radio1.value === "month") {
      // 月份数据：显示当前月的每一天，直到本月最后一天
      const monthDate = currentDate.startOf("month"); // 设置当前日期的天数，并确保第一天是 00:00:01

      label = monthDate.format("YYYY-MM-DD"); // 格式化为 YYYY-MM-DD
      console.log(label);
    } else if (radio1.value === "year") {
      // 年数据：显示当前年1月到当前月
      const yearDate = currentDate.month(i); // 设置月份
      label = yearDate.format("YYYY-MM"); // 格式化为 YYYY-MM
    }

    dateLabels.push(label);
  }
  dateLabels = data[0].times;

  // 填充每一天的数据
  for (let i = 0; i < timeAxisLength; i++) {
    const row = [dateLabels[i]]; // 日期标识
    data.forEach(item => {
      row.push(item.data[i] || 0); // 填充对应报警类型的数据，如果数据为空则填充0
    });
    source.push(row);
  }

  return source;
}

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
  formRef.value?.resetFields();
}

// 处理时间类型切换
function radioChange() {
  getstatisticsList();
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
