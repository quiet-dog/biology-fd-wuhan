<template>
  <el-dialog v-model="dialogFormVisible" title="查看报警信息" width="900">
    <el-form :model="form">
      <el-row>
        <el-col :span="12">
          <el-form-item label="报警编号：" label-width="120">
            <el-input
              v-model="form.name"
              autocomplete="off"
              placeholder="请输入报警编号"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="报警类型：" label-width="120">
            <el-input
              v-model="form.name"
              autocomplete="off"
              placeholder="请输入报警类型"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="报警时间：" label-width="120">
            <el-input
              v-model="form.name"
              autocomplete="off"
              placeholder="请输入报警时间"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="报警级别：" label-width="120">
            <el-input
              v-model="form.name"
              autocomplete="off"
              placeholder="请输入报警级别"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="报警描述：" label-width="120">
        <el-input
          v-model="form.name"
          autocomplete="off"
          placeholder="请输入报警描述"
          style="width: 730px"
        />
      </el-form-item>
      <el-form-item label="参考文件：" label-width="120"> </el-form-item>
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
import { Plus } from "@element-plus/icons-vue";

const form = {
  name: "",
  region: ""
};

const openClick = () => {
  dialogFormVisible.value = true;
};

defineExpose({
  openClick
});
</script>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>
