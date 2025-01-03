<template>
  <div class="main">

      <el-form ref="searchFormRef" :inline="true" :model="form" class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]">
        <el-form-item label="门禁设备编号：">
          <el-input v-model="form.outId" placeholder="请输入门禁设备编号" clearable class="!w-[200px]" />
        </el-form-item>
        <el-form-item label="门禁地点：">
          <el-input v-model="form.doorPlace" placeholder="请输入门禁地点" clearable class="!w-[200px]" />
        </el-form-item>
        <el-form-item label="姓名：">
          <el-input v-model="form.name" placeholder="请输入姓名" clearable class="!w-[200px]" />
        </el-form-item>
          <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon(Search)"
          :loading="pageLoading"
          @click="onSearch"
        >
          搜索
        </el-button>
        <el-button
          :icon="useRenderIcon(Refresh)"
          @click="resetForm(searchFormRef, tableRef)"
        >
          重置
        </el-button>
      </el-form-item>
      </el-form>
      <PureTableBar  title="门禁记录列表" :columns="columns">
        <template v-slot="{ size, dynamicColumns }">
          <pure-table border adaptive 
          ref="tableRef"
          align-whole="center"
          showOverflowTooltip
          table-layout="auto"
          :loading="pageLoading"
          :size="size"
          :data="table"
          :columns="dynamicColumns"
          :pagination="pagination"
          :paginationSmall="size === 'small' ? true : false"
          :header-cell-style="{
            background: 'var(--el-table-row-hover-bg-color)',
            color: 'var(--el-text-color-primary)'
          }"
          @page-size-change="getDoorList"
          @page-current-change="getDoorList">
          </pure-table>
        </template>
      </PureTableBar>



  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import dayjs from "dayjs";
import { getDoorEventList } from "@/api/door/door";
import { useDoorHook } from './hook/index';
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
const { table, columns, form,pageLoading,pagination,getDoorList,onSearch,resetForm } = useDoorHook();
const searchFormRef = ref();
const tableRef = ref();
const formInline = {
  user: "",
  region: "",
  date: ""
};

const tableData = [];

const detailsFormRef = ref();
const detailsClcik = () => {
  detailsFormRef.value.openClick();
};

defineOptions({
  name: "accessControlRecords"
});

onMounted(() => {

})
</script>

<style lang="scss" scoped></style>
