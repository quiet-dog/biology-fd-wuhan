<template>
  <v-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    title="空调数据"
    v-model="visible"
    :loading="loading"
    @confirm="handleConfirm"
    @cancel="cancelConfirm"
    @opened="handleOpened"
    @closed="handleClosed"
    :destroy-on-close="true"
  >
    <div>
      <el-row>
        <el-col :span="12">
          <!-- 时间筛选 -->
          <el-form>
            <el-form-item label="时间：">
              <el-date-picker
                v-model="timeRange"
                type="daterange"
                placeholder="请选择时间"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                @change="changeTimeRange"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="12" />
      </el-row>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="createTime" label="日期" width="180" />
        <el-table-column
          prop="zhiBanGongKuanYaLiSheDing"
          label="值班工况压力设定值"
          width="180"
        />
        <el-table-column
          prop="zhiBanGongKuanFengLiangSheDing"
          label="值班工况风量设定值"
          width="180"
        />
        <el-table-column
          prop="fengFaWenDingZhuangTai"
          label="风阀稳定状态标志位"
          width="180"
        />
        <el-table-column prop="faWeiFanKuan" label="阀位反馈" width="180" />
        <el-table-column
          prop="qiangZhiFaWeiSheDing"
          label="强制阀位的设定值"
          width="180"
        />
        <el-table-column
          prop="qiangZhiMoShiKaiGuan"
          label="强制模式开关"
          width="180"
        />
        <el-table-column
          prop="pidKongZhiJiFenXiShu"
          label="PID控制积分系数"
          width="180"
        />
        <el-table-column
          prop="pidKongZhiBiLiXiShu"
          label="PID控制比例系数"
          width="180"
        />
        <el-table-column
          prop="fangJianShiJiYaLi"
          label="房间实际压力"
          width="180"
        />
        <el-table-column prop="gongKuangMoShi" label="工况模式" width="180" />
        <el-table-column
          prop="shuangGongKuangQieHuanShiJian"
          label="双工况切换时间"
          width="180"
        />
        <el-table-column
          prop="fengLiangSheDing"
          label="风量的设定值"
          width="180"
        />
        <el-table-column prop="yaLiSheDing" label="压力的设定值" width="180" />
      </el-table>
      <!-- 分页 -->
      <el-pagination
        v-model:current-page="searchParams.pageNum"
        v-model:page-size="searchParams.pageSize"
        layout="total, prev, pager, next"
        :total="total"
      />
    </div>
  </v-dialog>
</template>
<script lang="ts" setup>
import { kongTiaoDataList } from "@/api/kongTiaoData";
import VDialog from "@/components/VDialog/VDialog.vue";
import { ref } from "vue";
const visible = ref(false);
const loading = ref(false);
const tableData = ref([]);
const deviceSn = ref("");
const deviceType = ref("回风机");
const total = ref(0);
const timeRange = ref([]);
function changeTimeRange(val: any) {
  if (val) {
    searchParams.value.beginTime = val[0];
    searchParams.value.endTime = val[1];
  } else {
    searchParams.value.beginTime = undefined;
    searchParams.value.endTime = undefined;
  }
  archiveListFun();
}

const handleConfirm = () => {
  console.log("handleConfirm");
};

const cancelConfirm = () => {
  console.log("handleCancel");
};

const handleOpened = () => {
  console.log("handleOpened");
};

const handleClosed = () => {
  console.log("handleClosed");
};
const searchParams = ref({
  deviceSn: "",
  pageNum: 1,
  pageSize: 10
});

function archiveListFun() {
  loading.value = true;
  kongTiaoDataList({
    ...searchParams.value
  })
    .then(res => {
      // @ts-expect-error
      tableData.value = res.data.rows;
      // @ts-expect-error
      total.value = res.data.total;
    })
    .finally(() => {
      loading.value = false;
    });
}

function open(sn: string) {
  // deviceType.value = type;
  deviceSn.value = sn;
  searchParams.value.deviceSn = sn;
  visible.value = true;
  archiveListFun();
}
defineExpose({
  open
});
</script>

<style scoped lang="scss"></style>
