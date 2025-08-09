<script lang='ts' setup>
import { addXlFangAn } from '@/api/xlFangAn/index';
import { AddXlFangAnReq, XlFangAnRow } from '@/api/xlFangAn/types';
import { ElMessage, FormRules } from 'element-plus';
import { computed, reactive, ref } from 'vue';
import VDialog from "@/components/VDialog/VDialog.vue";
import { getUserListApi } from '@/api/system/user';
import { xlArchiveList } from '@/api/xlArchive';

interface Props {
  modelValue: boolean;
  row: XlFangAnRow
}
const props = defineProps<Props>();
const loading = ref(false);
const formRef = ref();

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



const formData = reactive<AddXlFangAnReq>({
  name: "",
  userIds: [],
  shiJuanTypes: []
});

const userInfos = ref([])


async function handleConfirm() {
  try {
    loading.value = true;
    await addXlFangAn(formData);
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

function cancelConfirm() {
  visible.value = false;
}

function handleOpened() {
  if (props.row) {
    Object.assign(formData, props.row);
  }
  xlArchiveList({
    userIds: formData.userIds,
  }).then(res => {
    // @ts-ignore
    if (Array.isArray(res.data.rows)) {
      // @ts-ignore
      userInfos.value = res.data.rows.map(item => {
        return `${item.nickname}-${item.deptName}`
      })
    }
  })
}

function handleClosed() {

}


</script>

<template>
  <v-dialog show-full-screen :fixed-body-height="false" use-body-scrolling title="信息" v-model="visible"
    :loading="loading" @confirm="handleConfirm" @cancel="cancelConfirm" @opened="handleOpened" @closed="handleClosed">
    <el-form :model="formData" label-width="100px" ref="formRef">
      <el-row>
        <el-col :span="12">
          <el-form-item label="方案名称：" prop="name">
            <el-input v-model="formData.name" disabled filterable placeholder="请输入方案名称" style="width: 300px" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="测评人员：" prop="userIds">
            <!-- <el-input v-model="formData.userIds" disabled placeholder="请输入设备名称" style="width: 300px" /> -->
            <!-- <el-tag v-model="userInfos" disabled style="width: 300px"  /> -->
            <el-tag v-for="item in userInfos" type="info">{{ item }}</el-tag>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="筛选量表：" prop="shiJuanTypes">
            <!-- <el-input :placeholder="formData.shiJuanTypes" disabled autocomplete="off"  style="width: 300px"  /> -->
            <el-checkbox-group disabled v-model="formData.shiJuanTypes">
              <el-checkbox label="心理调查评估问卷" value="心理调查评估问卷" />
              <el-checkbox label="SAS量表" value="SAS量表" />
              <el-checkbox label="SDS量表" value="SDS量表" />
            </el-checkbox-group>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </v-dialog>
</template>

<style scoped></style>
