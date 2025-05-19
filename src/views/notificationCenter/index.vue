<template>
  <div class="main">
    <el-form
      ref="searchFormRef"
      :inline="true"
      :model="searchFormParams"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
    >
      <el-form-item label="标题：">
        <el-input
          class="!w-[200px]"
          v-model="searchFormParams.notificationTitle"
          placeholder="请输入标题"
          clearable
        />
      </el-form-item>
      <el-form-item label="类型：">
        <el-select
          class="!w-[200px]"
          v-model="searchFormParams.notificationType"
          placeholder="请选择类型"
        >
          <el-option label="通知" value="通知" />
          <el-option label="提醒" value="提醒" />
        </el-select>
      </el-form-item>
      <el-form-item label="报警时间：">
        <el-date-picker
          class="!w-[240px]"
          v-model="timeRange"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="archiveListFun"
          >搜索</el-button
        >
        <el-button :icon="Refresh" @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
    <PureTableBar
      title="通知中心列表"
      :columns="columns"
      :tableRef="tableRef?.getTableRef()"
      @refresh="onSearch"
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
          <template #sendTime="{ row }">
            <span>{{ dayjs(row.sendTime).format("YYYY-MM-DD") }}</span>
          </template>
          <template #readStatus="{ row }">
            <span>{{ row.readStatus == 0 ? "未读 " : "已读" }}</span>
          </template>
          <template #importance="{ row }">
            <div @click="handleImportance(row)" class="cursor-pointer">
              <el-icon v-if="row.importance == 0" size="18" color="red"
                ><StarFilled
              /></el-icon>
              <el-icon v-else><Star /></el-icon>
            </div>
          </template>
          <template #notificationType="{ row }">
            <el-tag
              :type="row.notificationType == '通知' ? 'primary' : 'warning'"
            >
              {{ row.notificationType }}</el-tag
            >
          </template>
          <template #operation="{ row }">
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              @click.stop="openDetailDialog(row)"
            >
              查看
            </el-button>

            <el-button
              class="reset-margin"
              link
              type="danger"
              :size="size"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
    <detailFromModal ref="detailRef" @list="archiveListFun" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive, toRaw, computed } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { PaginationProps } from "@pureadmin/table";
import {
  notificationListRes,
  notificationList,
  deletenode,
  updateNotification
} from "@/api/notificationCenter";
import detailFromModal from "./detail-from-modal.vue";
import { Sort } from "element-plus";
import { CommonUtils } from "@/utils/common";
import { Refresh, Search, Star, StarFilled } from "@element-plus/icons-vue";
import dayjs from "dayjs";
import { ElMessage, ElMessageBox } from "element-plus";

const tableRef = ref();
const timeRange = computed<[string, string] | null>({
  get() {
    if (searchFormParams.beginTime && searchFormParams.endTime) {
      return [searchFormParams.beginTime, searchFormParams.endTime];
    } else {
      return null;
    }
  },
  set(v) {
    if (v?.length === 2) {
      searchFormParams.beginTime = v[0];
      searchFormParams.endTime = v[1];
    } else {
      searchFormParams.beginTime = undefined;
      searchFormParams.endTime = undefined;
    }
  }
});

const columns: TableColumnList = [
  {
    label: "编号",
    prop: "notificationId"
  },
  {
    label: "标题",
    prop: "notificationTitle"
  },
  {
    label: "内容",
    prop: "notificationContent"
  },
  {
    label: "类型",
    prop: "notificationType",
    slot: "notificationType"
  },
  {
    label: "发送时间",
    prop: "sendTime",
    slot: "sendTime"
  },
  {
    label: "状态",
    prop: "readStatus",
    slot: "readStatus"
  },
  {
    label: "标为重要",
    prop: "importance",
    slot: "importance"
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
  order: "ascending"
};

const pageLoading = ref(true);
const sortState = ref<Sort>(defaultSort);
const dataList = ref([]);
const searchFormRef = ref();
const searchFormParams = reactive<notificationListRes>({
  notificationTitle: "",
  notificationType: ""
});

const handleImportance = row => {
  // 编辑数据 切换重要
  row.importance = row.importance == 0 ? 1 : 0;

  // 更新数据
  updateNotification(row.notificationId, row).then(() => {
    archiveListFun();
  });
};

const pagination: PaginationProps = {
  total: 0,
  pageSize: 10,
  currentPage: 1,
  background: true
};
const archiveListFun = async () => {
  pageLoading.value = true;

  searchFormParams.orderColumn = "createTime";
  searchFormParams.orderDirection = "descending";

  CommonUtils.fillSortParams(searchFormParams, sortState.value);
  CommonUtils.fillPaginationParams(searchFormParams, pagination);

  const { data } = await notificationList(toRaw(searchFormParams)).finally(
    () => {
      pageLoading.value = false;
    }
  );
  dataList.value = data.rows;
  pagination.total = data.total;
};

//重置
function resetForm() {
  searchFormParams.notificationTitle = "";
  searchFormParams.notificationType = "";
  searchFormParams.beginTime = undefined;
  searchFormParams.endTime = undefined;

  // 重置 pagination 中的属性
  pagination.total = 0;
  pagination.pageSize = 10;
  pagination.currentPage = 1;
  pagination.background = true;
  archiveListFun();
}

// 详情
const detailRef = ref();
const openDetailDialog = row => {
  detailRef.value.handleOpened(row.notificationId);
};
function handleDelete(row) {
  ElMessageBox.confirm("确认要删除该条数据吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      deletenode([row.notificationId]).then(() => {
        ElMessage.success("删除成功");
        archiveListFun();
      });
    })
    .catch(() => {
      ElMessage.info("已取消删除");
    });
}

const onSearch = tableRef => {
  archiveListFun();
  // 点击搜索的时候，需要重置排序，重新排序的时候会重置分页并发起查询请求
  tableRef.getTableRef().sort("createTime", "ascending");
};

onMounted(() => {
  archiveListFun();
});
defineOptions({
  name: "processArchives"
});
</script>

<style lang="scss" scoped></style>
