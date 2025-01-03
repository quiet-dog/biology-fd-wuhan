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
    @opened="handleOpened"
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
            <el-option
              v-for="item in dataList"
              :key="item.detectionId"
              :label="`${item.environment.description} - ${item.environment.unitName}`"
              :value="item.detectionId"
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
import { detectionList } from "@/api/environmentalData/alarmLevelSetting";
import dayjs from "dayjs";

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
    type: "time",
    axisLabel: {
      formatter: value => {
        return dayjs(value).format("HH:mm:ss");
      }
    }
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
      itemStyle: { color: "#409EFF" }
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
  pageSize: 10000,
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

const archiveListFun = async () => {
  const { data } = (await detectionList({
    ...form.value,
    description: "",
    tag: ""
  })) as DetectionResponse;
  const uniqueMap = new Map();
  data.rows.forEach(item => {
    if (!uniqueMap.has(item.environment.description)) {
      uniqueMap.set(item.environment.description, item);
    }
  });
  dataList.value = Array.from(uniqueMap.values());
};

const detectionDataFun = async () => {
  const currentEnv = dataList.value.find(
    item => item.detectionId === formData.value.detectionId
  )?.environment;

  const { data } = (await detectionList({
    description: currentEnv.description,
    pageSize: 10000,
    pageNum: 1,
    startCreateTime: dayjs(formData.value.beginTime).format("YYYY-MM-DD"),
    tag: ""
  })) as DetectionResponse;

  // 过滤出当前环境的数据
  const filteredData = data.rows
    .filter(item => item.environmentId === currentEnv.environmentId)
    .map(item => [item.createTime, item.value])
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());

  // 更新图表数据
  option.series[0].data = filteredData;

  // 初始化或更新图表
  if (!myChart.value) {
    myChart.value = echarts.init(chartRef.value);
  }
  myChart.value.setOption(option);
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
