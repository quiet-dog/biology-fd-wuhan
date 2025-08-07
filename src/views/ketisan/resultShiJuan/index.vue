<script lang='ts' setup>
import { ResultShiJuanListReq } from '@/api/resultShiJuan/types';
import { onMounted, reactive, ref, toRaw } from 'vue';
import { Plus, Refresh, Search } from "@element-plus/icons-vue";
import { dayjs, Sort } from 'element-plus';
import { CommonUtils } from '@/utils/common';
import { resultShiJuanList, resultShiJuanListByCreator } from '@/api/resultShiJuan';
import { PaginationProps } from '@pureadmin/table';
import { PureTableBar } from "@/components/RePureTableBar";
import { useUserStoreHook } from '@/store/modules/user';


const tableRef = ref();
const searchFormParams = reactive<ResultShiJuanListReq>({
  pageNum: 1,
  pageSize: 10,
  userName: "",
  deptIds: [],
  types: [],
});
const defaultSort: Sort = {
  prop: "createTime",
  order: "descending"
};
const pageLoading = ref(true);
const sortState = ref<Sort>(defaultSort);
const dataList = ref([]);
const searchFormRef = ref();
const pagination: PaginationProps = {
  total: 0,
  pageSize: 10,
  currentPage: 1,
  background: true,
};


const columns: TableColumnList = [
  {
    label: "测试编号",
    prop: "resultId"
  },
  {
    label: "人员工号",
    prop: "name"
  },
  {
    label: "人员姓名",
    prop: "shiJuanTypes"
  },
  {
    label: "所属部门",
    prop: "content",
  },
  {
    label: "量表名称",
    prop: "type",
  },
  {
    label: "最终得分",
    prop: "score",
  },
  {
    label: "评估结果",
    prop: "score",
  },
  {
    label: "操作",
    fixed: "right",
    width: 200,
    slot: "operation"
  }
];

const archiveListFun = async () => {
  pageLoading.value = true;

  CommonUtils.fillSortParams(searchFormParams, sortState.value);
  CommonUtils.fillPaginationParams(searchFormParams, pagination);
  const { data } = await resultShiJuanListByCreator(toRaw(searchFormParams)).finally(() => {
    pageLoading.value = false;
  });
  dataList.value = data.rows;
  pagination.total = data.total;
};

//重置
function resetForm() {
  searchFormParams.deptIds = [];
  searchFormParams.types = [];
  searchFormParams.userName = "";
  searchFormParams.beginTime = undefined;
  searchFormParams.endTime = undefined;

  // 重置 pagination 中的属性
  pagination.total = 0;
  pagination.pageSize = 10;
  pagination.currentPage = 1;
  pagination.background = true;
  archiveListFun();
}

const onSearch = tableRef => {
  archiveListFun();
  // 点击搜索的时候，需要重置排序，重新排序的时候会重置分页并发起查询请求
  tableRef.getTableRef();
};

const opType = ref<"add" | "edit">("add");
const modalVisible = ref(false);
const opRow = ref()
function openDialog(type: "add" | "edit", row?) {
  opType.value = type;
  modalVisible.value = true;
  opRow.value = row;
}

const detailVisible = ref(false)
const detailRow = ref()
function openDetailDialog(row) {
  detailRow.value = row
  detailVisible.value = true
}
onMounted(() => {
  archiveListFun()
})
</script>

<template>
  <div class="main">
    <el-form ref="searchFormRef" :inline="true" :model="searchFormParams"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]">
      <el-form-item label="人员姓名：">
        <el-input class="!w-[200px]" placeholder="请输入人员姓名" clearable v-model="searchFormParams.userName" />
      </el-form-item>
      <el-form-item label="所属部门：">
        <!-- <el-input class="!w-[200px]" placeholder="请输入设备名称" clearable v-model="searchFormParams.deptIds" /> -->
      </el-form-item>
      <el-form-item label="量表名称：">
        <!-- <el-input class="!w-[200px]" placeholder="请输入所属区域：" clearable v-model="searchFormParams.area" /> -->
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :icon="Search" @click="archiveListFun">搜索</el-button>
        <el-button :icon="Refresh" @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
    <PureTableBar title="心理测评数据列表" :columns="columns" :tableRef="tableRef?.getTableRef()" @refresh="onSearch">
      <template v-slot="{ size, dynamicColumns }">
        <pure-table ref="tableRef" adaptive :adaptiveConfig="{ offsetBottom: 32 }" align-whole="center"
          row-key="policiesId" showOverflowTooltip table-layout="auto" :size="size" :columns="dynamicColumns"
          :data="dataList" :pagination="pagination" :paginationSmall="size === 'small' ? true : false"
          @page-size-change="archiveListFun" @page-current-change="archiveListFun" :header-cell-style="{
            background: 'var(--el-table-row-hover-bg-color)',
            color: 'var(--el-text-color-primary)'
          }" style="height: auto">

          <template #operation="{ row }">
            <el-button class="reset-margin" link type="primary" :size="size" @click="openDialog('edit', row)">
              修改
            </el-button>
            <el-button class="reset-margin" link type="primary" :size="size" @click="openDetailDialog(row)">
              查看
            </el-button>
          </template>
        </pure-table>
      </template>
    </PureTableBar>

  </div>
</template>

<style scoped></style>
