<script setup lang="ts">
import {
  addDailyInspectionRes,
  addDailyInspection
} from "@/api/deviceData/dailyInspectionRecords";
import VDialog from "@/components/VDialog/VDialog.vue";
import { ElMessage, FormInstance, FormRules } from "element-plus";
import { computed, onMounted, reactive, ref } from "vue";
import ImgUpload from "@/components/ImgUpload/index.vue";
import {personnelList}  from "@/api/personnelData/personnelProfile";
import { getUserListApi } from "@/api/system/user";

interface Props {
  type: "add" | "update";
  modelValue: boolean;
}

const rules: FormRules = {
  inspectionDate: [
    {
      required: true,
      message: "巡检日期不能为空"
    }
  ],
  taskDescription: [
    {
      required: true,
      message: "任务描述不能为空"
    }
  ],
  inspector: [
    {
      required: true,
      message: "巡检人员不能为空"
    }
  ],
  anomalyCount: [
    {
      required: true,
      message: "异常数不能为空"
    }
  ],
  anomalyDescription: [
    {
      required: true,
      message: "异常说明不能为空"
    }
  ],
  inspectionImagePath: [
    {
      required: true,
      message: "巡检图片不能为空"
    }
  ]
};

const props = defineProps<Props>();

const emits = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (e: "success"): void;
}>();

const loading = ref(false);

const inspectionImagePaths = ref([]);
const formRef = ref<FormInstance>();
const formData = reactive<addDailyInspectionRes>({
  inspectionDate: "",
  inspectionCode: "",
  taskDescription: "",
  inspector: "",
  anomalyCount: 1,
  anomalyDescription: "",
  inspectionImagePath: [],
  inspectorIds: []
});

const visible = computed({
  get: () => props.modelValue,
  set(v) {
    emits("update:modelValue", v);
  }
});


function handleConfirm() {
  formRef.value.validate(async callback => {
    if (callback) {
      try {
        loading.value = true;
        await addDailyInspection(formData);
        ElMessage.success("提交成功");
        visible.value = false;
        formRef.value?.resetFields();
        emits("success");
      } catch (e) {
        ElMessage.error((e as Error)?.message || "提交失败");
      } finally {
        loading.value = false;
      }
    }
  });
}

function handleOpened() {}

function cancelConfirm() {
  visible.value = false;
}

function handleClosed() {
  formRef.value?.resetFields();
  inspectionImagePaths.value = [];
  formData.inspectorIds = [];
}

const personnelListData = ref([])
function changePoersonnel(value) {
  formData.inspector = formData.inspectorIds.map(item => {
    return personnelListData.value.find(person => person.userId === item).nickname
  }).join(',')
}
onMounted(() => {
  getUserListApi({
    pageNum: 1,
    pageSize:1000
  }).then(res => {
    console.log("res.data.rows",res.data.rows)
    personnelListData.value = res.data.rows
  })
})
</script>

<template>
  <v-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    title="新增日常巡检记录"
    v-model="visible"
    :loading="loading"
    @confirm="handleConfirm"
    @cancel="cancelConfirm"
    @opened="handleOpened"
    @closed="handleClosed"
  >
    <el-form :model="formData" label-width="100px" :rules="rules" ref="formRef">
      <el-form-item label="巡检日期：" prop="inspectionDate">
        <el-date-picker
          v-model="formData.inspectionDate"
          value-format="YYYY-MM-DD hh:mm:ss"
          type="date"
          style="width: 300px"
          placeholder="请选择巡检日期"
        />
      </el-form-item>
      <el-form-item label="任务描述：" prop="taskDescription">
        <el-input
          v-model="formData.taskDescription"
          placeholder="请输入任务描述"
          autocomplete="off"
          style="width: 760px"
        />
      </el-form-item>
      <el-row>
        <el-col :span="12">
          <el-form-item label="巡检人员：" prop="inspectorId">
            <!-- <el-input
              v-model="formData.inspector"
              placeholder="请输入巡检人员"
              autocomplete="off"
              style="width: 300px"
            /> -->
            <el-select multiple v-model="formData.inspectorIds" @change="changePoersonnel">
              <el-option v-for="item in personnelListData" :key="item.userId" :label="item.nickname" :value="item.userId" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="异常数：" prop="anomalyCount">
            <el-input-number
              v-model="formData.anomalyCount"
              placeholder="请输入异常数"
              :min="1"
              autocomplete="off"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="异常说明：" prop="anomalyDescription">
        <el-input
          v-model="formData.anomalyDescription"
          placeholder="请输入异常说明"
          autocomplete="off"
          style="width: 760px"
        />
      </el-form-item>
      <el-form-item label="巡检图片：" prop="inspectionImagePath">
        <ImgUpload
          :type="type"
          ref="CUplopadRef"
          v-model="formData.inspectionImagePath"
          :file-list="inspectionImagePaths"
        />
      </el-form-item>
    </el-form>
  </v-dialog>
</template>

<style lang="scss" scoped></style>
