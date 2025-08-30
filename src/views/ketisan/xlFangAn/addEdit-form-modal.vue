<script lang="ts" setup>
import { addXlFangAn, getXiLiGroup } from "@/api/xlFangAn";
import { AddXlFangAnReq, XlFangAnRow } from "@/api/xlFangAn/types";
import { ElMessage, FormRules } from "element-plus";
import { computed, reactive, ref } from "vue";
import VDialog from "@/components/VDialog/VDialog.vue";
import { personnelList } from "@/api/personnelData/personnelProfile";
import { getDeptTree } from "@/api/system/dept";
import { getUserListApi } from "@/api/system/user";
import { xlArchiveList } from "@/api/xlArchive";

interface Props {
  type: "add" | "edit";
  modelValue: boolean;
  row: XlFangAnRow;
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
  name: [
    {
      required: true,
      message: "方案名称不能为空"
    }
  ],
  userIds: [
    {
      required: true,
      message: "参与测评人员不能为空"
    }
  ],
  shiJuanTypes: [
    {
      required: true,
      message: "筛选量表"
    }
  ]
};

const formData = reactive<AddXlFangAnReq>({
  name: "",
  userIds: [],
  shiJuanTypes: [],
  pingGuTime: 0
});

async function handleConfirm() {
  try {
    loading.value = true;
    if (Array.isArray(formData.userIds) && formData.userIds.length > 0) {
      // formData.userIds = formData.userIds.map(item => {
      // })
    }

    await addXlFangAn({
      ...formData
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

const deptTree = ref([]);

function markLeafNodes(tree: any[]) {
  tree.forEach(node => {
    node.value = "dept-" + node.id;
    if (Array.isArray(node.children) && node.children.length > 0) {
      // 有子节点，递归处理
      markLeafNodes(node.children);
    } else {
      // 没有子节点，是叶子节点
      node.leaf = false;
      node.children = [];
    }
  });
}

function handleOpened() {
  if (props.row) {
    Object.assign(formData, props.row);
  }
}

const treeProps = ref({
  label: "label",
  children: "children",
  isLeaf: "isLeaf"
});
const lazyLoad = (node, resolve) => {
  const { level, data } = node;
  console.log("node", node);
  if (node.isLeaf) return resolve([]);
  if (level == 0) {
    getXiLiGroup().then(res => {
      const groups = [];
      // @ts-expect-error
      if (Array.isArray(res.data) && res.data.length > 0) {
        // @ts-expect-error
        res.data.forEach(element => {
          groups.push({
            label: element,
            value: element,
            children: [],
            isLeaf: false
          });
        });
      }
      resolve(groups);
    });
  } else if (data != null && data.value != "") {
    xlArchiveList({
      pageNum: 1,
      pageSize: 1000,
      deptName: data.value
    }).then(res => {
      // @ts-expect-error
      if (Array.isArray(res.data.rows) && res.data.rows.length > 0) {
        resolve(
          // @ts-expect-error
          res.data.rows.map(e => {
            return {
              value: e.userId,
              label: `${e.nickname}-${e.jobCode}`,
              isLeaf: true
            };
          })
        );
      }
    });
  }
};

function handleClosed() {
  formRef.value?.resetFields();
}
</script>

<template>
  <v-dialog
    show-full-screen
    :fixed-body-height="false"
    use-body-scrolling
    :title="type == 'add' ? '新增心理测评方案' : '编辑心理测评方案'"
    v-model="visible"
    :loading="loading"
    @confirm="handleConfirm"
    @cancel="cancelConfirm"
    @opened="handleOpened"
    @closed="handleClosed"
  >
    <el-form :model="formData" label-width="150px" :rules="rules" ref="formRef">
      <el-row>
        <el-col :span="12">
          <el-form-item label="方案名称：" prop="name">
            <el-input
              v-model="formData.name"
              filterable
              placeholder="请输入方案名称"
              style="width: 300px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="参与测评人员：" prop="userIds">
            <!-- <el-input v-model="formData.userIds" placeholder="请输入设备名称" style="width: 300px" /> -->
            <el-tree-select
              multiple
              v-model="formData.userIds"
              lazy
              :load="lazyLoad"
              style="width: fit-content"
              :props="treeProps"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="预计评估时间：">
            <el-date-picker
              style="width: 300px"
              value-format="x"
              v-model="formData.pingGuTime"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="筛选量表：" prop="seatNumber">
            <el-checkbox-group v-model="formData.shiJuanTypes">
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
