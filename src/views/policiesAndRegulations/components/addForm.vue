<template>
  <el-dialog v-model="dialogFormVisible" title="新增政策法规" width="700">
    <el-form :model="form">
      <el-form-item label="名称：">
        <el-input
          v-model="form.name"
          placeholder="请输入名称"
          style="width: 300px"
        />
      </el-form-item>
      <el-form-item label="附件：">
        <el-upload
          v-model:file-list="fileList"
          class="upload-demo"
          action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
          multiple
          :limit="3"
        >
          <el-button type="primary">上传附件</el-button>
          <template #tip>
            <div class="el-upload__tip">
              每个附件大小不得超过8M。附件支持的格式有:'jpg', 'bmp',
              'png','gif','txt','rar','zip','doc','docx','ini','conf','eml','pdf',
              'xlsx', 'xls'
            </div>
          </template>
        </el-upload>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogFormVisible = false"
          >确定</el-button
        >
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
