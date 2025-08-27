<script lang="ts" setup>
import { use } from "echarts/core";
import VEcharts from "vue-echarts";
import VDialog from "@/components/VDialog/VDialog.vue";

// 按需导入 ECharts 组件
import { CanvasRenderer } from "echarts/renderers";
import { LineChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent
} from "echarts/components";
import { ref } from "vue";
import { getSmData } from "@/api/smData";
import { SmDataRow } from "@/api/smData/types";

const visible = ref(false);

use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent
]);

// const { smDataId = 0 } = defineProps<{
//   smDataId:number
// }>()
const smDataId = ref(0);
const vChartRef = ref<InstanceType<typeof VEcharts>>();

const option = ref({
  title: {
    text: "心电图",
    left: "center"
  },
  tooltip: {
    trigger: "axis",
    formatter: params => {
      // 采样点: ${params[0].dataIndex}<br/>
      return `心电值: ${params[0].data}`;
    }
  },
  xAxis: {
    type: "category",
    show: false,
    // data: ecgData.map((_, index) => index)
    data: []
  },
  yAxis: {
    type: "value",
    name: "电压",
    // 加单位
    axisLabel: {
      formatter: "{value}mV"
    }
  },
  grid: {
    left: "10%",
    right: "10%",
    top: 40,
    bottom: 40
  },
  series: [
    {
      name: "心电信号",
      type: "line",
      smooth: true,
      showSymbol: false,
      data: []
    }
  ]
});

const smDataInfo = ref();
function handleOpened(id) {
  smDataId.value = id;
  getSmData(id).then((res: SmDataRow) => {
    // @ts-expect-error
    smDataInfo.value = res.data;
    option.value.xAxis.data = smDataInfo.value.xinDian.map((_, index) => index);
    option.value.series[0].data = smDataInfo.value.xinDian;
    vChartRef.value.render();
  });
  visible.value = true;
}

function handleClosed() {
  visible.value = false;
}

defineExpose({
  handleOpened
});
</script>

<template>
  <v-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    title="查看心电"
    v-model="visible"
    @closed="handleClosed"
    @cancel="handleClosed"
  >
    <div class="auto-div">
      <v-echarts :option="option" ref="vChartRef" class="echart" />
    </div>
  </v-dialog>
</template>

<style scoped>
.auto-div {
  margin: auto;
  justify-items: center;
}
.echart {
  height: 400px;
  width: 700px;
  margin-top: 10px;
}
</style>
