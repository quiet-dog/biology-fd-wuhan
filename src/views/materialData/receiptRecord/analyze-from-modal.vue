<template>
  <v-detail-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    title="领用分析"
    v-model="visible"
    :disableFooter="false"
    @cancel="cancelConfirm"
    @opened="handleOpened"
    @closed="handleClosed"
  >
    <el-form class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]" inline>
      <el-form-item label="物料名称：">
        <el-select
          v-model="formData.materialsId"
          filterable
          placeholder="请选择物料名称"
          @change="materialsCodeChange"
          style="width: 300px"
        >
          <div v-infinite-scroll="loadArchiveListFun">
            <el-option
              v-for="item in dataList"
              :key="item.materialsId"
              :label="`${item.name}-${item.code}`"
              :value="item.materialsId"
            />
          </div>
        </el-select>
      </el-form-item>
      <el-form-item label="时间范围：">
        <el-radio-group v-model="params.dateType">
          <el-radio-button label="week">周</el-radio-button>
          <el-radio-button label="month">月</el-radio-button>
          <el-radio-button label="year">年</el-radio-button>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <div style="width: 100%; height: 400px; margin-top: 10px" ref="chartRef" />
  </v-detail-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from "vue";
import { FormInstance } from "element-plus";
import VDetailDialog from "@/components/VDetailDialog/VDetailDialog.vue";
import * as echarts from "echarts";
import {
  materialFilesListRes,
  materialFilesList,
  getstatistics,
  materialFilesInfo
} from "@/api/materialData/materialFiles";
import { materialsNameStockNameType } from "@/api/materialData/receiptRecord";

const visible = ref(false);
const formRef = ref<FormInstance>();

const formData = reactive({
  materialsId: null
});

const unit = ref<string>("");

const emits = defineEmits(["success"]);

let myChart: any = null;
const chartRef = ref();
const option = ref({
  title: {
    text: "暂无数据"
  },
  tooltip: {
    trigger: "item"
    // formatter: "{a} <br/>{b}: {c} {unit}"
  },
  legend: {
    orient: "vertical",
    left: "left",
    data: []
  },
  series: [
    {
      name: "物料使用情况",
      type: "pie",
      radius: "50%",
      data: []
    }
  ]
});

const form = ref<materialFilesListRes>({
  name: "",
  materialsType: "",
  pageSize: 10000,
  pageNum: 1
});

const params = ref<any>({
  materialsName: "",
  dateType: "week"
});

const dataList = ref([]);
const loadArchiveListFun = () => {
  form.value.pageNum++;
  archiveListFun();
};
const archiveListFun = async () => {
  const { data } = await materialFilesList(form.value);
  if (data.rows && data.rows.length > 0) {
    dataList.value = [...dataList.value, ...data.rows];
    if (formData.materialsId == null || formData.materialsId == 0) {
      formData.materialsId = data.rows[0].materialsId;
    }
    if (unit.value == null || unit.value == "") {
      unit.value = data.rows[0].unit;
    }
  }
};

const materialsCodeChange = async val => {
  // const selectedMaterial = dataList.value.find(
  //   item => item.materialsId === val
  // );
  // if (!selectedMaterial) return;

  const response = await materialsNameStockNameType({
    materialsId: val,
    dateType: params.value.dateType
  });

  if (response.data && response.data.length > 0) {
    const chartData = response.data.map(item => ({
      name: item.materialsType == null ? "未知" : item.materialsType,
      value: item.count
      // unit: selectedMaterial.unit
    }));
    option.value.title = {};
    option.value.series = [
      {
        name: "物料使用情况",
        type: "pie",
        radius: "50%",
        data: []
      }
    ];
    option.value.series[0].data = chartData;
    console.log("option.series[0].data", option.value.series[0].data);
    // option.legend.data = chartData.map(item => item.name);

    // option.tooltip.formatter = `{a} <br/>{b}: {c} ${selectedMaterial.unit}`;
    // option.series[0].label.formatter = `{b}: {c} ${selectedMaterial.unit}`;
  } else {
    option.value.series = [];
    option.value.legend.data = [];
    option.value.title = {
      text: "暂无数据",
      left: "center",
      top: "middle",
      textStyle: { color: "#999", fontSize: 18 }
    };
  }

  if (myChart) {
    myChart.setOption(option.value, true);
  }
};

watch(
  () => params.value.dateType,
  async newVal => {
    if (formData.materialsId) {
      await materialsCodeChange(formData.materialsId);
    }
  }
);

const handleOpened = async () => {
  visible.value = true;
  await archiveListFun();

  const response = await materialsNameStockNameType({
    // materialsName: dataList.value[0]?.name || "",
    materialsId: formData.materialsId,
    dateType: params.value.dateType
  });

  if (response.data && response.data.length > 0) {
    const chartData = response.data.map(item => ({
      name: item.materialsType == null ? "未知" : item.materialsType,
      value: item.count
    }));
    option.value.series = [
      {
        name: "物料使用情况",
        type: "pie",
        radius: "50%",
        data: []
      }
    ];

    option.value.series[0].data = chartData;
    option.value.title = {};
    // option.legend.data = chartData.map(item => item.name);
  } else {
    option.value.series = [];
    option.value.legend.data = [];
    option.value.title = {
      text: "暂无数据",
      left: "center",
      top: "middle",
      textStyle: { color: "#999", fontSize: 18 }
    };
  }

  if (!myChart && chartRef.value) {
    myChart = echarts.init(chartRef.value);
  }
  myChart?.setOption(option.value, true);
};

function cancelConfirm() {
  visible.value = false;
  emits("success");
}

function handleClosed() {
  formData.materialsId = null;
  myChart.dispose();
  myChart = null;
  emits("success");
}

defineExpose({
  handleOpened
});
</script>

<style lang="scss" scoped></style>
