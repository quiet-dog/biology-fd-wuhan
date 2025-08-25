<script lang='ts' setup>
import { use } from 'echarts/core'
import VEcharts from 'vue-echarts'
import VDialog from "@/components/VDialog/VDialog.vue";

// 按需导入 ECharts 组件
import {
  CanvasRenderer
} from 'echarts/renderers'
import {
  LineChart
} from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent
} from 'echarts/components'
import { ref } from 'vue'
import { getSmData } from '@/api/smData';
import { SmDataRow } from '@/api/smData/types';

const visible = ref(false)

use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent
])

// const { smDataId = 0 } = defineProps<{
//   smDataId:number
// }>()
const smDataId = ref(0)
const vChartRef = ref<InstanceType<typeof VEcharts>>()

const option = ref({
  title: {
    text: '呼吸图',
    left: 'center'
  },
  tooltip: {
    trigger: 'axis',
    formatter: (params) => {
      return `采样点: ${params[0].dataIndex}<br/>呼吸值: ${params[0].data}`
    }
  },
  xAxis: {
    type: 'category',
    show: false,
    // data: breathData.map((_, i) => i)
    data: []
  },
  yAxis: {
    type: 'value',
    name: '幅度',
    axisLabel: {
      formatter: '{value}'
    }
  },
  grid: {
    left: '8%',
    right: '8%',
    top: 50,
    bottom: 40
  },
  series: [
    {
      name: '呼吸信号',
      type: 'line',
      smooth: true,
      showSymbol: false,
      lineStyle: {
        width: 2
      },
      data: []
    }
  ]
})

const smDataInfo = ref()
function handleOpened(id) {
  smDataId.value = id
  getSmData(id).then((res: SmDataRow) => {
    // @ts-expect-error
    smDataInfo.value = res.data
    option.value.xAxis.data = smDataInfo.value.huxi.map((_, index) => index)
    option.value.series[0].data = smDataInfo.value.huxi
    vChartRef.value.render()
  })
  visible.value = true;

}

function handleClosed() {

}

defineExpose({
  handleOpened
})

</script>

<template>
  <v-dialog show-full-screen :fixed-body-height="false" use-body-scrolling title="心电" v-model="visible"
    @closed="handleClosed">
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
  ;
  margin-top: 10px;
}
</style>
