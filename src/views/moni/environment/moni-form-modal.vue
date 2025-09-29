<script lang="ts" setup>
import { thresholdList } from "@/api/alarmPlatform/thresholdSetting";
import { equipmentList } from "@/api/deviceData/equipmentProfile";
import {
  AddMoniCommand,
  createMoniApi,
  updateMoniApi,
  UpdateMoniCommand
} from "@/api/moni";
import VDialog from "@/components/VDialog/VDialog.vue";
import { CascaderProps, ElMessage, FormRules } from "element-plus";
import { computed, onMounted, reactive, ref } from "vue";
import { environmentalFilesList } from "@/api/environmentalData/environmentalArchives";

interface Props {
  type: "add" | "update";
  modelValue: boolean;
  row?: UpdateMoniCommand;
  // typeOptions: Array<KnowledgeTypeEntity>;
}

const emits = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (e: "success"): void;
}>();

const props = defineProps<Props>();
const loading = ref(false);
const selectValue = ref([]);
const selectOption = ref([]);
const selectPinValue = ref("3");
const pinInput = ref(0);

const visible = computed({
  get: () => props.modelValue,
  set(v) {
    emits("update:modelValue", v);
  }
});
const formRef = ref();

const id = 0;
const selcteProps: CascaderProps = {
  lazy: true,
  lazyLoad(node, resolve) {
    const { level } = node;
    if (level == 0) {
      // equipmentList({
      //   pageNum: 1,
      //   pageSize: 999,
      //   orderColumn: "purchaseDate",
      //   orderDirection: "descending",
      // }).then(res => {
      //   resolve(res.data.rows.map(item => ({
      //     value: item.equipmentId,
      //     label: item.equipmentName,
      //     leaf: false,
      //   })))
      // })
      environmentalFilesList({
        pageNum: 1,
        pageSize: 999
        // orderColumn: "purchaseDate",
        // orderDirection: "descending",
      }).then(res => {
        resolve(
          res.data.rows.map(item => ({
            value: item.environmentId,
            label: item.description,
            leaf: true
          }))
        );
      });
    } else {
      thresholdList({
        pageNum: 1,
        pageSize: 999,
        equipmentId: node.value
      }).then(res => {
        resolve(
          res.data.rows.map(item => ({
            value: item.thresholdId,
            label: item.sensorName,
            leaf: true
          }))
        );
      });
    }
  },
  multiple: true
};

const formData = reactive<AddMoniCommand | UpdateMoniCommand>({
  description: "",
  environmentIds: [],
  min: 0,
  max: 0,
  pushType: "",
  pushFrequency: 0
});

const rules: FormRules = {
  description: [
    {
      required: true,
      message: "描述不能为空"
    }
  ],
  // 自定义验证
  environmentIds: [
    {
      required: true,
      message: "传感器不能为空"
    }
  ],
  min: [
    {
      validator: (rule, value, callback) => {
        if (value == 0) {
          callback(new Error("最小值不能为空"));
        } else if (value >= formData.max) {
          callback(new Error("最小值不能大于最大值"));
        } else {
          callback();
        }
      }
    }
  ],
  max: [
    {
      validator: (rule, value, callback) => {
        // if (formData.pushType == "2") {
        if (value == 0) {
          callback(new Error("最大值不能为空"));
        } else if (value <= formData.min) {
          callback(new Error("最大值不能小于最小值"));
        } else {
          callback();
        }
      }
    }
  ]
};

async function handleConfirm() {
  formRef.value.validate(async callback => {
    if (callback) {
      try {
        loading.value = true;

        if (selectPinValue.value === "1") {
          formData.pushFrequency = Number(pinInput.value) * 3600;
        } else if (selectPinValue.value === "2") {
          formData.pushFrequency = Number(pinInput.value) * 60;
        } else {
          formData.pushFrequency = Number(pinInput.value);
        }
        if (props.type === "add") {
          formData.pushType = "2";
          await createMoniApi(formData);
        } else if (props.type === "update") {
          formData.pushType = "2";
          console.log("formData", formData);
          await updateMoniApi(formData as UpdateMoniCommand);
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

function cancelConfirm() {
  visible.value = false;
}

function handleOpened() {
  if (props.row) {
    Object.assign(formData, props.row);
    selectValue.value = formData.environmentIds;
    console.log("formData", formData);
    if (Number(formData.pushFrequency) > 3600) {
      selectPinValue.value = "1";
      pinInput.value = Number(formData.pushFrequency) / 3600;
      return;
    } else if (Number(formData.pushFrequency) > 60) {
      selectPinValue.value = "2";
      pinInput.value = Number(formData.pushFrequency) / 60;
      return;
    } else {
      selectPinValue.value = "3";
      pinInput.value = Number(formData.pushFrequency);
      return;
    }
  }
}

function handleClosed() {
  formRef.value?.resetFields();
  selectPinValue.value = "3";
  pinInput.value = 0;
  selectValue.value = [];
  // Paths.value = [];
}

function handleSelectChange(value, selectedData) {
  if (value) {
    formData.environmentIds = value;
  }
}

function handleInputPin(val) {
  // if (val) {
  //   if (selectPinValue.value == "2") {
  //     formData.pushFrequency = val * 60;
  //   } else if (selectPinValue.value == "3") {
  //     formData.pushFrequency = val * 60 * 60;
  //   } else {
  //     formData.pushFrequency = val;
  //   }
  // } else {
  //   formData.pushFrequency = 0;
  // }
}

function changePinValue(val) {
  // if (val) {
  //   if (Number(val) == 2) {
  //     formData.pushFrequency = Number(pinInput.value) * 60;
  //   } else if (Number(val) == 3) {
  //     formData.pushFrequency = Number(pinInput.value);
  //   } else {
  //     formData.pushFrequency = Number(pinInput.value) * 60 * 60;
  //   }
  // } else {
  //   formData.pushFrequency = 0;
  // }
}

onMounted(() => {
  environmentalFilesList({
    pageNum: 1,
    pageSize: 999
    // orderColumn: "purchaseDate",
    // orderDirection: "descending",
  }).then(res => {
    selectOption.value = res.data.rows.map(item => ({
      value: item.environmentId,
      label: item.description,
      leaf: true
    }));
  });
});
</script>

<template>
  <v-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    :title="type === 'add' ? '新增环境填报规则' : '更新环境填报规则'"
    v-model="visible"
    :loading="loading"
    @confirm="handleConfirm"
    @cancel="cancelConfirm"
    @opened="handleOpened"
    @closed="handleClosed"
  >
    <el-form :model="formData" label-width="100px" :rules="rules" ref="formRef">
      <el-form-item label="填报描述">
        <el-input
          v-model="formData.description"
          autocomplete="off"
          placeholder="请输入填报描述"
        />
      </el-form-item>
      <el-form-item label="传感器">
        <!-- :options="selectOption"  -->
        <!-- <el-cascader :multiple="true" v-model="selectValue" @change="handleSelectChange" :props="selcteProps"
          collapse-tags collapse-tags-tooltip clearable>
        </el-cascader> -->
        <el-select
          v-model="selectValue"
          multiple
          collapse-tags
          collapse-tags-tooltip
          clearable
          @change="handleSelectChange"
        >
          <el-option
            v-for="item in selectOption"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="最小">
        <el-input-number v-model="formData.min" placeholder="请输入最小值" />
      </el-form-item>
      <el-form-item label="最大">
        <el-input-number v-model="formData.max" placeholder="请输入最大值" />
      </el-form-item>
      <!-- <el-form-item label="填报类型">
        <el-radio-group v-model="formData.pushType" size="large">
          <el-radio value="1" size="large">实时填报</el-radio>
          <el-radio value="2" size="large">定时填报</el-radio>
        </el-radio-group>
      </el-form-item> -->
      <el-form-item label="填报频率">
        <el-input v-model="pinInput" type="number">
          <template #append>
            <el-select
              v-model="selectPinValue"
              @change="changePinValue"
              style="width: 115px"
            >
              <el-option label="时" value="1" />
              <el-option label="分" value="2" />
              <el-option label="秒" value="3" />
            </el-select>
          </template>
        </el-input>
      </el-form-item>
    </el-form>
  </v-dialog>
</template>

<style scoped></style>
