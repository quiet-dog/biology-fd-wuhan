<template>
  <div class="main">
    <el-form ref="searchFormRef" :inline="true" :model="searchFormParams"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]">
      <el-form-item label="物料名称：">
        <el-input class="!w-[200px]" placeholder="请输入物料名称" clearable v-model="searchFormParams.name" />
      </el-form-item>
      <el-form-item label="物料类型：">
        <el-input class="!w-[200px]" placeholder="请输入物料类型" clearable v-model="searchFormParams.materialsType" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="archiveListFun">搜索</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
    <PureTableBar title="物料档案列表" :columns="columns" :tableRef="tableRef?.getTableRef()" @refresh="onSearch">
      <template #buttons>
        <el-button type="primary" @click="analyzeFormModalClick">库存分析</el-button>
        <el-button type="primary" :icon="Plus" @click="openDialog('add')">新增</el-button>
        <el-button type="success" :icon="Upload" @click="openImportDialog">导入</el-button>
        <el-button type="warning" :icon="Download" @click="exportClick">导出</el-button>
      </template>

      <template v-slot="{ size, dynamicColumns }">
        <pure-table ref="tableRef" adaptive :adaptiveConfig="{ offsetBottom: 32 }" align-whole="center"
          :row-key="'materialsId'" showOverflowTooltip table-layout="auto" :size="size" :columns="dynamicColumns"
          :data="dataList" :pagination="pagination" :paginationSmall="size === 'small' ? true : false"
          @selection-change="
            rows => (multipleSelection = rows.map(item => item.materialsId))
          " @page-size-change="archiveListFun" @page-current-change="archiveListFun" :header-cell-style="{
            background: 'var(--el-table-row-hover-bg-color)',
            color: 'var(--el-text-color-primary)'
          }" style="height: auto">
          <template #tag="{ row }">
            <el-tag v-if="row.tag" :color="row.color != undefined ? row.color : '#409eff'">
              {{ row.tag }}
            </el-tag>
          </template>

          <template #operation="{ row }">
            <el-popover :width="300" trigger="click">
              <template #reference>
                <el-button class="reset-margin" link type="primary" :size="size">
                  入库
                </el-button>
              </template>
              <!-- <el-input-number v-model="row.currentStock"  :precision="2" :step="0.1" /> -->
              <ElForm>
                <ElFormItem label="入库量">
                  <ElInputNumber v-model="row.currentStock" :precision="2" :step="0.1" />
                </ElFormItem>
                <ElFormItem label="批次">
                  <ElInput v-model="row.batch" />
                </ElFormItem>
                <ElFormItem>
                  <el-button type="danger" size="small" @click="confirmStock(row)">
                    确定?
                  </el-button>
                </ElFormItem>
              </ElForm>

            </el-popover>

            <el-button class="reset-margin" link type="primary" :size="size" @click="openDetailDialog(row)">
              查看
            </el-button>
            <el-button class="reset-margin" link type="primary" :size="size" @click="thresholdSettingClick(row)">
              阈值设置
            </el-button>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
    <policiesArchivesFormModal @success="archiveListFun" v-model="modalVisible" :row="opRow" />
    <detailFromModal ref="detailFromModalRef" />
    <importFormModal ref="importRef" @refresh="archiveListFun" />
    <analyzeFormModal ref="analyzeFormModalRef" @refresh="archiveListFun" />
    <AddFormModal v-model="AddModalVisible" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive, toRaw, h } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { PaginationProps } from "@pureadmin/table";
import {
  materialFilesListRes,
  materialFilesList,
  addStock,
  exportMaterialEvents
} from "@/api/materialData/materialFiles";
import detailFromModal from "./detail-from-modal.vue";
import importFormModal from "./import-form-modal.vue";
import { ElMessage, Sort } from "element-plus";
import { CommonUtils } from "@/utils/common";
import { Upload, Plus, Download } from "@element-plus/icons-vue";
import policiesArchivesFormModal from "./policiesArchives-form-modal.vue";
import analyzeFormModal from "./analyze-from-modal.vue";
import AddFormModal from "./add-from-modal.vue";
import { ExportDownload } from "@/utils/exportdownload";
const AddModalVisible = ref(false);
const tableRef = ref();
const columns: TableColumnList = [
  {
    type: "selection",
    align: "left"
  },
  {
    label: "物料编号",
    prop: "code"
  },
  {
    label: "物料名称",
    prop: "name"
  },
  {
    label: "物料规格",
    prop: "specification"
  },
  {
    label: "物料类型",
    prop: "type"
  },
  {
    label: "物料标签",
    prop: "tag",
    slot: "tag"
  },
  {
    label: "库存量",
    prop: "stock"
  },
  // {
  //   label: "当前入库量",
  //   prop: "lastStock"
  // },
  {
    label: "物料单位",
    prop: "unit"
  },
  // {
  //   label: "批次",
  //   prop: "batch"
  // },
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

function confirmStock(row) {
  console.log("row", row);
  addStock({
    materialsId: row.materialsId,
    stock: row.currentStock,
    batch: row.batch
  }).then(() => {
    ElMessage.success("入库成功");
    archiveListFun();
  }).catch(() => {
    ElMessage.error("入库失败");
  });
}

const pageLoading = ref(true);
const dataList = ref([]);
const sortState = ref<Sort>(defaultSort);
const multipleSelection = ref([]);

const searchFormRef = ref();
const searchFormParams = reactive<materialFilesListRes>({
  name: "",
  materialsType: "",
  materialsIds: [],
});

const pagination: PaginationProps = {
  total: 0,
  pageSize: 10,
  currentPage: 1,
  background: true
};

const archiveListFun = async () => {
  pageLoading.value = true;
  // if (multipleSelection.value.length > 0) {
  //   searchFormParams.materialsIds = multipleSelection.value;
  //   CommonUtils.fillSortParams(searchFormParams, sortState.value);
  //   CommonUtils.fillPaginationParams(searchFormParams, pagination);
  // } else {
    CommonUtils.fillSortParams(searchFormParams, sortState.value);
    CommonUtils.fillPaginationParams(searchFormParams, pagination);
  // }



  const { data } = await materialFilesList(toRaw(searchFormParams)).finally(
    () => {
      pageLoading.value = false;
    }
  );
  dataList.value = data.rows;
  pagination.total = data.total;
};

function resetForm() {
  searchFormParams.name = "";
  searchFormParams.materialsType = "";

  // 重置 pagination 中的属性
  pagination.total = 0;
  pagination.pageSize = 10;
  pagination.currentPage = 1;
  pagination.background = true;
  archiveListFun();
}

const detailFromModalRef = ref();
const openDetailDialog = row => {
  detailFromModalRef.value.handleOpened(row.materialsId);
};

//报警频次分析
const analyzeFormModalRef = ref();
const analyzeFormModalClick = () => {
  analyzeFormModalRef.value.handleOpened();
};

const modalVisible = ref(false);
const opRow = ref();
const thresholdSettingClick = row => {
  opRow.value = row;
  modalVisible.value = true;
};

//导入
const importRef = ref();
const openImportDialog = () => {
  importRef.value.handleOpened();
};

const onSearch = tableRef => {
  archiveListFun();
  // 点击搜索的时候，需要重置排序，重新排序的时候会重置分页并发起查询请求
  tableRef.getTableRef();
};

const opType = ref("add");
function openDialog(type: "add") {
  opType.value = type;
  AddModalVisible.value = true;
}

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

  exportMaterialEvents(
    toRaw({ ...searchFormParams,materialsIds: multipleSelection.value })
  ).then(res => {
    console.log(res);
    ExportDownload(res, "物料档案列表");
  });
}

onMounted(() => {
  archiveListFun();
});

defineOptions({
  name: "processNode"
});
</script>

<style lang="scss" scoped></style>
