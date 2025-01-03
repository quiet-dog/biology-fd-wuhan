<template>
  <div class="main">
    <el-form
      :inline="true"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
    >
      <el-form-item label="工艺节点：">
        <el-input
          class="!w-[200px]"
          placeholder="请输入工艺节点"
          clearable
          v-model="searchFormParams.craftNode"
        />
      </el-form-item>
      <el-form-item label="所属工艺：">
        <el-select
          placeholder="请选择所属工艺"
          class="!w-[200px]"
          clearable
          v-model="searchFormParams.craftArchiveId"
        >
          <el-option
            v-for="item in dataList2"
            :label="item.craftArchiveName"
            :value="item.craftArchiveId"
            :key="item.craftArchiveId"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="archiveListFun"
          >搜索</el-button
        >
        <el-button :icon="Refresh" @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
    <PureTableBar
      title="工艺流程图"
      :columns="columns"
      :tableRef="tableRef?.getTableRef()"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button type="primary" :icon="Plus" @click="openDialog('add')"
          >新增</el-button
        >
      </template>

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
          <template #isHighRisk="{ row }">
            <span>{{ row.isHighRisk ? "是" : "否" }}</span>
          </template>
          <template #operation="{ row }">
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              @click="openDetailDialog(row)"
            >
              查看
            </el-button>

            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              @click="openDialog('update', row)"
            >
              修改
            </el-button>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
    <processingFlowchartFormModal
      v-model="modalVisible"
      :type="opType"
      :row="opRow"
      @success="onSearch(tableRef)"
    />

    <detailFromModal ref="detailFromModalRef" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive, toRaw } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { PaginationProps } from "@pureadmin/table";
import {
  processListRes,
  processList,
  addprocessRes,
  renewprocessRes
} from "@/api/processData/processFlowChart";
import { archiveListRes, archiveList } from "@/api/processData/processArchives";
import processingFlowchartFormModal from "./processingFlowchart-form-modal.vue";
import detailFromModal from "./detail-from-modal.vue";
import { Sort } from "element-plus";
import { CommonUtils } from "@/utils/common";
import { Plus, Refresh, Search } from "@element-plus/icons-vue";

const tableRef = ref();
const columns: TableColumnList = [
  {
    label: "序号",
    prop: "craftProcessId"
  },
  {
    label: "所属工艺",
    prop: "craftArchive.craftArchiveName"
  },
  {
    label: "工艺节点",
    prop: "craftNode.nodeName"
  },
  {
    label: "节点顺序",
    prop: "nodeOrder"
  },
  {
    label: "人员要素",
    prop: "personnelFactors"
  },
  {
    label: "设备要素",
    prop: "equipmentFactors",
    slot: "equipmentFactors"
  },
  {
    label: "原料要素",
    prop: "materialFactors"
  },
  {
    label: "环境要素",
    prop: "environmentFactors"
  },
  {
    label: "操作",
    slot: "operation",
    fixed: "right",
    width: 200
  }
];

const defaultSort: Sort = {
  prop: "createTime",
  order: "descending"
};

const pageLoading = ref(true);
const dataList = ref([]);

const sortState = ref<Sort>(defaultSort);
const searchFormParams = reactive<processListRes>({
  craftNode: "",
  craftArchiveName: "",
  craftArchiveId: null
});

const pagination: PaginationProps = {
  total: 0,
  pageSize: 10,
  currentPage: 1,
  background: true
};

const archiveListFun = async () => {
  pageLoading.value = true;

  CommonUtils.fillSortParams(searchFormParams, sortState.value);
  CommonUtils.fillPaginationParams(searchFormParams, pagination);

  const { data } = await processList(toRaw(searchFormParams)).finally(() => {
    pageLoading.value = false;
  });
  dataList.value = data.rows;
  pagination.total = data.total;
};

//工艺档案列表
const form = ref<archiveListRes>({
  craftArchiveCode: "",
  craftArchiveName: "",
  version: "",
  ids: [],
  pageSize: 10000
});
const dataList2 = ref([]);
const archiveListFun2 = async () => {
  const { data } = await archiveList(form.value);
  dataList2.value = data.rows;
};

const opType = ref<"add" | "update">("add");
const modalVisible = ref(false);
const opRow = ref<addprocessRes>();
function openDialog(type: "add" | "update", row?: renewprocessRes) {
  opType.value = type;
  opRow.value = row;
  modalVisible.value = true;
}

const detailFromModalRef = ref();
const openDetailDialog = row => {
  detailFromModalRef.value.handleOpened(row.craftProcessId);
};

function resetForm() {
  searchFormParams.craftNode = "";
  searchFormParams.craftArchiveName = "";
  searchFormParams.craftArchiveId = null;

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

onMounted(() => {
  archiveListFun();
  archiveListFun2();
});

defineOptions({
  name: "processNode"
});
</script>

<style lang="scss" scoped></style>
