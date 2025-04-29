<script lang='ts' setup>
import { getMoniApi, MoniDTO, SearchMoniCommand } from '@/api/moni';
import { CommonUtils } from '@/utils/common';
import { PaginationProps } from '@pureadmin/table';
import { PureTableBar } from "@/components/RePureTableBar";
import dayjs from 'dayjs';
import { Sort } from 'element-plus';
import { onMounted, reactive, ref, toRaw } from 'vue';
import { useRenderIcon } from '@/components/ReIcon/src/hooks';
import AddFill from "@iconify-icons/ri/add-circle-line";
import MoniFormModal from "./moni-form-modal.vue";


const searchFormParams = reactive<SearchMoniCommand>({
  orderColumn: "createTime",
  orderDirection: "descending",
  pushType:"2",
});

const columns: TableColumnList = [
  {
    label: "描述",
    prop: "description"
  },
  {
    label: "最小值",
    prop: "min"
  },
  {
    label: "最大值",
    prop: "max"
  },
  {
    label: "创建时间",
    prop: "createTime",
    slot: "createTime"
  }
];
const opType = ref<"add" | "update">("add");
const opRow = ref<MoniDTO>();
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
  order: "ascending"
};
const sortState = ref<Sort>(defaultSort);
const archiveListFun = async () => {
  pageLoading.value = true;

  CommonUtils.fillSortParams(searchFormParams, sortState.value);
  CommonUtils.fillPaginationParams(searchFormParams, pagination);

  const { data } = await getMoniApi(toRaw(searchFormParams)).finally(
    () => {
      pageLoading.value = false;
    }
  );
  dataList.value = data.rows;
  pagination.total = data.total;
};

async function onSearch(tableRef) {
  archiveListFun();
  // 点击搜索的时候，需要重置排序，重新排序的时候会重置分页并发起查询请求
  tableRef.getTableRef().sort("createTime", "descending");
}

function openDialog(type: "add" | "update", row?: MoniDTO) {
  opType.value = type;
  opRow.value = row;
  modalVisible.value = true;
}


onMounted(() => {
  archiveListFun();
})



</script>

<template>
  <div>
    <PureTableBar title="设备档案模拟列表" :columns="columns" :tableRef="tableRef?.getTableRef()">
      <template #buttons>
        <el-button type="primary" :icon="useRenderIcon(AddFill)"  @click="openDialog('add')">
          新增模拟
        </el-button>
      </template>
      <template v-slot="{ size, dynamicColumns }">
        <pure-table ref="tableRef" adaptive :adaptiveConfig="{ offsetBottom: 32 }" align-whole="center"
          row-key="policiesId" showOverflowTooltip table-layout="auto" :size="size" :columns="dynamicColumns"
          :data="dataList" :pagination="pagination" :paginationSmall="size === 'small' ? true : false"
          @page-size-change="archiveListFun" @page-current-change="archiveListFun" :header-cell-style="{
            background: 'var(--el-table-row-hover-bg-color)',
            color: 'var(--el-text-color-primary)'
          }" style="height: auto">
          <template #createTime="{ row }">
            <span>{{
              dayjs(row.createTime).format("YYYY-MM-DD HH:mm:ss")
            }}</span>
          </template>
        </pure-table>
      </template>
    </PureTableBar>

    <MoniFormModal v-model="modalVisible" :type="opType" :row="opRow" @success="onSearch(tableRef)"
       />
  </div>
</template>

<style scoped></style>
