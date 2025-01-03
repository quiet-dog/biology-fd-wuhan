<script setup lang="ts">
import {
  addemergencyRes,
  addemergency,
  renewemergencyRes,
  renewprocess
} from "@/api/emergencyDispatch/emergencyPlan";
import VDialog from "@/components/VDialog/VDialog.vue";
import { ElMessage, FormInstance, FormRules } from "element-plus";
import { computed, reactive, ref, watch } from "vue";
import CUplopad from "@/components/CUpload/index.vue";

interface Props {
  type: "add" | "update";
  modelValue: boolean;
  row?: renewemergencyRes;
}

const rules: FormRules = {
  title: [
    {
      required: true,
      message: "预案名称不能为空"
    }
  ],
  version: [
    {
      required: true,
      message: "版本号不能为空"
    }
  ],
  scope: [
    {
      required: true,
      message: "适用范围不能为空"
    }
  ],
  riskType: [
    {
      required: true,
      message: "风险类型不能为空"
    }
  ],
  paths: [
    {
      required: true,
      message: "应急预案附件不能为空"
    },
    {
      validator: (rule, value, callback) => {
        if (value.length > 1) {
          callback(new Error("只能上传一个应急预案附件"));
        } else {
          callback();
        }
      },
      trigger: "change"
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

const formData = reactive<addemergencyRes | renewemergencyRes>({
  code: "",
  title: "",
  version: "",
  deptId: 1,
  scope: "",
  riskType: "",
  paths: [],
  keywordIds: [1]
});

const Paths = ref([]);

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
        if (props.type === "add") {
          await addemergency(formData);
        } else if (props.type === "update") {
          await renewprocess(formData as renewemergencyRes);
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

function handleOpened() {
  if (props.row) {
    Object.assign(formData, props.row);

    // 清空
    formData.paths = [];

    Paths.value = [];

    // @ts-ignore
    props.row.paths.forEach((item, index) => {
      // 判断类型
      if (typeof item === "string") {
        const fileName = item.split("/").pop();
        Paths.value.push({
          name: fileName,
          url: "",
          index
        });
        formData.paths.push(fileName);
      } else {
        // @ts-ignore
        if (item["path"]) {
          // @ts-ignore
          const fileName = item["path"].split("/").pop();

          // 如果文件名称包含_
          if (fileName.includes("_")) {
            // @ts-ignore
            // props.row.paths[index] = fileName;
            formData.paths.push(fileName);
            Paths.value.push({
              name: fileName,
              url: "",
              index
            });
          }
        }
      }
    });
  }
}

function cancelConfirm() {
  visible.value = false;
  formRef.value?.resetFields();
}

function handleClosed() {
  formRef.value?.resetFields();
  Paths.value = [];
}
</script>

<template>
  <v-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    :title="type === 'add' ? '新增应急预案' : '编辑应急预案'"
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
          <el-form-item label="预案名称：" prop="title">
            <el-input
              v-model="formData.title"
              autocomplete="off"
              placeholder="请输入预案名称"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="版本号：" prop="version">
            <el-input
              v-model="formData.version"
              autocomplete="off"
              placeholder="请输入版本号"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="风险类型：" prop="riskType">
            <el-input
              v-model="formData.riskType"
              autocomplete="off"
              placeholder="请输入风险类型"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="应急预案附件：" prop="paths">
        <CUplopad
          :type="type"
          ref="CUplopadRef"
          v-model="formData.paths"
          :file-list="Paths"
          :limit="1"
        />
      </el-form-item>
    </el-form>
  </v-dialog>
</template>

<style lang="scss" scoped></style>
