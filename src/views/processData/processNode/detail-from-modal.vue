<template>
  <v-detail-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    title="查看工艺节点"
    v-model="visible"
    :loading="loading"
    :disableFooter="true"
    @cancel="cancelConfirm"
    @opened="handleOpened"
  >
    <el-tabs v-model="activeName" class="demo-tabs">
      <el-tab-pane label="基础信息" name="first">
        <el-form :model="formData" label-width="120px" ref="formRef">
          <el-row>
            <el-col :span="12">
              <el-form-item label="工艺节点：" label-width="120">
                <el-input
                  v-model="formData.nodeName"
                  autocomplete="off"
                  placeholder="请输入工艺节点"
                  readonly
                  style="width: 300px"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="设备名称：" prop="equipmentIds">
                <el-select
                  v-model="formData.equipmentIds"
                  :multiple="true"
                  placeholder="请选择设备名称"
                  style="width: 300px"
                  clearable
                  disabled
                  collapse-tags
                  collapse-tags-tooltip
                >
                  <el-option
                    v-for="item in dataList2"
                    :label="item.equipmentName"
                    :value="item.equipmentId"
                    :key="item.equipmentId"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="标签名称：">
                <el-input
                  v-model="formData.labelName"
                  placeholder="请输入标签名称"
                  style="width: 300px"
                  readonly
                >
                  <template #append>
                    <el-color-picker
                      v-model="formData.color"
                    />
                  </template>
              </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="标签描述：">
                <el-input
                  v-model="formData.colorDescription"
                  placeholder="请输入标签描述"
                  style="width: 300px"
                  readonly
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="所属工艺：" label-width="120">
                <el-select
                  v-model="formData.craftArchiveId"
                  placeholder="请选择所属工艺"
                  style="width: 300px"
                  disabled
                  clearable
                >
                  <el-option
                    v-for="item in dataList"
                    :label="item.craftArchiveName"
                    :value="item.craftArchiveId"
                    :key="item.craftArchiveId"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="节点顺序：" label-width="120">
                <el-input-number
                  v-model="formData.nodeOrder"
                  :min="1"
                  readonly
                  style="width: 300px"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12" />
          </el-row>
          <el-form-item label="操作工序：">
            <el-input
              v-model="formData.operationDescription"
              placeholder="请输入操作工序"
              autocomplete="off"
              :rows="2"
              readonly
              type="textarea"
              style="width: 760px"
            />
          </el-form-item>
          <el-form-item label="操作要求：">
            <el-input
              v-model="formData.operationMethod"
              placeholder="请输入操作要求"
              autocomplete="off"
              :rows="2"
              readonly
              type="textarea"
              style="width: 760px"
            />
          </el-form-item>
          <el-row>
            <el-col :span="12">
              <el-form-item label="所需时间：">
                <el-input
                  v-model="formData.requiredTime"
                  placeholder="请输入所需时间"
                  readonly
                  style="width: 300px"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="是否为高风险：">
                <el-select
                  v-model="formData.isHighRisk"
                  placeholder="请选择节点状态"
                  style="width: 300px"
                  disabled
                  clearable
                >
                  <el-option label="是" :value="true" />
                  <el-option label="否" :value="false" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="标签定义：" label-width="120">
            <el-input
              v-model="formData.nodeTags"
              placeholder="请输入标签定义"
              style="width: 300px"
            />
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="工艺档案" name="second">
        <el-form :model="formData" label-width="120px" ref="formRef">
          <el-row>
            <el-col :span="12">
              <el-form-item label="文档编号：">
                <el-input
                  v-model="formData2.craftArchiveCode"
                  autocomplete="off"
                  placeholder="请输入文档编号"
                  readonly
                  style="width: 300px"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="工艺名称：">
                <el-input
                  v-model="formData2.craftArchiveName"
                  autocomplete="off"
                  placeholder="请输入工艺名称"
                  readonly
                  style="width: 300px"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="版本：">
                <el-input
                  v-model="formData2.version"
                  placeholder="请输入版本"
                  autocomplete="off"
                  readonly
                  style="width: 300px"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="工艺制定人员：">
                <el-input
                  v-model="formData2.creator"
                  placeholder="请输入工艺制定人员"
                  autocomplete="off"
                  readonly
                  style="width: 300px"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </v-detail-dialog>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { FormInstance } from "element-plus";
import {
  addnodeRes,
  renewnodeRes,
  nodeInfo
} from "@/api/processData/processNode";
import {
  archiveListRes,
  archiveList,
  archiveInfo
} from "@/api/processData/processArchives";
import VDetailDialog from "@/components/VDetailDialog/VDetailDialog.vue";

import { equipmentList } from "@/api/deviceData/equipmentProfile";

const visible = ref(false);
const loading = ref(false);
const formRef = ref<FormInstance>();

const activeName = ref("first");

const formData = ref<addnodeRes | renewnodeRes>({
  isHighRisk: false,
  operationMethod: "",
  operationDescription: "",
  nodeName: "",
  requiredTime: "",
  craftArchiveId: null,
  nodeCode: "",
  nodeOrder: 1,
  nodeTags: "",
  craftNodeId: 0,
  equipmentIds: [],
  craftArchive: {
    craftArchiveId: null,
    craftArchiveName: ""
  },
  labelName: "",
  color: "#FFFFFF",
  colorDescription: ""
});

const ap = ref({
  equipmentName: "",
  manufacturer: "",
  startPurchaseDate: undefined,
  endPurchaseDate: undefined,
  usageStatus: "",
  equipmentType: "",
  pageSize: 10000,
  pageNum: 1
});

const dataList2 = ref([]);

const equipmentListFun2 = async () => {
  // @ts-ignore
  const { data } = await equipmentList(ap.value);
  dataList2.value = data.rows;
};

const formData2 = ref({
  craftArchiveCode: "",
  craftArchiveName: "",
  creator: "",
  version: "",
  createDate: "",
  attachmentPath: []
});

const handleOpened = (id: number) => {
  if (!id) {
    return;
  }

  archiveListFun();
  equipmentListFun2();

  visible.value = true;
  nodeInfo(id).then(res => {
    // @ts-ignore
    formData.value = res.data;

    if (formData.value.equipmentIds) {
      Object.assign(formData, {
        equipmentIds: Array.isArray(formData.value.equipmentIds)
          ? formData.value.equipmentIds
          : []
      });
    }

    console.log(formData.value);

    // @ts-ignore
    archiveInfo(res.data.craftArchiveId).then(res => {
      // @ts-ignore
      formData2.value = res.data;
    });
  });
};

function cancelConfirm() {
  visible.value = false;
  formRef.value?.resetFields();
}

const form = ref<archiveListRes>({
  craftArchiveCode: "",
  craftArchiveName: "",
  version: "",
  pageSize: 10000,
  ids: []
});
const dataList = ref([]);
const archiveListFun = async () => {
  const { data } = await archiveList(form.value);
  dataList.value = data.rows;
};

defineExpose({
  handleOpened
});
</script>

<style lang="scss" scoped></style>
