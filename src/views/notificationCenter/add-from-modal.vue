<script lang='ts' setup>
import VDialog from "@/components/VDialog/VDialog.vue";
import { addMaterials, AddMaterials, addreceiveRes } from '@/api/materialData/receiptRecord';
import { ElMessage, FormRules } from 'element-plus';
import { computed, onMounted } from 'vue';
import { reactive, ref } from 'vue';
import { AddNoticeRequest } from "../system/notice/utils/types";
import { createAppNotification } from "@/api/notificationCenter";
import { getUserListApi } from "@/api/system/user";

const loading = ref(false);
const formData = reactive({
  notificationTitle: "系统更新通知",
  notificationContent: "",
  notificationType: "通知",
  status: "1",
  importance: 0,
  userIds: [],
  isAdminCreate: true,
});

const notiType = ref("通知1")
interface Props {
  type: "add";
  modelValue: boolean;
}
const props = defineProps<Props>();
const emits = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (e: "success"): void;
}>();
const visible = computed({
  get: () => props.modelValue,
  set(v) {
    emits("update:modelValue", v);
  }
});
const rules: FormRules = {
  noticeTitle: [
    {
      required: true,
      message: "通知标题不能为空",
      trigger: "blur"
    }
  ],
  noticeContent: [
    {
      required: true,
      message: "通知内容不能为空",
      trigger: "blur"
    }
  ],
  noticeType: [
    {
      required: true,
      message: "通知类型不能为空",
      trigger: "blur"
    }
  ]
}
const formRef = ref();
async function handleConfirm() {
  try {
    loading.value = true;
    await createAppNotification(formData);
    ElMessage.success("提交成功");
    visible.value = false;
    emits("success");
  } catch (e) {
    console.error(e);
    ElMessage.error((e as Error)?.message || "提交失败");
  } finally {
    loading.value = false;
  }
}

const userList = ref([])
function getUserList() {
  getUserListApi({
    pageNum: 1,
    pageSize: 1000,
  }).then((res) => {
      // 处理用户列表数据
      userList.value = res.data.rows;
      console.log(res.data);

  }).catch((error) => {
    console.error("获取用户列表时发生错误:", error);
    ElMessage.error("获取用户列表时发生错误");
  });
}

function cancelConfirm() {
  visible.value = false;
}


function handleOpened() {
  Object.assign(formData);
  // archiveListFun();
  // archiveListFun2();
}

function handleClosed() {
  formRef.value?.resetFields();
  // unit.value = "";
  // code.value = "";
  // department.value = "";
  // personnelId.value = "";
}

function changeNotiType(value) {
  if (value === "通知1") {
    formData.notificationTitle = "系统更新通知";
    formData.notificationType = "通知"
  } else if (value === "通知2") {
    formData.notificationTitle = "系统公告";
    formData.notificationType = "提醒"
  }
}

onMounted(() => {
  getUserList();
})
</script>

<template>
  <v-dialog show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    title="新增通知"
    v-model="visible"
    :loading="loading"
    @confirm="handleConfirm"
    @cancel="cancelConfirm"
    @opened="handleOpened"
    @closed="handleClosed">
    <el-form :model="formData" label-width="130px" :rules="rules" ref="formRef">
      <el-row >
        <el-col :span="12">
          <el-form-item label="通知标题" prop="notificationTitle">
            <el-input disabled v-model="formData.notificationTitle" clearable placeholder="请选择通知类型" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="通知类型" prop="notificationType">
            <!-- <el-input v-model="formData.noticeType" clearable placeholder="请选择通知类型" /> -->
             <el-select @change="changeNotiType" v-model="notiType" placeholder="请选择通知类型" clearable>
              <el-option label="系统更新通知" value="通知1"></el-option>
              <el-option label="系统公告" value="通知2"></el-option>
             </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row >
        <el-col :span="12">
          <el-form-item label="通知内容" prop="notificationContent">
            <el-input v-model="formData.notificationContent" type="textarea" clearable placeholder="请输入通知内容" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item prop="userIds" label="通知用户">
            <el-select multiple v-model="formData.userIds"  placeholder="请选择通知用户" clearable>
              <el-option v-for="user in userList" :key="user.userId" :label="user.nickname" :value="user.userId"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        </el-row>

    </el-form>
  </v-dialog>
</template>

<style scoped></style>
