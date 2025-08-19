<script lang='ts' setup>
import { SmDeviceListReq } from '@/api/smDevice/types';
import { onMounted, reactive, ref, toRaw } from 'vue';
import { Plus, Refresh, Search, Download } from "@element-plus/icons-vue";
import { dayjs, Sort } from 'element-plus';
import { CommonUtils } from '@/utils/common';
import { exportSmDevice, smDeviceList } from '@/api/smDevice';
import { PaginationProps } from '@pureadmin/table';
import { PureTableBar } from "@/components/RePureTableBar";
import addEditFormModal from "./addEdit-form-modal.vue";
import detailFormModal from "./detai-form-modal.vue";
import SmThreshold from './sm-threshold.vue';
import { ExportDownload } from '@/utils/exportdownload';

const tableRef = ref();
const searchFormParams = reactive<SmDeviceListReq>({
  pageNum: 1,
  pageSize: 10,
  name: "",
  deviceSn: "",
  area: "",
  personnelName: "",
  online: ""
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
    label: "设备sn",
    prop: "deviceSn"
  },
  {
    label: "设备名称",
    prop: "name"
  },
  {
    label: "操作员",
    prop: "personnelName"
  },
  {
    label: "所属区域",
    prop: "area",
  },
  {
    label: "状态",
    prop: "isOnline",
  },
  {
    label: "最后通讯时间",
    prop: "lastTime",
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
  // @ts-expect-error
  const { data } = await smDeviceList(toRaw(searchFormParams)).finally(() => {
    pageLoading.value = false;
  });
  dataList.value = data.rows;
  pagination.total = data.total;
};

//重置
function resetForm() {
  searchFormParams.name = "";
  searchFormParams.personnelName = "";
  searchFormParams.area = "";
  searchFormParams.deviceSn = "";
  searchFormParams.online = "";
  searchFormParams.smDeviceIds= []
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

const smThresholdRef = ref<InstanceType<typeof SmThreshold>>()
function openSmThrehold(id) {
  smThresholdRef.value.open(id)
}
const multipleSelection = ref([]);
const exportClick = () => {
  if (multipleSelection.value.length == 0) {
    CommonUtils.fillSortParams(searchFormParams, sortState.value);
    CommonUtils.fillPaginationParams(searchFormParams, {
      ...pagination,
      pageSize: 10000,
      currentPage: 1,
    });
  } else {
    CommonUtils.fillSortParams(searchFormParams, sortState.value);
    CommonUtils.fillPaginationParams(searchFormParams, {
      ...pagination,
      pageSize: undefined,
      currentPage: undefined,
    });
  }

  exportSmDevice(
    toRaw({ ...searchFormParams, smDeviceIds: multipleSelection.value })
  ).then(res => {
    console.log(res);
    ExportDownload(res, "生命设备列表");
  });
}


onMounted(() => {
  archiveListFun()
})
</script>

<template>
  <div class="main">
    <el-form ref="searchFormRef" :inline="true" :model="searchFormParams"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]">
      <el-form-item label="设备sn号：">
        <el-input class="!w-[200px]" placeholder="请输入设备sn号" clearable v-model="searchFormParams.deviceSn" />
      </el-form-item>
      <el-form-item label="设备名称：">
        <el-input class="!w-[200px]" placeholder="请输入设备名称" clearable v-model="searchFormParams.name" />
      </el-form-item>
      <el-form-item label="所属区域：">
        <el-input class="!w-[200px]" placeholder="请输入所属区域：" clearable v-model="searchFormParams.area" />
      </el-form-item>
      <el-form-item label="设备状态：">
        <el-select v-model="searchFormParams.online">
          <el-option label="在线" :value="'在线'" />
          <el-option label="离线" :value="'离线'" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="archiveListFun">搜索</el-button>
        <el-button :icon="Refresh" @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
    <PureTableBar title="人员上报列表" :columns="columns" :tableRef="tableRef?.getTableRef()" @refresh="onSearch">
      <template #buttons>
        <el-button type="primary" :icon="Plus" @click="openDialog('add')">新增</el-button>
        <el-button type="warning" :icon="Download" @click="exportClick">导出</el-button>
      </template>

      <template v-slot="{ size, dynamicColumns }">
        <pure-table @selection-change="
          rows => (multipleSelection = rows.map(item => item.smDeviceId))
        " ref="tableRef" adaptive :adaptiveConfig="{ offsetBottom: 32 }" align-whole="center" :row-key="'smDeviceId'"
          showOverflowTooltip table-layout="auto" :size="size" :columns="dynamicColumns" :data="dataList"
          :pagination="pagination" :paginationSmall="size === 'small' ? true : false" @page-size-change="archiveListFun"
          @page-current-change="archiveListFun" :header-cell-style="{
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
            <el-button class="reset-margin" link type="danger" :size="size" @click="openSmThrehold(row.smDeviceId)">
              阈值设置
            </el-button>
          </template>
        </pure-table>
      </template>

    </PureTableBar>
    <addEditFormModal v-model="modalVisible" :type="opType" :row="opRow" @success="onSearch(tableRef)" />
    <detailFormModal v-model="detailVisible" :row="detailRow" />
    <SmThreshold ref="smThresholdRef" />
  </div>
</template>

<style scoped></style>
