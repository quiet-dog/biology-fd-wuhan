<template>
  <v-detail-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    :title="!isEditRef ? '查看人员档案' : '编辑人员档案'"
    v-model="visible"
    :loading="loading"
    :disableFooter="true"
    @cancel="cancelConfirm"
    @confirm="handleConfirm"
    :isShowConfirm="isEditRef"
  >
    <el-form :model="formData" label-width="100px" ref="formRef">
      <el-row>
        <el-col :span="12">
          <el-form-item label="员工编号：">
            <el-input
              v-model="formData.code"
              autocomplete="off"
              readonly
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="姓名：" label-width="100">
            <el-input
              v-model="formData.name"
              autocomplete="off"
              readonly
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="性别：" label-width="100">
            <el-input
              v-model="formData.sex"
              autocomplete="off"
              :readonly="!isEditRef"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="部门：" label-width="100">
            <el-input
              v-model="formData.department"
              autocomplete="off"
              readonly
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="岗位：" label-width="100">
            <el-input
              v-model="formData.post"
              autocomplete="off"
              :readonly="!isEditRef"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="学历：" label-width="100">
            <el-select
              style="width: 300px"
              placeholder="请选择学历"
              :disabled="!isEditRef"
              clearable
              v-model="formData.education"
            >
              <el-option label="博士研究生" value="博士研究生" />
              <el-option label="硕士研究生" value="硕士研究生" />
              <el-option label="本科" value="本科" />
              <el-option label="专科" value="专科" />
              <el-option label="高中及以下" value="高中及以下" />
            </el-select>
            <!-- <el-input
              v-model="formData.education"
              autocomplete="off"
               :readonly="!isEditRef"
              style="width: 300px"
            /> -->
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="身份证号：" label-width="100">
            <el-input
              autocomplete="off"
              v-model="formData.card"
              style="width: 300px"
              :readonly="!isEditRef"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="邮箱：" label-width="100">
            <el-input
              autocomplete="off"
              v-model="formData.email"
              style="width: 300px"
              :readonly="!isEditRef"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="联系方式：" label-width="100">
            <el-input
              v-model="formData.contact"
              autocomplete="off"
              style="width: 300px"
              :readonly="!isEditRef"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="入职时间：" label-width="100">
            <!-- <el-input
              v-model="formData.entryTime"
              autocomplete="off"
              style="width: 300px"
               :readonly="!isEditRef"
            /> -->
            <el-date-picker
              :readonly="!isEditRef"
              style="width: 300px"
              value-format="YYYY-MM-DD hh:mm:ss"
              @change="changeEntryTime"
              format="YYYY/MM/DD HH:mm:ss"
              v-model="formData.entryTime"
              type="datetime"
            >
            </el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="离职时间：" label-width="100">
            <!-- <el-input
              v-model="formData.leaveTime"
              autocomplete="off"
              style="width: 300px"
               :readonly="!isEditRef"
            /> -->
            <el-date-picker
              :readonly="!isEditRef"
              style="width: 300px"
              value-format="YYYY-MM-DD hh:mm:ss"
              @change="changeEntryTime"
              format="YYYY/MM/DD HH:mm:ss"
              v-model="formData.leaveTime"
              type="datetime"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </v-detail-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, readonly, toRaw } from "vue";
import { FormInstance } from "element-plus";
import {
  editPersonnel,
  personnelDTO,
  personnelInfo,
  UpdatePersonnelDTO
} from "@/api/personnelData/personnelProfile";
import VDetailDialog from "@/components/VDetailDialog/VDetailDialog.vue";

const visible = ref(false);
const loading = ref(false);
const formRef = ref<FormInstance>();

const formData = ref<UpdatePersonnelDTO>({
  code: "",
  name: "",
  sex: "",
  department: "",
  post: "",
  pRank: "",
  education: null,
  contact: "",
  entryTime: "",
  leaveTime: "",
  email: "",
  card: "",
  personnelId: 0
});

const isEditRef = ref(false);
const entryTime = ref("");

const handleOpened = (id: number, isEdit: boolean) => {
  isEditRef.value = isEdit;
  if (!id) {
    return;
  }
  visible.value = true;
  personnelInfo(id).then(res => {
    formData.value = res.data;
  });
};

function changeEntryTime(data) {
  console.log("data", data);
}

function cancelConfirm() {
  visible.value = false;
  formRef.value?.resetFields();
}

function handleConfirm() {
  editPersonnel(toRaw(formData.value)).then(() => {
    visible.value = false;
    formRef.value?.resetFields();
    emit("refresh");
  });
}

const emit = defineEmits(["refresh"]);

defineExpose({
  handleOpened
});
</script>

<style lang="scss" scoped></style>
