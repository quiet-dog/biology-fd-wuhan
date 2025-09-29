<script lang="ts" setup>
import { getAnimationApi } from "@/api/animation";
import { CommonUtils } from "@/utils/common";
import { PaginationProps } from "@pureadmin/table";
import { ElMessage, Sort } from "element-plus";
import { onMounted, reactive, ref, toRaw } from "vue";
import { sendAnimationApi } from "../../../api/animation/index";
import { PureTableBar } from "@/components/RePureTableBar";

const columns: TableColumnList = [
  {
    label: "动画名称",
    prop: "name"
  },
  {
    label: "描述",
    prop: "description"
  },
  {
    label: "类型",
    prop: "type"
  },
  {
    label: "键",
    prop: "key"
  },
  {
    label: "绑定工艺",
    prop: "craftArchiveName",
    slot: "craftArchiveName"
  },
  {
    label: "操作",
    prop: "operation",
    slot: "operation"
  }
];
const tableRef = ref();
const pagination: PaginationProps = {
  total: 0,
  pageSize: 10,
  currentPage: 1,
  background: true
};
const dataList = ref([]);
const pageLoading = ref(true);
const modalVisible = ref(false);
const defaultSort: Sort = {
  prop: "createTime",
  order: "descending"
};
const sortState = ref<Sort>(defaultSort);
const searchFormParams = reactive({
  orderColumn: "createTime",
  orderDirection: "descending"
});

const archiveListFun = async () => {
  pageLoading.value = true;

  CommonUtils.fillSortParams(searchFormParams, sortState.value);
  CommonUtils.fillPaginationParams(searchFormParams, pagination);

  const { data } = await getAnimationApi(toRaw(searchFormParams)).finally(
    () => {
      pageLoading.value = false;
    }
  );
  dataList.value = data.rows;
  pagination.total = data.total;
};
const sendAnimation = async row => {
  await sendAnimationApi({
    animationIds: [row.animationId],
    type: row.type
  }).finally(() => {
    ElMessage.success("发送成功");
  });
};

onMounted(() => {
  archiveListFun();
});
</script>

<template>
  <div>
    <PureTableBar
      title="动画填报列表"
      :columns="columns"
      :tableRef="tableRef?.getTableRef()"
    >
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          ref="tableRef"
          adaptive
          :adaptiveConfig="{ offsetBottom: 32 }"
          align-whole="center"
          row-key="policiesId"
          showOverflowTooltip
          table-layout="auto"
          :size="size"
          :columns="dynamicColumns"
          :data="dataList"
          :pagination="pagination"
          :paginationSmall="size === 'small' ? true : false"
          @page-size-change="archiveListFun"
          @page-current-change="archiveListFun"
          :header-cell-style="{
            background: 'var(--el-table-row-hover-bg-color)',
            color: 'var(--el-text-color-primary)'
          }"
          style="height: auto"
        >
          <template #operation="{ row }">
            <el-button type="primary" size="small" @click="sendAnimation(row)"
              >动画控制</el-button
            >
          </template>
        </pure-table>
      </template>
    </PureTableBar>
  </div>
</template>

<style scoped></style>
