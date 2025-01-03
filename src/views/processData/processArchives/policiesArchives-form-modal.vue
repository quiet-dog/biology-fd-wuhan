<script setup lang="ts">
import {
  addArchiveRes,
  addArchive,
  renewArchiveRes,
  renewArchive
} from "@/api/processData/processArchives";
import VDialog from "@/components/VDialog/VDialog.vue";
import { ElMessage, FormInstance, FormRules } from "element-plus";
import { computed, reactive, ref } from "vue";
import dayjs from "dayjs";
import CUplopad from "@/components/CUpload/index.vue";

interface Props {
  type: "add" | "update";
  modelValue: boolean;
  row?: renewArchiveRes;
}

const rules: FormRules = {
  craftArchiveCode: [
    {
      required: true,
      message: "文档编号不能为空"
    }
  ],
  craftArchiveName: [
    {
      required: true,
      message: "工艺名称不能为空"
    }
  ],
  version: [
    {
      required: true,
      message: "版本号不能为空"
    }
  ],
  creator: [
    {
      required: true,
      message: "工艺制定人员不能为空"
    }
  ],
  attachmentPath: [
    {
      required: true,
      message: "文档不能为空"
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

const formData = reactive<addArchiveRes | renewArchiveRes>({
  craftArchiveCode: "",
  craftArchiveName: "",
  creator: "",
  version: "",
  createDate: dayjs().startOf("day").format("YYYY-MM-DD"),
  attachmentPath: [],
  craftArchiveId: 0
});

const attachmentPaths = ref([]);

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
          await addArchive(formData);
        } else if (props.type === "update") {
          await renewArchive(formData as renewArchiveRes);
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
    formData.attachmentPath = [];

    attachmentPaths.value = [];

    // @ts-ignore
    props.row.attachmentPath.forEach((item, index) => {
      // 判断类型
      if (typeof item === "string") {
        const fileName = item.split("/").pop();
        attachmentPaths.value.push({
          name: fileName,
          url: "",
          index
        });
        formData.attachmentPath.push(fileName);
      } else {
        // @ts-ignore
        if (item["path"]) {
          // @ts-ignore
          const fileName = item["path"].split("/").pop();

          // 如果文件名称包含_
          if (fileName.includes("_")) {
            // @ts-ignore
            // props.row.paths[index] = fileName;
            formData.attachmentPath.push(fileName);
            attachmentPaths.value.push({
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
}
function handleClosed() {
  formRef.value?.resetFields();
  attachmentPaths.value = [];
}
</script>

<template>
  <v-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    :title="type === 'add' ? '新增工艺档案' : '编辑工艺档案'"
    v-model="visible"
    :loading="loading"
    @confirm="handleConfirm"
    @cancel="cancelConfirm"
    @opened="handleOpened"
    @closed="handleClosed"
  >
    <el-form :model="formData" label-width="120px" :rules="rules" ref="formRef">
      <el-row>
        <el-col :span="12">
          <el-form-item label="工艺编号：" prop="craftArchiveCode">
            <el-input
              v-model="formData.craftArchiveCode"
              autocomplete="off"
              placeholder="请输入工艺编号"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="工艺名称：" prop="craftArchiveName">
            <el-input
              v-model="formData.craftArchiveName"
              autocomplete="off"
              placeholder="请输入工艺名称"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="版本：" prop="version">
            <el-input
              v-model="formData.version"
              placeholder="请输入版本"
              autocomplete="off"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="工艺制定人员：" prop="creator">
            <el-input
              v-model="formData.creator"
              placeholder="请输入工艺制定人员"
              autocomplete="off"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="创建日期：" prop="createDate">
            <el-date-picker
              v-model="formData.createDate"
              type="date"
              value-format="YYYY-MM-DD hh:mm:ss"
              placeholder="选择日期"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="文档：" label-width="120" prop="attachmentPath">
        <CUplopad
          :type="type"
          ref="CUplopadRef"
          v-model="formData.attachmentPath"
          :file-list="attachmentPaths"
        />
      </el-form-item>
    </el-form>
  </v-dialog>
</template>

<style lang="scss" scoped></style>
