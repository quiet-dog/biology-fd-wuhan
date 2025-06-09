<script setup lang="ts">
import {
  addthresholdRes,
  addthreshold,
  renewthresholdRes,
  renewthreshold
} from "@/api/alarmPlatform/thresholdSetting";
import VDialog from "@/components/VDialog/VDialog.vue";
import { ElMessage, FormInstance, FormRules } from "element-plus";
import { computed, reactive, ref } from "vue";
import {
  equipmentListRes,
  equipmentList
} from "@/api/deviceData/equipmentProfile";
import {
  emergencyListRes,
  emergencyList
} from "@/api/emergencyDispatch/emergencyPlan";
import { sopListRes, sopList } from "@/api/emergencyDispatch/SOPManual";

interface Props {
  type: "add" | "update";
  modelValue: boolean;
  row?: renewthresholdRes;
}

const rules: FormRules = {
  sensorName: [
    {
      required: true,
      message: "传感器名称不能为空"
    }
  ],
  sensorModel: [
    {
      required: true,
      message: "传感器型号不能为空"
    }
  ],
  equipmentIndex: [
    {
      required: true,
      message: "设备指标不能为空"
    }
  ],
  unit: [
    {
      required: true,
      message: "指标单位不能为空"
    }
  ],
  equipmentId: [
    {
      required: true,
      message: "指标单位不能为空"
    }
  ],
  emergencyIds: [
    {
      required: true,
      message: "应急预案不能为空"
    }
  ],
  sopIds: [
    {
      required: true,
      message: "SOP手册不能为空"
    }
  ]
};

const props = defineProps<Props>();

const emits = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (e: "success"): void;
}>();

const loading = ref(false);

const num = ref(1);
const formRef = ref<FormInstance>();
const formData = reactive<addthresholdRes | renewthresholdRes>({
  equipmentId: null,
  thresholdId: null,
  sensorName: "",
  sensorModel: "",
  equipmentIndex: "",
  unit: "",
  outId: null,
  emergencyIds: [],
  sopIds: [],
  values: [
    {
      level: "",
      min: null,
      max: null
    }
  ]
});

const visible = computed({
  get: () => props.modelValue,
  set(v) {
    emits("update:modelValue", v);
  }
});

//设备列表
const dataList = ref([]);
const form = ref<equipmentListRes>({
  equipmentName: "",
  manufacturer: "",
  startPurchaseDate: undefined,
  endPurchaseDate: undefined,
  usageStatus: "",
  equipmentType: "",
  pageSize: 10,
  pageNum: 1
});
const loadArchiveListFun = () => {
  form.value.pageNum +=1;
  archiveListFun();
}
const archiveListFun = async () => {
  const { data } = await equipmentList(form.value);
  if (data.rows.length > 0) {
    dataList.value = [...dataList.value, ...data.rows];
  }
};

//应急预案列表
const emergencylist = ref([]);
const emergencyinfo = ref<emergencyListRes>({
  riskType: "",
  title: "",
  pageSize: 10000,
  pageNum: 1
});
const emergencyListFun = async () => {
  const { data } = await emergencyList(emergencyinfo.value);
  emergencylist.value = data.rows;
};

//SOP列表
const soplist = ref([]);
const sopinfo = ref<sopListRes>({
  name: "",
  scope: "",
  pageSize: 10000,
  pageNum: 1
});
const sopListFun = async () => {
  const { data } = await sopList(sopinfo.value);
  soplist.value = data.rows;
};

function handleOpened() {
  if (props.row) {
    console.log(props.row);
    Object.assign(formData, props.row);
    if (props.row.values != null && props.row.values.length > 0) {
      formData.values = props.row.values.map(item => {
      return {
        ...item,
      };
    });
    } else {
      formData.values = [];
    }
    
    console.log("formData",formData)
    num.value = formData.values.length;
  }
  archiveListFun();
  // emergencyListFun();
  // sopListFun();
}

function handleConfirm() {
  formRef.value.validate(async callback => {
    if (callback) {
      try {
        loading.value = true;
        if (props.type === "add") {
          await addthreshold({
            ...formData,
            values: formData.values.map(item => {
              return {
                ...item,
                min: Number(item.min),
                max: Number(item.max)
              };
            })
          });
        } else if (props.type === "update") {
          await renewthreshold({
            ...(formData as renewthresholdRes),
            values: formData.values.map(item => {
              return {
                ...item,
                min: Number(item.min),
                max: Number(item.max)
              };
            })
          });
        }
        // 提交成功
        ElMessage.success("提交成功");

        visible.value = false;
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

function cancelConfirm() {
  visible.value = false;
  // handleClosed();
}

const handleChange = (value: number) => {
  const currentLength = formData.values.length;
  if (value > currentLength) {
    // 如果输入值大于当前 list 长度，则增加新条目
    for (let i = currentLength; i < value; i++) {
      formData.values.push({
        level: "", // 默认报警级别
        min: null, // 默认开始区间
        max: null // 默认结束区间
      });
    }
  } else if (value < currentLength) {
    // 如果输入值小于当前 list 长度，则减少条目
    formData.values.splice(value, currentLength - value);
  }
};

function handleClosed() {
  formRef.value?.resetFields();
  formData.values = [
    {
      level: "",
      min: null,
      max: null
    }
  ];
  num.value = 1;
}
</script>

<template>
  <v-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    :title="type === 'add' ? '新增阈值设置' : '编辑阈值设置'"
    v-model="visible"
    :loading="loading"
    @confirm="handleConfirm"
    @cancel="cancelConfirm"
    @closed="handleClosed"
    @opened="handleOpened"
  >
    <el-form :model="formData" label-width="120px" :rules="rules" ref="formRef">
      <el-row>
        <el-col :span="12">
          <el-form-item label="传感器名称：" prop="sensorName">
            <el-input
              v-model="formData.sensorName"
              autocomplete="off"
              placeholder="请输入传感器名称"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="传感器型号：" prop="sensorModel">
            <el-input
              v-model="formData.sensorModel"
              autocomplete="off"
              placeholder="请输入传感器型号"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="设备指标：" prop="equipmentIndex">
            <el-input
              v-model="formData.equipmentIndex"
              placeholder="请输入设备指标"
              autocomplete="off"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="指标单位：" prop="unit">
            <el-input
              v-model="formData.unit"
              placeholder="请输入指标单位"
              autocomplete="off"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="所属设备：" prop="equipmentId">
        <el-select
          v-model="formData.equipmentId"
          filterable
          placeholder="请选择所属设备"
          style="width: 300px"
        >
        <div v-infinite-scroll="loadArchiveListFun">
          <el-option
            v-for="item in dataList"
            :key="item.equipmentId"
            :label="`${item.equipmentName}-${item.installationLocation}-${item.equipmentCode}`"
            :value="item.equipmentId"
          />
        </div>
        
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="应急预案：" prop="emergencyIds">
        <el-select
          v-model="formData.emergencyIds"
          filterable
          multiple
          placeholder="请选择应急预案"
          style="width: 300px"
        >
          <el-option
            v-for="item in emergencylist"
            :key="item.emergencyId"
            :label="item.title"
            :value="item.emergencyId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="SOP手册：" prop="sopIds">
        <el-select
          v-model="formData.sopIds"
          multiple
          filterable
          placeholder="请选择SOP手册"
          style="width: 300px"
        >
          <el-option
            v-for="item in soplist"
            :key="item.sopId"
            :label="item.name"
            :value="item.sopId"
          />
        </el-select>
      </el-form-item> -->
      <el-form-item label="级别层级：">
        <el-input-number
          v-model="num"
          :min="1"
          :max="5"
          @change="handleChange"
        />
      </el-form-item>
      <el-row v-for="(item, index) in formData.values" :key="index">
        <el-col :span="12">
          <el-form-item
            label="报警级别："
            :prop="'values.' + index + '.level'"
            :rules="[
              { required: true, message: '报警级别不能为空', trigger: 'blur' }
            ]"
          >
            <el-select
              v-model="item.level"
              placeholder="请选择报警级别"
              style="width: 300px"
            >
              <el-option label="轻微" value="轻微" />
              <el-option label="一般" value="一般" />
              <el-option label="中度" value="中度" />
              <el-option label="重要" value="重要" />
              <el-option label="紧急" value="紧急" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="指标区间：">
            <div
              style="
                width: 300px;
                display: flex;
                justify-content: space-between;
                align-items: center;
              "
            >
              <el-input
                v-model="item.min"
                placeholder="开始区间"
                autocomplete="off"
                style="width: 130px"
              />
              <span>至</span>
              <el-input
                v-model="item.max"
                placeholder="结束区间"
                autocomplete="off"
                style="width: 130px"
              />
            </div>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </v-dialog>
</template>

<style lang="scss" scoped></style>
