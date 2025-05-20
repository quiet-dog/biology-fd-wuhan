<template>
  <v-detail-dialog show-full-screen :fixed-body-height="false" use-body-scrolling title="查看物料档案" v-model="visible"
    :loading="loading" :disableFooter="true" @cancel="cancelConfirm" @opened="handleOpened" @closed="handleClosed">
    <ElTabs v-model="activeName" @tab-change="handleTabChange">

      <el-tab-pane label="物料信息" name="物料信息">
        <el-form :model="formData" label-width="100px" ref="formRef">
          <el-row>
            <el-col :span="12">
              <el-form-item label="领用编号：">
                <el-input v-model="formData.code" autocomplete="off" readonly style="width: 300px" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="物料名称：">
                <el-input v-model="formData.name" autocomplete="off" readonly style="width: 300px" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="物料规格：">
            <el-input v-model="formData.specification" autocomplete="off" :rows="2" type="textarea" style="width: 760px"
              readonly />
          </el-form-item>
          <el-row>
            <el-col :span="12">
              <el-form-item label="物料类型：">
                <el-input v-model="formData.type" autocomplete="off" readonly style="width: 300px" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="库存量：">
                <el-input v-model="formData.stock" autocomplete="off" readonly style="width: 300px" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="物料型号：">
                <el-input v-model="formData.model" autocomplete="off" readonly style="width: 300px" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="供应商：">
                <el-input v-model="formData.supplier" autocomplete="off" readonly style="width: 300px" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="物料单位：">
                <el-input v-model="formData.unit" autocomplete="off" readonly style="width: 300px" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="物料标签：">
                <el-input v-model="formData.tag" autocomplete="off" readonly style="width: 300px" >
                  <template #append>
                    <el-color-picker v-model="formData.color" disabled />
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="标签名称：">
                <el-input v-model="formData.colorDescription" autocomplete="off" readonly style="width: 300px" />
              </el-form-item>
            </el-col>
            </el-row>

          <!-- <el-row>
        <el-col :span="12">
          <el-form-item label="当前入库量：">
            <el-input v-model="formData.lastStock" autocomplete="off" readonly style="width: 300px" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="批次：">
            <el-input v-model="formData.batch" autocomplete="off" readonly style="width: 300px" />
          </el-form-item>
        </el-col>
      </el-row> -->
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="库存信息" name="库存信息">
        <el-table :data="tableList" style="width: 100%">
          <el-table-column prop="type" label="操作类型"></el-table-column>
          <el-table-column prop="num" label="数量"></el-table-column>
          <el-table-column prop="stock" label="当时剩余库存量"></el-table-column>
          <el-table-column prop="batch" label="批次"></el-table-column>
          <el-table-column prop="createTime" label="时间"></el-table-column>
        </el-table>
      </el-tab-pane>

    </ElTabs>

  </v-detail-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue";
import { ElTabs, FormInstance } from "element-plus";
import { getHistoryMaterials, getStock, materialFilesInfo } from "@/api/materialData/materialFiles";
import VDetailDialog from "@/components/VDetailDialog/VDetailDialog.vue";

const activeName = ref("物料信息");
const visible = ref(false);
const loading = ref(false);
const formRef = ref<FormInstance>();

const formData = ref({
  code: "",
  name: "",
  scope: "",
  stock: "",
  unit: "",
  type: "",
  specification: "",
  tag: "",
  lastStock: 0,
  batch: "",
  materialsId: 0,
  model: "",
  supplier: "",
  color: "",
  colorDescription:"",
});

const handleOpened = (id: number) => {
  if (!id) {
    return;
  }
  visible.value = true;
  materialFilesInfo(id).then(res => {
    formData.value = res.data;
  });
};

function cancelConfirm() {
  visible.value = false;
  formRef.value?.resetFields();
}

function handleClosed() {
  visible.value = false;
  formRef.value?.resetFields();
  tableList.value = [];
}

const tableList = ref([]);

function handleTabChange(ac: string) {
  if (ac === '库存信息') {
    // getStock({
    //   materialsId: formData.value.materialsId,
    //   pageSizee: 1000,
    //   pageNum: 1,
    // }).then(res => {
    //   tableList.value = res.data.rows;
    // })
    getHistoryMaterials(formData.value.materialsId).then(res => {
      tableList.value = res.data;
    })
  }
}

defineExpose({
  handleOpened
});
</script>

<style lang="scss" scoped></style>
