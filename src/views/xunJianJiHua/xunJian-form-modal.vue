<script setup lang="ts">
import {
  addXunJianApi,
  AddXunJianCommand,
  XunJianPageResponse,
  XunJianTypeEntity,
  updateXunJianApi,
  UpdateXunJianCommand,
  getAllAreas
} from "@/api/manage/xunJian.ts";
import VDialog from "@/components/VDialog/VDialog.vue";
import { ElMessage, FormInstance, FormRules } from "element-plus";
import { computed, onMounted, reactive, ref } from "vue";
import CUplopad from "@/components/CUpload/index.vue";
import { json } from "stream/consumers";
import dayjs from "dayjs";

interface Props {
  type: "add" | "update";
  modelValue: boolean;
  row?: XunJianPageResponse;
}

const rules: FormRules = {
  title: [
    {
      required: true,
      message: "标题不能为空"
    }
  ]
};

const props = defineProps<Props>();

const emits = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (e: "success"): void;
}>();

const loading = ref(false);

const formRef = ref<FormInstance>();
const CUplopadRef = ref();

const formData = reactive<AddXunJianCommand | UpdateXunJianCommand>({
  xunJianId: 0,
  fanWei: "",
  xunJianPinLu: "每日",
  xunJianLeiXing: "定点巡检",
  enable: false,
  timeRange: [],
  dayRange: []
});

const targetAreas = ref([]);

const visible = computed({
  get: () => props.modelValue,
  set(v) {
    emits("update:modelValue", v);
  }
});

const Paths = ref([]);
async function handleConfirm() {
  formRef.value.validate(async callback => {
    if (callback) {
      try {
        loading.value = true;
        console.log("formData", formData);
        if (props.type === "add") {
          await addXunJianApi(formData);
        } else if (props.type === "update") {
          await updateXunJianApi(formData as UpdateXunJianCommand);
        }
        ElMessage.success("提交成功");
        visible.value = false;
        formRef.value?.resetFields();
        emits("success");
      } catch (e) {
        console.error(e);
        ElMessage.error((e as Error)?.message || "提交失败");
      } finally {
        loading.value = false;
      }
    }
  });
}

const areas = ref([]);
function handleOpened() {
  if (props.row) {
    Object.assign(formData, props.row);
    if (Array.isArray(formData.timeRange) && formData.timeRange.length > 0) {
      startTime.value = dayjs()
        .startOf("day")
        .add(formData.timeRange[0], "second")
        .format("HH:mm");
      if (formData.timeRange.length > 1) {
        endTime.value = dayjs()
          .startOf("day")
          .add(formData.timeRange[1], "second")
          .format("HH:mm");
      }
    }
    if (Array.isArray(formData.dayRange) && formData.dayRange.length > 0) {
      endDay.value = JSON.parse(JSON.stringify(formData.dayRange));
    }
    if (
      formData.fanWei != undefined &&
      formData.fanWei != null &&
      formData.fanWei != ""
    ) {
      targetAreas.value = formData.fanWei.split(",");
    }

    Paths.value = [];
  } else {
    targetAreas.value = [];
  }

  getAllAreas().then(res => {
    // console.log("res", res);
    areas.value = res.data;
  });
}

function cancelConfirm() {
  visible.value = false;
}
function handleClosed() {
  formRef.value?.resetFields();
  Paths.value = [];
}

const weekSelect = [
  {
    label: "周一",
    value: 0
  },
  {
    label: "周二",
    value: 1
  },
  {
    label: "周三",
    value: 2
  },
  {
    label: "周四",
    value: 3
  },
  {
    label: "周五",
    value: 4
  },
  {
    label: "周六",
    value: 5
  },
  {
    label: "周日",
    value: 6
  }
];
const daySelect = ref([]);

const startTime = ref("");
const endTime = ref("");
const startDay = ref(0);
const endDay = ref([]);
function changeStartTime(val) {
  if (val != "") {
    const [h, m] = val.split(":").map(Number);
    const seconds = h * 3600 + m * 60;
    formData.timeRange[0] = seconds;
  }
}
function changeEndTime(val) {
  if (val) {
    const [h, m] = val.split(":").map(Number);
    const seconds = h * 3600 + m * 60;
    formData.timeRange[1] = seconds;
  }
}
function changeStartDay(val) {
  if (val) {
    formData.timeRange[0] = val;
  }
}
function changeEndDay(val) {
  if (val) {
    // formData.timeRange[1] = val
    formData.dayRange = val;
  }
}

function changePinLu(val) {
  if (val) {
    formData.timeRange = [0, 0];
  }
}

function changeTargetAreas(val) {
  formData.fanWei = targetAreas.value.join(",");
}

onMounted(() => {
  if (daySelect.value.length == 0) {
    for (let i = 0; i < 31; i++) {
      daySelect.value.push({
        label: String(i + 1),
        value: i
      });
    }
  }
});
</script>

<template>
  <v-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    :title="type === 'add' ? '新增巡检计划' : '更新巡检计划'"
    v-model="visible"
    :loading="loading"
    @confirm="handleConfirm"
    @cancel="cancelConfirm"
    @opened="handleOpened"
    @closed="handleClosed"
  >
    <el-form :model="formData" label-width="100px" :rules="rules" ref="formRef">
      <el-row>
        <el-col :span="12">
          <el-form-item label="覆盖范围：" prop="code">
            <!-- <el-input
              v-model="targetAreas"
              placeholder="请输入覆盖范围"
              style="width: 300px"
              clearable
            /> -->
            <el-select
              v-model="targetAreas"
              multiple
              @change="changeTargetAreas"
            >
              <el-option
                v-for="item in areas"
                :key="item"
                :value="item"
                :label="item"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="巡检频率:" prop="xunJianPinLu">
            <el-select v-model="formData.xunJianPinLu" @change="changePinLu">
              <el-option label="每日" value="每日" />
              <el-option label="每周" value="每周" />
              <el-option label="每月" value="每月" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="巡检类型:" prop="xunJianLeiXing">
            <el-select v-model="formData.xunJianLeiXing">
              <el-option label="定点巡检" value="定点巡检" />
              <el-option label="持续巡检" value="持续巡检" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="开始时间:">
            <el-time-select
              @change="changeStartTime"
              editable
              v-model="startTime"
              start="00:00"
              end="23:45"
              step="00:15"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col v-if="formData.xunJianLeiXing != '定点巡检'" :span="12">
          <el-form-item label="结束时间:">
            <el-time-select
              @change="changeEndTime"
              editable
              v-model="endTime"
              start="00:00"
              end="23:45"
              step="00:15"
            />
          </el-form-item>
        </el-col>
        <el-col v-if="formData.xunJianPinLu != '每日'" :span="12">
          <el-form-item label="选择:">
            <el-select v-model="endDay" multiple @change="changeEndDay">
              <el-option
                v-if="formData.xunJianPinLu == '每周'"
                v-for="(item, index) in weekSelect"
                :key="index"
                :value="item.value"
                :label="item.label"
              />
              <el-option
                v-if="formData.xunJianPinLu == '每月'"
                v-for="(item, index) in daySelect"
                :key="index"
                :value="item.value"
                :label="item.label"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </v-dialog>
</template>

<style lang="scss" scoped></style>
