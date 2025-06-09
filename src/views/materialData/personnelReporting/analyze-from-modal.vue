<template>
  <v-detail-dialog show-full-screen :fixed-body-height="false" use-body-scrolling title="丢失分析" v-model="visible"
    :disableFooter="true" @cancel="cancelConfirm" @closed="handleClosed">

    <el-form class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]" inline>
      <el-form-item label="物料名称：">
        <el-select v-model="formData.materialsId" filterable placeholder="请选择物料名称" @change="materialsCodeChange"
          style="width: 300px">
          <div v-infinite-scroll="loadArchiveListFun">
            <el-option v-for="item in dataList" :key="item.materialsId" :label="`${item.name}-${item.code}`"
            :value="item.materialsId" />
          </div>
        
        </el-select>
      </el-form-item>
      <el-form-item label="时间范围：">
        <el-radio-group v-model="radio1" @change="radioChange">
          <el-radio-button label="week">周</el-radio-button>
          <el-radio-button label="month">月</el-radio-button>
          <el-radio-button label="year">年</el-radio-button>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <!-- <el-radio-group v-model:model-value="radio1" @change="radioChange">
      <el-radio-button label="week">周</el-radio-button>
      <el-radio-button label="month">月</el-radio-button>
      <el-radio-button label="year">年</el-radio-button>
    </el-radio-group> -->

    <div class="chart_container" ref="chartRef"></div>
  </v-detail-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { FormInstance } from "element-plus";
import VDetailDialog from "@/components/VDetailDialog/VDetailDialog.vue";
import * as echarts from "echarts";
import { getstatistics } from "@/api/materialData/personnelReporting";
import { materialsNameStockNameType } from "@/api/materialData/receiptRecord";
import { materialFilesList, materialFilesListRes } from "@/api/materialData/materialFiles";

const visible = ref(false);
const formRef = ref<FormInstance>();
const formData = reactive({
  materialsId: null
});

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
  const { data } = await getstatistics({ dayType: radio1.value, materialsId: formData.materialsId });
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
  archiveListFun().then(() => {
    if (dataList.value.length > 0) {
      formData.materialsId = dataList.value[0].materialsId;
      unit.value = dataList.value[0].unit;
    }
    getstatisticsList();
    if (chartRef.value) {
      myChart = echarts.init(chartRef.value);
      myChart.setOption(option);
    }
  });

};

function cancelConfirm() {
  visible.value = false;
}

function handleClosed() {
  radio1.value = "week";
}

const materialsCodeChange = async val => {
  // const selectedMaterial = dataList.value.find(
  //   item => item.materialsId === val
  // );
  // if (!selectedMaterial) return;

  getstatisticsList();

  // if (myChart) {
  //   myChart.setOption(option);
  // }
};
const form = ref<materialFilesListRes>({
  name: "",
  materialsType: "",
  pageSize: 10,
  pageNum: 1
});
const dataList = ref([]);
const unit = ref<string>("");
const loadArchiveListFun = () => {
  form.value.pageNum++;
  archiveListFun();
};
const archiveListFun = async () => {
  const { data } = await materialFilesList(form.value);
  if (data.rows && data.rows.length > 0) {
    dataList.value = [...dataList.value, ...data.rows];
    if (formData.materialsId == null || formData.materialsId ==0) {
      formData.materialsId = data.rows[0].materialsId;
    }
    if(unit.value == null || unit.value == "") {
      unit.value = data.rows[0].unit;
    }
  }
  // dataList.value = data.rows;
  // formData.materialsId = data.rows[0].materialsId;
  // unit.value = data.rows[0].unit;
};

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
