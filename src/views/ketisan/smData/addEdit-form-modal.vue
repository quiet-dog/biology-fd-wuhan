<script lang='ts' setup>
import { addSmDevice } from '@/api/smDevice';
import { AddSmDeviceReq, SmDeviceRow } from '@/api/smDevice/types';
import { ElMessage, FormRules } from 'element-plus';
import { computed, reactive, ref } from 'vue';
import VDialog from "@/components/VDialog/VDialog.vue";
import { personnelList } from '@/api/personnelData/personnelProfile';

interface Props {
  type: "add" | "edit";
  modelValue: boolean;
  row: SmDeviceRow
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
  deviceSn: [
    {
      required: true,
      message: "设备sn不能为空"
    }
  ],
  name: [
    {
      required: true,
      message: "设备名称不能为空"
    }
  ],
  personnelId: [
    {
      required: true,
      message: "操作员不能为空"
    }
  ],
  area: [
    {
      required: true,
      message: "区域不能为空"
    }
  ]
};

const formData = reactive<AddSmDeviceReq>({
  name: "",
  personnelId: 0,
  area: "",
  deviceSn: ''
});

const personnelParams = ref({
  total: 0,
  pageSize: 10,
  page: 1
})

const personnelSelect = ref([])
const personnelInfo = ref({})

async function handleConfirm() {
  try {
    loading.value = true;
    await addSmDevice(formData);
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

function getPersonnelList() {
  if (personnelParams.value.total != 0 && personnelParams.value.page * personnelParams.value.pageSize > personnelParams.value.total) {
    return
  }

  // @ts-expect-error
  personnelList({
    pageNum: personnelParams.value.page,
    pageSize: personnelParams.value.pageSize
  }).then(res => {
    // @ts-expect-error
    personnelSelect.value = res.data.rows;
    console.log("personnelSelect", personnelSelect.value)
    // @ts-expect-error
    personnelParams.value.total = res.data.total;
    personnelParams.value.page++;
  })
}

function handleOpened() {
  if (props.row) {
    Object.assign(formData, props.row);
  }
  getPersonnelList()
}

function handleClosed() {
  formRef.value?.resetFields();
  personnelParams.value.page = 1;
  personnelParams.value.pageSize = 10;
  personnelParams.value.total = 0;
}

function changePersonnel(item) {
  personnelInfo.value = item
}

</script>

<template>
  <v-dialog show-full-screen :fixed-body-height="false" use-body-scrolling :title="type == 'add' ? '添加生命设备' : '更新生命设备'"
    v-model="visible" :loading="loading" @confirm="handleConfirm" @cancel="cancelConfirm" @opened="handleOpened"
    @closed="handleClosed">
    <el-form :model="formData" label-width="100px" :rules="rules" ref="formRef">
      <el-row>
        <el-col :span="12">
          <el-form-item label="设备sn号：" prop="deviceSn">
            <el-input v-model="formData.deviceSn" filterable placeholder="请输入设备sn号" style="width: 300px" />

          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="设备名称：">
            <el-input v-model="formData.name" placeholder="请输入设备名称" style="width: 300px" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="操作人员：" prop="personnelId">
            <!-- <el-input-number v-model="formData.reportNum" placeholder="请输入物料数量" :min="1" style="width: 300px" /> -->
            <div v-infinite-scroll="getPersonnelList" style="width: 300px">
              <el-select v-model="formData.personnelId">
                <el-option @click="changePersonnel(item)" v-for="item in personnelSelect" :key="item.personnelId"
                  :label="`${item.name}`" :value="item.personnelId" />
              </el-select>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="部门：">
            <!-- @vue-expect-error -->
            <el-input :placeholder="personnelInfo.department" autocomplete="off" disabled style="width: 300px" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="联系方式：" prop="contact">
            <!-- @vue-expect-error -->
            <el-input :placeholder="personnelInfo.contact" autocomplete="off" disabled style="width: 300px" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="所属区域：" prop="area">
            <el-input v-model="formData.area" placeholder="请输入所属区域"  style="width: 300px" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </v-dialog>
</template>

<style scoped></style>
