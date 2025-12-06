<script lang="ts" setup>
import { useVideoHook } from "./hook/hook";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { PureTableBar } from "@/components/RePureTableBar";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import EditPen from "@iconify-icons/ep/edit-pen";
import { ref } from "vue";
import Video from "./components/Video.vue";
import { getStreamUrlApi } from "@/api/video";

defineOptions({
  name: "ManageVideo"
});

const videoRef = ref(null);

const formRef = ref();
const {
  form,
  loading,
  onSearch,
  resetForm,
  columns,
  dataList,
  pagination,
  handlePageChange,
  dialogOb,
  playUrl
} = useVideoHook();
const channelId = ref("");

function opened() {
  const url = new URL(playUrl.value);
  url.host = window.location.host;
  videoRef.value.play(url.toString());
  videoRef.value.setChannelId(channelId.value);
}

function viewVideo(row) {
  channelId.value = row.channelid;
  getStreamUrlApi(row.channelid)
    .then(res => {
      playUrl.value = res.data.wsflv;
      dialogOb.value.title = row.name;
      dialogOb.value.visible = true;
    })
    .catch(err => {});
}

const key = ref(0);

function refreshKey(error) {
  console.log("重连接");
  key.value++;
}
</script>

<template>
  <div class="main">
    <el-form
      :inline="true"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
      :model="form"
    >
      <ElFormItem label="视频名称" prop="videoName">
        <el-input v-model="form.name" />
      </ElFormItem>

      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon(Search)"
          :loading="loading"
          @click="onSearch"
        >
          搜索
        </el-button>
        <el-button :icon="useRenderIcon(Refresh)" @click="resetForm(formRef)">
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <PureTableBar title="监控列表" :columns="columns" @refresh="onSearch">
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          border
          align-whole="center"
          showOverflowTooltip
          table-layout="auto"
          :loading="loading"
          :size="size"
          adaptive
          :data="dataList"
          :columns="dynamicColumns"
          :pagination="pagination"
          :paginationSmall="size === 'small' ? true : false"
          :header-cell-style="{
            background: 'var(--el-table-row-hover-bg-color)',
            color: 'var(--el-text-color-primary)'
          }"
          @page-current-change="handlePageChange"
        >
          <template #operation="{ row }">
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              @click="viewVideo(row)"
              :icon="useRenderIcon(EditPen)"
            >
              查看
            </el-button>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
    <ElDialog
      :title="dialogOb.title"
      @opened="opened"
      width="960px"
      style="width: 1060px; height: 697px"
      destroy-on-close
      v-model="dialogOb.visible"
    >
      <Video style="margin: 0 auto" ref="videoRef" />
    </ElDialog>
  </div>
</template>

<style scoped></style>
