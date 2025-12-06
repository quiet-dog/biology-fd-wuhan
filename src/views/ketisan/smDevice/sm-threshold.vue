<script lang="ts" setup>
import { getSmThreshold, setSmThrehold } from "@/api/smDevice";
import { GetSmThresholdRes, SetSmThreshold } from "@/api/smDevice/types";
import VDialog from "@/components/VDialog/VDialog.vue";
import { ElForm } from "element-plus";
import { ref } from "vue";
import { ElMessage } from "element-plus";
const dialogVisible = ref(false);
const deviceId = ref(0);
const info = ref<GetSmThresholdRes[]>();
function open(id) {
  deviceId.value = id;
  dialogVisible.value = true;
}

const dataMap = ref({
  心率: 0,
  血氧: 0,
  体温: 0,
  co2: 0,
  呼吸: 0,
  心电: 0
});

function handleConfirm() {
  const result: SetSmThreshold = {
    id: deviceId.value,
    data: []
  };
  info.value.forEach(item => {
    result.data.push({
      type: item.type,
      values: item.data
    });
  });

  setSmThrehold(result).then(res => {
    dialogVisible.value = false;
    ElMessage.success("设备成功");
  });
}

function cancelConfirm() {
  dialogVisible.value = false;
}

function handleOpened() {
  getSmThreshold(deviceId.value).then(res => {
    info.value = res.data;
    info.value.forEach(item => {
      if (Array.isArray(item.data) && item.data.length > 0) {
        dataMap.value[item.type] = item.data.length;
      } else {
        dataMap.value[item.type] = 0;
      }
    });
  });
}

function changeNum(val: number, type: string) {
  info.value.forEach(item => {
    if (item.type === type) {
      while (item.data.length > val) {
        item.data.shift();
      }

      while (item.data.length < val) {
        item.data.push({
          smDeviceId: deviceId.value,
          min: 0,
          max: 0,
          type: type,
          level: "轻微"
        });
      }
    }
  });
}

function handleClosed() {}

defineExpose({
  open
});
</script>

<template>
  <VDialog
    title="阈值设置"
    v-model="dialogVisible"
    @confirm="handleConfirm"
    @cancel="cancelConfirm"
    @opened="handleOpened"
    @closed="handleClosed"
  >
    <!-- <el-tabs>
        <el-tab-pane v-for="item in info" :label="item.type" :name="item.type+'阈值设置'">
          <el-form>
            <el-form-item>

            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs> -->

    <el-form>
      <template v-for="item in info">
        <el-row>
          <el-col :span="12">
            <el-form-item label="体征指标">
              <el-input v-model="item.type" disabled style="width: 300px" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="级别层级">
              <el-input-number
                style="width: 300px"
                @change="changeNum($event, item.type)"
                v-model="dataMap[item.type]"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row v-for="threhold in item.data">
          <el-col :span="12">
            <el-form-item label="报警级别">
              <el-select style="width: 300px" v-model="threhold.level">
                <el-option label="轻微" value="轻微" />
                <el-option label="一般" value="一般" />
                <el-option label="中度" value="中度" />
                <el-option label="重要" value="重要" />
                <el-option label="紧急" value="紧急" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="指标区间">
              <el-row>
                <el-col :span="11">
                  <el-input type="number" v-model="threhold.min" />
                </el-col>
                <el-col style="text-align: center" :span="2">
                  <span>至</span>
                </el-col>
                <el-col :span="11">
                  <el-input type="number" v-model="threhold.max" />
                </el-col>
              </el-row>
            </el-form-item>
          </el-col>
        </el-row>
      </template>
    </el-form>
  </VDialog>
</template>

<style scoped></style>
