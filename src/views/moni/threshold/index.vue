<script lang="ts" setup>
import {
  deleteMoniApi,
  getMoniApi,
  MoniDTO,
  SearchMoniCommand,
  startMoniApi,
  stopMoniApi,
  sendDataMoniApi
} from "@/api/moni";
import { CommonUtils } from "@/utils/common";
import { PaginationProps } from "@pureadmin/table";
import { PureTableBar } from "@/components/RePureTableBar";
import dayjs from "dayjs";
import { Sort } from "element-plus";
import { onMounted, reactive, ref, toRaw } from "vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import AddFill from "@iconify-icons/ri/add-circle-line";
import MoniFormModal from "./moni-form-modal.vue";

const searchFormParams = reactive<SearchMoniCommand>({
  orderColumn: "createTime",
  orderDirection: "descending",
  pushType: "1"
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
    label: "推送频率",
    prop: "pushFrequency",
    slot: "pushFrequency"
  },
  // {
  //   label: "创建时间",
  //   prop: "createTime",
  //   slot: "createTime"
  // },
  {
    label: "操作",
    prop: "operation",
    slot: "operation"
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

  const { data } = await getMoniApi(toRaw(searchFormParams)).finally(() => {
    pageLoading.value = false;
  });
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

function deleteMoni(id: number) {
  deleteMoniApi(id).then(() => {
    archiveListFun();
  });
}

function startMoniApiFunc(row) {
  startMoniApi(row).then(() => {
    archiveListFun();
  });
}

function stopMoniApiFunc(row) {
  stopMoniApi(row).then(() => {
    archiveListFun();
  });
}

const visible = ref(false);
const sendData = ref(0);
function cancelSend() {
  visible.value = false;
  sendData.value = 0;
}
function confirmSend(row) {
  sendDataMoniApi(row.moniId, sendData.value)
    .then(() => {
      visible.value = false;
      sendData.value = 0;
    })
    .catch(() => {
      visible.value = false;
      sendData.value = 0;
    });
}

onMounted(() => {
  archiveListFun();
});
</script>

<template>
  <div>
    <PureTableBar
      title="设备档案模拟列表"
      :columns="columns"
      :tableRef="tableRef?.getTableRef()"
    >
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog('add')"
        >
          新增模拟
        </el-button>
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
          <template #createTime="{ row }">
            <span>{{
              dayjs(row.createTime).format("YYYY-MM-DD HH:mm:ss")
            }}</span>
          </template>
          <template #pushFrequency="{ row }">
            <span v-if="row.pushFrequency >= 3600"
              >{{ row.pushFrequency / 3600 }}/时</span
            >
            <span v-if="row.pushFrequency >= 60 && row.pushFrequency < 3600"
              >{{ row.pushFrequency / 60 }}/分</span
            >
            <span v-if="row.pushFrequency >= 0 && row.pushFrequency < 60"
              >{{ row.pushFrequency }}/秒</span
            >
          </template>
          <template #operation="{ row }">
            <el-popover placement="top" :width="180">
              <el-input-number v-model="sendData" />
              <el-button text @click="cancelSend">取消</el-button>
              <el-button type="primary" @click="confirmSend(row)"
                >确定</el-button
              >
              <template #reference>
                <el-button>发送</el-button>
              </template>
            </el-popover>
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              @click="startMoniApiFunc(row.moniId)"
              v-if="!row.isPush"
            >
              开始推送
            </el-button>
            <el-button
              class="reset-margin"
              link
              type="danger"
              :size="size"
              @click="stopMoniApiFunc(row.moniId)"
              v-else
            >
              停止推送
            </el-button>
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              @click="openDialog('update', row)"
            >
              编辑
            </el-button>
            <!-- <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              @click="deleteMoni(row.moniId)"
            >
              删除
            </el-button> -->
            <el-popconfirm
              @confirm="deleteMoni(row.moniId)"
              title="是否确认删除"
            >
              <template #reference>
                <el-button class="reset-margin" link type="danger" :size="size">
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </pure-table>
      </template>
    </PureTableBar>

    <MoniFormModal
      v-model="modalVisible"
      :type="opType"
      :row="opRow"
      @success="onSearch(tableRef)"
    />
  </div>
</template>

<style scoped></style>
