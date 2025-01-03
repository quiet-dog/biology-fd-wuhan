<template>
  <div>
    <el-card>
      <el-form :inline="true" :model="formInline">
        <el-form-item label="名称：">
          <el-input
            v-model="formInline.user"
            placeholder="请输入名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="发布日期：">
          <el-date-picker
            v-model="formInline.date"
            type="date"
            placeholder="请选择发布日期"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="">搜索</el-button>
          <el-button @click="">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card style="margin-top: 16px">
      <el-button type="primary" @click="addFormClick">新增</el-button>
      <el-table :data="tableData" style="width: 100%; margin-top: 10px">
        <el-table-column prop="id" label="政策法规编号" />
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="time" label="发布日期" />
        <el-table-column label="操作">
          <el-button type="primary" link @click="detailsClick">
            查看
          </el-button>
        </el-table-column>
      </el-table>
    </el-card>
    <addForm ref="addFormRef"></addForm>
    <detailsForm ref="detailsFormRef"></detailsForm>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import addForm from "./components/addForm.vue";
import detailsForm from "./components/detailsForm.vue";

const formInline = {
  user: "",
  region: "",
  date: ""
};

const tableData = ref([
  {
    id: "FG001",
    name: "《中华人民共和国药品管理法》",
    time: "2024-09-15"
  },
  {
    id: "FG002",
    name: "《药品生产质量管理规范》",
    time: "2024-09-15"
  }
]);

const addFormRef = ref();
const addFormClick = () => {
  addFormRef.value.openClick();
};

const detailsFormRef = ref();
const detailsClick = () => {
  detailsFormRef.value.openClick();
};

defineOptions({
  name: "policiesAndRegulations"
});
</script>

<style lang="scss" scoped>
.el-form-item {
  margin-bottom: 0;
}
</style>
