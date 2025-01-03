<template>
  <v-detail-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    title="查看工艺流程图"
    v-model="visible"
    :loading="loading"
    :disableFooter="true"
    @cancel="cancelConfirm"
    @opened="handleOpened"
  >
    <el-form :model="formData" label-width="120px" ref="formRef">
      <el-row>
        <el-col :span="12">
          <el-form-item label="所属工艺：">
            <el-input
              v-model="formData.craftArchive.craftArchiveName"
              placeholder="请输入所属工艺"
              readonly
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="工艺节点：">
            <el-input
              v-model="formData.craftNode.nodeName"
              autocomplete="off"
              placeholder="请输入工艺节点"
              readonly
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="节点顺序：">
            <el-input-number
              v-model="formData.nodeOrder"
              readonly
              :min="1"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="人员要素：">
        <el-input
          v-model="formData.personnelFactors"
          placeholder="请输入人员要素"
          autocomplete="off"
          readonly
          style="width: 750px"
        />
      </el-form-item>
      <el-form-item label="设备要素：">
        <el-input
          v-model="formData.equipmentFactors"
          placeholder="请输入设备要素"
          autocomplete="off"
          readonly
          style="width: 750px"
        />
      </el-form-item>

      <el-form-item label="原料要素：">
        <el-input
          v-model="formData.materialFactors"
          placeholder="请输入原料要素"
          autocomplete="off"
          readonly
          style="width: 750px"
        />
      </el-form-item>
      <el-form-item label="环境要素：" prop="environmentFactors">
        <el-input
          v-model="formData.environmentFactors"
          placeholder="请输入环境要素"
          autocomplete="off"
          style="width: 760px"
        />
      </el-form-item>
    </el-form>
  </v-detail-dialog>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { processInfo } from "@/api/processData/processFlowChart";
import { archiveListRes, archiveList } from "@/api/processData/processArchives";
import { FormInstance } from "element-plus";

import VDetailDialog from "@/components/VDetailDialog/VDetailDialog.vue";

const visible = ref(false);
const loading = ref(false);
const formRef = ref<FormInstance>();

const formData = ref({
  craftNode: {
    nodeName: ""
  },
  craftArchive: {
    craftArchiveName: ""
  },
  equipmentFactors: "",
  personnelFactors: "",
  materialFactors: "",
  nodeOrder: 1,
  environmentFactors: "",
  craftArchiveId: null,
  craftProcessId: 0
});

const form = ref<archiveListRes>({
  craftArchiveCode: "",
  craftArchiveName: "",
  version: "",
  ids: [],
  pageNum: 1,
  pageSize: 10000
});
const dataList = ref([]);
const archiveListFun = async () => {
  // @ts-ignore
  const { data } = await archiveList(form.value);
  dataList.value = data.rows;
};

const handleOpened = (id: number) => {
  if (!id) {
    return;
  }
  archiveListFun();
  visible.value = true;
  // @ts-ignore
  processInfo(id).then(res => {
    // @ts-ignore
    formData.value = res.data;
  });
};

function cancelConfirm() {
  visible.value = false;
  formRef.value?.resetFields();
}

defineExpose({
  handleOpened
});
</script>

<style lang="scss" scoped></style>
