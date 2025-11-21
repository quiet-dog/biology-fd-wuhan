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
            v-model="formData.unitName"
            placeholder="请选择点位"
            @change="selectChange"
            style="width: 240px"
          >
            <el-option
              v-for="item in dataList"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="日期：" class="form-item">
          <el-date-picker
            v-model="formData.timeRange"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            @change="handleTimeChange"
            :clearable="false"
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
  allGroup,
  detectionList,
  getBuTongApi
} from "@/api/environmentalData/alarmLevelSetting";
import dayjs from "dayjs";
import { nextTick } from "process";

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
  legend: {
    data: [],
    // 白色
    textStyle: {
      // color: "#ffffff",
    }
  },
  xAxis: {
    type: "category",
    data: [],
    boundaryGap: false,
    axisLabel: {
      // color: "#ffffff",
    }
  },
  yAxis: {
    type: "value",
    axisLine: { show: true }, // y轴线
    axisTick: { show: true }, // y轴刻度
    splitLine: { show: true }, // y轴网格线
    axisLabel: { show: true } // y轴数值
  },
  series: [
    {
      data: [],
      type: "bar",
      itemStyle: {
        color: "#68B1A6" // 线条颜色
      }
    }
  ],
  tooltip: {
    trigger: "axis", // 多个系列共用一个 tooltip
    axisPointer: {
      type: "cross", // 设置为 cross（十字线）或 'line'（仅竖线）
      label: {
        backgroundColor: "#6a7985" // 可选：让标签更清晰
      }
    }
  }
};

const formData = ref({
  detectionId: null,
  beginTime: "",
  des: "",
  endTime: "",
  timeRange: "",
  unitName: ""
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
  form.value.pageNum++;
  archiveListFun();
};

const archiveListFun = async () => {
  // getBuTongApi().then(res => {
  //   dataList.value = res.data.rows;
  // })
  allGroup().then(res => {
    //  dataList.value = res.data.unitName
    // 将 电 和 水 删除
    dataList.value = res.data.unitName.filter(
      item => item !== "电" && item !== "水" && !item.includes("报警")
    );
    console.log("dataList", dataList.value);
  });
};

const detectionDataFun = async () => {
  // getBuTongApi({
  //   unitName: formData.value.unitName,
  //   beginTime: formData.value.beginTime,
  //   endTime: formData.value.endTime
  // }).then(res => {
  //   option.series = res.data.series;
  //   option.xAxis.data = res.data.xdata;
  //   option.legend.data = res.data.series.map(item => item.name);
  //   console.log("option", option);
  //   if (!myChart.value) {
  //     myChart.value = echarts.init(chartRef.value);
  //   }
  //   myChart.value.setOption(option, true);
  // });
  powerByAreaTotalStaticFun();
};

const powerByAreaTotalStaticFun = async () => {
  const { data } = await getBuTongApi({
    unitName: formData.value.unitName,
    beginTime: formData.value.beginTime,
    endTime: formData.value.endTime
  });
  option.legend.data = data.series.map(item => item.name);
  option.xAxis.data = data.xdata;
  option.series = data.series;
  option.yAxis.min = 1;
  if (Array.isArray(data.series) && data?.series.length > 0) {
    const xData = [];
    data?.series.forEach(item => {
      if (Array.isArray(item.data) && item.data.length > 0) {
        xData.append(...item.data);
      }
    });
    option.yAxis.max = Math.max(...xData, 6);
  } else {
    option.yAxis.max = 6;
  }

  nextTick(() => {
    if (myChart == null) {
      myChart = echarts.init(chartRef.value);
    }

    // 加上单位
    option.tooltip.formatter = function (params) {
      // params有多个
      return params
        .map(p => {
          return `${p.marker}${p.seriesName}: ${p.value} ${data?.unitName}`;
        })
        .join("<br/>");
    };
    myChart.setOption(option, true);
  });
};

const handleOpened = async () => {
  visible.value = true;
  console.log("handleOpened");
  await archiveListFun();

  // 默认选中第一个
  if (dataList.value.length > 0) {
    formData.value.unitName = dataList.value[0];
  }

  // 设置默认时间为今天，使用 ISO 格式
  const today = dayjs().format("YYYY-MM-DD");
  formData.value.timeRange = today;
  formData.value.beginTime = dayjs(today).startOf("day").format("YYYY-MM-DD");
  formData.value.endTime = dayjs(today)
    .add(1, "day")
    .startOf("day")
    .format("YYYY-MM-DD");

  await detectionDataFun();
};

function cancelConfirm() {
  visible.value = false;
  formRef.value?.resetFields();
}

const selectChange = async val => {
  formData.value.unitName = val;
  if (val) {
    await detectionDataFun();
  }
};

const handleTimeChange = val => {
  // 转为YYYY-MM-DD格式
  formData.value.beginTime = dayjs(val).startOf("day").format("YYYY-MM-DD");
  formData.value.endTime = dayjs(val)
    .add(1, "day")
    .startOf("day")
    .format("YYYY-MM-DD");
  detectionDataFun();
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
