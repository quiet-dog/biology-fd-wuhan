<template>
  <v-detail-dialog show-full-screen :fixed-body-height="false" use-body-scrolling title="库存分析" v-model="visible"
    :disableFooter="true" @cancel="cancelConfirm" @opened="handleOpened" @closed="handleClosed">
    <el-form class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]">
      <el-form-item label="物料名称：">
        <el-select v-model="formData.materialsId" filterable placeholder="请选择物料名称" @change="materialsCodeChange"
          style="width: 300px">
          <el-option v-for="item in dataList" :key="item.materialsId" :label="`${item.name}--${item.code}`"
            :value="item.materialsId" />
        </el-select>
      </el-form-item>
      <el-radio-group @change="changeRadio" v-model="radio">
        <el-radio-button label="周" value="周"  />
        <el-radio-button label="月" value="月" />
        <el-radio-button label="年" value="年" />
      </el-radio-group>
    </el-form>

    <div style="width: 100%; height: 400px; margin-top: 10px" ref="chartRef" />
  </v-detail-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue";
import { FormInstance } from "element-plus";
import VDetailDialog from "@/components/VDetailDialog/VDetailDialog.vue";
import * as echarts from "echarts";
import {
  materialFilesListRes,
  materialFilesList,
  getstatistics,
  materialFilesInfo
} from "@/api/materialData/materialFiles";

const visible = ref(false);
const formRef = ref<FormInstance>();
const formData = reactive({
  materialsId: null
});
const unit = ref<string>("");
const radio = ref<string>("周");

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
  toolbox: {
    show: true
  },
  xAxis: {
    type: "category",
    data: [] // X 轴数据
  },
  yAxis: {
    type: "value"
  },
  tooltip: {
    trigger: "axis", // 悬浮提示触发类型，设置为 "axis" 可显示轴上的所有数据
    axisPointer: {
      type: "line" // 坐标轴指示器类型，可选 "line" | "shadow" | "none"
    },
    formatter: function (params) {
      // 获取当前 X 轴的值
      const xAxisValue = params[0].axisValue;

      // 取第一条系列数据并提取库存量和单位
      const firstSeries = params[0];
      const stock = firstSeries.value !== undefined ? firstSeries.value : "-";

      // 返回格式化提示框内容
      return `
        ${xAxisValue}<br>
        库存量: ${stock}<br>
        物料单位: ${unit.value}
      `;
    }
  },
  series: [
    {
      name: "", // 系列名称，将显示在提示框中
      data: [], // 数据数组
      type: "line", // 图表类型
      smooth: true, // 平滑曲线
      stack: "Total"
    }
  ]
};

const form = ref<materialFilesListRes>({
  name: "",
  materialsType: "",
  pageSize: 10000,
  pageNum: 1
});
const dataList = ref([]);
const archiveListFun = async () => {
  const { data } = await materialFilesList(form.value);
  dataList.value = data.rows;
  formData.materialsId = data.rows[0].materialsId;
  unit.value = data.rows[0].unit;
};

const materialsCodeChange = async val => {
  const { data } = await getstatistics(val);

  console.log(data);

  option.series.forEach(item => {
    item.data = data.seriesData;
  });
  option.xAxis.data = data.xaxisData;
  materialFilesInfo(val).then(res => {
    unit.value = res.data.unit;
  });

  if (myChart) {
    myChart.setOption(option); // 确保更新图表
  }
};

const handleOpened = async () => {
  visible.value = true;
  await archiveListFun();
  let val = "week";
  if (radio.value == "月") {
    val = "month";
  } else if (radio.value == "年") {
    val = "year";
  } else {
    val = "week";
  }
  const { data } = await getstatistics(formData.materialsId,val);

  option.series.forEach(item => {
    item.data = data.seriesData;
  });
  option.xAxis.data = data.xaxisData;
  if (!myChart && chartRef.value) {
    myChart = echarts.init(chartRef.value);
  }
  myChart?.setOption(option);
};

async function changeRadio(val) { 
  if (formData.materialsId == null || formData.materialsId == undefined || formData.materialsId == 0) {
    return;
  }
  if (val == "月") {
    val = "month";
  } else if (val == "年") {
    val = "year";
  } else {
    val = "week";
  }

  const { data } = await getstatistics(formData.materialsId,val);

  option.series.forEach(item => {
    item.data = data.seriesData;
  });
  option.xAxis.data = data.xaxisData;
  if (!myChart && chartRef.value) {
    myChart = echarts.init(chartRef.value);
  }
  myChart?.setOption(option);
}

function cancelConfirm() {
  visible.value = false;
}

function handleClosed() {
  formData.materialsId = null;
  myChart.dispose();
  myChart = null;
}

defineExpose({
  handleOpened
});
</script>

<style lang="scss" scoped></style>
