<template>
  <el-dialog v-model="dialogFormVisible" title="查看政策法规" width="900">
    <el-form :model="form">
      <el-row>
        <el-col :span="12">
          <el-form-item label="政策法规编号：" label-width="120">
            <el-input v-model="form.name" style="width: 300px" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="名称：" label-width="120">
            <el-input v-model="form.name" style="width: 300px" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="发布时间：" label-width="120">
            <el-input v-model="form.name" style="width: 300px" />
          </el-form-item>
        </el-col>
        <el-col :span="12"></el-col>
      </el-row>
      <el-form-item label="附件：" label-width="120">
        <el-input v-model="form.name" style="width: 300px" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref } from "vue";
const dialogFormVisible = ref<boolean>(false);

const form = {
  name: "",
  region: ""
};

const fileList = ref([]);

const openClick = () => {
  dialogFormVisible.value = true;
};

defineExpose({
  openClick
});
</script>

<style lang="scss" scoped></style>
