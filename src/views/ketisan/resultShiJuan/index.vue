<script lang="ts" setup>
import { ResultShiJuanListReq } from "@/api/resultShiJuan/types";
import { onMounted, reactive, ref, toRaw } from "vue";
import { Plus, Refresh, Search, Download } from "@element-plus/icons-vue";
import { dayjs, Sort } from "element-plus";
import { CommonUtils } from "@/utils/common";
import {
  exportResultShiJuanByCreator,
  resultShiJuanList,
  resultShiJuanListByCreator
} from "@/api/resultShiJuan";
import { PaginationProps } from "@pureadmin/table";
import { PureTableBar } from "@/components/RePureTableBar";
import { useUserStoreHook } from "@/store/modules/user";
import ShiJuanDetail from "@/components/ShiJuanDetail/index.vue";
import GanYuEdit from "@/components/GanYuEdit/index.vue";
import { getXiLiGroup } from "@/api/xlFangAn";
import { ExportDownload } from "@/utils/exportdownload";

const tableRef = ref();
const shiJuanDetailRef = ref<InstanceType<typeof ShiJuanDetail>>();
const ganYuEditRef = ref<InstanceType<typeof GanYuEdit>>();
const searchFormParams = reactive<ResultShiJuanListReq>({
  pageNum: 1,
  pageSize: 10,
  userName: "",
  deptIds: [],
  types: [],
  deptName: "",
  type: ""
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
  background: true
};

const columns: TableColumnList = [
  {
    type: "selection",
    align: "left"
  },
  {
    label: "测试编号",
    prop: "resultId"
  },
  {
    label: "人员工号",
    prop: "userJobCode"
  },
  {
    label: "人员姓名",
    prop: "userNickname"
  },
  {
    label: "所属部门",
    prop: "deptName"
  },
  {
    label: "量表名称",
    prop: "type"
  },
  {
    label: "最终得分",
    prop: "score"
  },
  {
    label: "评估结果",
    prop: "cePing"
  },
  {
    label: "评估时间",
    prop: "lastTime",
    slot: "lastTime"
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
  const { data } = await resultShiJuanListByCreator(
    toRaw(searchFormParams)
  ).finally(() => {
    pageLoading.value = false;
  });
  dataList.value = data.rows;
  pagination.total = data.total;
};

//重置
function resetForm() {
  searchFormParams.deptIds = [];
  searchFormParams.types = [];
  searchFormParams.deptName = "";
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
const opRow = ref();
function openDialog(type: "add" | "edit", row?) {
  opType.value = type;
  modalVisible.value = true;
  opRow.value = row;
}

const detailVisible = ref(false);
const detailRow = ref();
function openDetailDialog(row) {
  detailRow.value = row;
  detailVisible.value = true;
}
const groups = ref([]);
const xinLiGroup = ["心理调查评估问卷", "SAS量表", "SDS量表"];

const multipleSelection = ref([]);
const exportClick = () => {
  if (multipleSelection.value.length == 0) {
    CommonUtils.fillSortParams(searchFormParams, sortState.value);
    CommonUtils.fillPaginationParams(searchFormParams, {
      ...pagination,
      pageSize: 10000,
      currentPage: 1
    });
  } else {
    CommonUtils.fillSortParams(searchFormParams, sortState.value);
    CommonUtils.fillPaginationParams(searchFormParams, {
      ...pagination,
      pageSize: undefined,
      currentPage: undefined
    });
  }

  exportResultShiJuanByCreator(
    toRaw({ ...searchFormParams, resultIds: multipleSelection.value })
  ).then(res => {
    console.log(res);
    ExportDownload(res, "心理测评数据列表");
  });
};
onMounted(() => {
  archiveListFun();
  getXiLiGroup().then(res => {
    // @ts-expect-error
    groups.value = res.data;
  });
});
</script>

<template>
  <div class="main">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="searchFormParams"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
    >
      <el-form-item label="人员姓名：">
        <el-input
          class="!w-[200px]"
          placeholder="请输入人员姓名"
          clearable
          v-model="searchFormParams.userName"
        />
      </el-form-item>
      <el-form-item label="所属部门：">
        <el-select :clearable="true" v-model="searchFormParams.deptName">
          <el-option
            v-for="item in groups"
            :value="item"
            :label="item"
            :key="item"
          />
        </el-select>
        <!-- <el-input class="!w-[200px]" placeholder="请输入设备名称" clearable v-model="searchFormParams.deptIds" /> -->
      </el-form-item>
      <el-form-item label="量表名称：">
        <el-select :clearable="true" v-model="searchFormParams.type">
          <el-option
            v-for="item in xinLiGroup"
            :value="item"
            :label="item"
            :key="item"
          />
        </el-select>
        <!-- <el-input class="!w-[200px]" placeholder="请输入所属区域：" clearable v-model="searchFormParams.area" /> -->
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :icon="Search" @click="archiveListFun"
          >搜索</el-button
        >
        <el-button :icon="Refresh" @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
    <PureTableBar
      title="心理测评数据列表"
      :columns="columns"
      :tableRef="tableRef?.getTableRef()"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button type="warning" :icon="Download" @click="exportClick"
          >导出</el-button
        >
      </template>
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          @selection-change="
            rows => (multipleSelection = rows.map(item => item.resultId))
          "
          ref="tableRef"
          adaptive
          :adaptiveConfig="{ offsetBottom: 32 }"
          align-whole="center"
          row-key="resultId"
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
          <template #lastTime="{ row }">
            <span>{{
              row.lastTime != null
                ? dayjs(row.lastTime).format("YYYY-MM-DD")
                : ""
            }}</span>
          </template>

          <template #operation="{ row }">
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              @click="shiJuanDetailRef.handleOpen(row.resultId)"
            >
              查看
            </el-button>
            <el-button
              v-if="
                row.lastTime != null &&
                row.cePing != '正常范围' &&
                row.cePing != '无明显抑郁症状' &&
                row.cePing != '无明显焦虑症状'
              "
              class="reset-margin"
              link
              type="primary"
              :size="size"
              @click="ganYuEditRef.handleOpen(row.resultId)"
            >
              干预措施
            </el-button>
          </template>
        </pure-table>
      </template>
    </PureTableBar>

    <ShiJuanDetail ref="shiJuanDetailRef" />
    <GanYuEdit ref="ganYuEditRef" />
  </div>
</template>

<style scoped></style>
