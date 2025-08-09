<script lang='ts' setup>
import { addXlArchive } from '@/api/xlArchive';
import { AddXlArchiveReq, XlArchiveRow } from '@/api/xlArchive/types';
import { ElMessage, FormRules } from 'element-plus';
import { computed, reactive, ref } from 'vue';
import VDialog from "@/components/VDialog/VDialog.vue";
import { personnelList } from '@/api/personnelData/personnelProfile';

interface Props {
  type: "add" | "edit";
  modelValue: boolean;
  row: XlArchiveRow
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

const rules: FormRules = {
  personnelId: [
    {
      required: true,
      message: "人员姓名不能为空"
    }
  ],
};

const formData = reactive<AddXlArchiveReq>({
  personnelId: 0
});

const searchPersonnel = ref({
  pageNum: 1,
  pageSize: 10,
})

const personnelSelect = ref({
  data: [],
  total: 0
})

function getPersonnel() {
  // @ts-expect-error
  personnelList({
    pageNum: searchPersonnel.value.pageNum,
    pageSize: searchPersonnel.value.pageSize,
  }).then(res => {
    // @ts-expect-error
    personnelSelect.value.data = res.data.rows;
    // @ts-expect-error
    personnelSelect.value.total = res.data.tota;
  })
}

function loadModel() {
  if (searchPersonnel.value.pageNum * searchPersonnel.value.pageSize > personnelSelect.value.total) {
    return
  }
  searchPersonnel.value.pageNum++
  // @ts-expect-error
  personnelList({
    pageNum: searchPersonnel.value.pageNum,
    pageSize: searchPersonnel.value.pageSize,
  }).then(res => {
    // @ts-expect-error
    personnelSelect.value.data.push(...res.data.rows)
    // @ts-expect-error
    personnelSelect.value.total = res.data.tota;
  })
}


async function handleConfirm() {
  try {
    loading.value = true;

    await addXlArchive({
      ...formData,
    });
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
const deptName = computed(() => {
  let dept = ""
  if (Array.isArray(personnelSelect.value.data) && personnelSelect.value.data.length > 0) {
    personnelSelect.value.data.some(item => {
      if (item.personnelId == formData.personnelId) {
        dept = item.department;
        return true;
      }
      return false;
    })
  }
  return dept;
})

const deptTree = ref([])

function handleOpened() {
  if (props.row) {
    Object.assign(formData, props.row);
  }
  getPersonnel();
}

function handleClosed() {
  formRef.value?.resetFields();
}


</script>

<template>
  <v-dialog show-full-screen :fixed-body-height="false" use-body-scrolling :title="type == 'add' ? '添加心理健康档案' : '更新心理方案'"
    v-model="visible" :loading="loading" @confirm="handleConfirm" @cancel="cancelConfirm" @opened="handleOpened"
    @closed="handleClosed">
    <el-form :model="formData" label-width="100px" :rules="rules" ref="formRef">
      <el-row>
        <el-col :span="12">
          <el-form-item label="方案名称：" prop="personnelId">
            <!-- <el-input v-model="formData.userId" filterable placeholder="请选择人员姓名" style="width: 300px" /> -->
            <el-select v-model="formData.personnelId">
              <div v-infinite-scroll="loadModel">
                <el-option v-for="item in personnelSelect.data" :key="item.personnelId" :value="item.personnelId"
                  :label="`${item.name}-${item.code}`" />
              </div>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="所属部门：" prop="">
            <el-input :disabled="true" :placeholder="deptName" />
          </el-form-item>
        </el-col>
      </el-row>

    </el-form>
  </v-dialog>
</template>

<style scoped></style>
