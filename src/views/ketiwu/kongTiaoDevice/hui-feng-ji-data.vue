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
        <el-col :span="8">
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
        <el-col :span="16" />
      </el-row>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="createTime" label="回风机手自动" width="180" />
        <el-table-column
          prop="huiFengJiShouZiDong"
          label="回风机手自动"
          width="180"
        />
        <el-table-column
          prop="huiFengJiGuZhang"
          label="回风机故障"
          width="180"
        />
        <el-table-column
          prop="huiFengJiYunXing"
          label="回风机运行"
          width="180"
        />
        <el-table-column
          prop="huiFengMiBiKaiGuanKongZhi"
          label="回风密闭阀-开关控制"
          width="180"
        />
        <el-table-column
          prop="huiFengMiBiGuanDaoWei"
          label="回风密闭阀-关到位"
          width="180"
        />
        <el-table-column
          prop="huiFengMiBiKaiDaoWei"
          label="回风密闭阀-开到位"
          width="180"
        />
        <el-table-column
          prop="huiFengJiQiTing"
          label="回风机启停"
          width="180"
        />
        <el-table-column
          prop="yuanXinFengKouZengJiaXinFengFaKaiGuanKongZhi"
          label="原新风口增加新风阀-开关控制"
          width="180"
        />
        <el-table-column
          prop="zengJiaXinFengKouXinFengFaKaiGuanKongZhi"
          label="增加新风口新风阀-开关控制"
          width="180"
        />
        <el-table-column
          prop="yuanXinFengKouZengJiaXinFengFaGuanDaoWei"
          label="原新风口增加新风阀-关到位"
          width="180"
        />
        <el-table-column
          prop="zengJiaXinFengKouXinFengFaGuanDaoWei"
          label="增加新风口新风阀-关到位"
          width="180"
        />
        <el-table-column
          prop="yuanXinFengKouZengJiaXinFengFaKaiDaoWei"
          label="原新风口增加新风阀-开到位"
          width="180"
        />
        <el-table-column
          prop="zengJiaXinFengKouXinFengFaKaiDaoWei"
          label="增加新风口新风阀-开到位"
          width="180"
        />
        <el-table-column prop="moShiQieHuan" label="模式切换" width="180" />
        <el-table-column prop="gongKuangQieHuan" label="工况切换" width="180" />
        <el-table-column
          prop="huiFengJiPinLvFanKuan"
          label="回风机频率反馈"
          width="180"
        />
        <el-table-column
          prop="paiFengFaZhiGuanFengFaFanKuan"
          label="排风阀支管风阀反馈"
          width="180"
        />
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
