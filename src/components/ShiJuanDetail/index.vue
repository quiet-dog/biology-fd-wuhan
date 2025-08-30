<script lang="ts" setup>
import { computed, ref } from "vue";
import VDialog from "../VDialog/VDialog.vue";
import {
  getResultShiJuan,
  getShiJuan,
  setResultShiJuan
} from "@/api/resultShiJuan";
import { ElMessage, Sort } from "element-plus";
import { SetResult } from "@/api/resultShiJuan/types";
import { useIntervalFn } from "@vueuse/core";
const visible = ref(false);
const info = ref();
const data = ref([]);
const defaultSort: Sort = {
  prop: "createTime",
  order: "descending"
};

const title = ref("结果");

function cancelConfirm() {
  visible.value = false;
}

function handleOpen(resultId: number) {
  getResultShiJuan(resultId).then(res => {
    // @ts-expect-error
    info.value = res.data;

    getShiJuan({
      type: info.value.type,
      pageNum: 1,
      pageSize: 100,
      orderColumn: "sort",
      orderDirection: "ascending"
    }).then(shi => {
      // shi.data.rows.forEach(element => {
      //   element.select = '';
      // });
      // @ts-expect-error
      data.value = shi.data.rows;
    });
  });
  visible.value = true;
}

function handleConfirem() {}

defineExpose({
  handleOpen
});
</script>

<template>
  <VDialog
    @cancel="cancelConfirm"
    @confirm="handleConfirem"
    use-body-scrolling
    :title="title"
    v-model="visible"
  >
    <!-- <ElCard> -->
    <ElDescriptions
      v-for="(item, index) in data"
      :title="`${index + 1}、${item.name}`"
      :key="index"
    >
      <ElDescriptionsItem>
        <template v-if="info.result">
          <ElRadioGroup :disabled="true" v-model="info.result[index].result">
            <ElRadio v-if="item.type == '心理调查评估问卷'" label="A"
              >从无</ElRadio
            >
            <ElRadio v-if="item.type == '心理调查评估问卷'" label="B"
              >轻度</ElRadio
            >
            <ElRadio v-if="item.type == '心理调查评估问卷'" label="C"
              >中度</ElRadio
            >
            <ElRadio v-if="item.type == '心理调查评估问卷'" label="D"
              >偏重</ElRadio
            >
            <ElRadio v-if="item.type == '心理调查评估问卷'" label="E"
              >严重</ElRadio
            >

            <ElRadio v-if="item.type == 'SAS量表'" label="A"
              >没有或很少时间有（偶尔）</ElRadio
            >
            <ElRadio v-if="item.type == 'SAS量表'" label="B"
              >小部分时间有（有时）</ElRadio
            >
            <ElRadio v-if="item.type == 'SAS量表'" label="C"
              >相当多时间有（经常）</ElRadio
            >
            <ElRadio v-if="item.type == 'SAS量表'" label="D"
              >绝大部分或全部时间有（持续）</ElRadio
            >

            <ElRadio v-if="item.type == 'SDS量表'" label="A"
              >没有或很少时间有（偶尔）</ElRadio
            >
            <ElRadio v-if="item.type == 'SDS量表'" label="B"
              >小部分时间有（有时）</ElRadio
            >
            <ElRadio v-if="item.type == 'SDS量表'" label="C"
              >相当多时间有（经常）</ElRadio
            >
            <ElRadio v-if="item.type == 'SDS量表'" label="D"
              >绝大部分或全部时间有（持续）</ElRadio
            >
          </ElRadioGroup>
        </template>
        <template v-else>
          <ElRadioGroup :disabled="true">
            <ElRadio v-if="item.type == '心理调查评估问卷'" label="A"
              >从无</ElRadio
            >
            <ElRadio v-if="item.type == '心理调查评估问卷'" label="B"
              >轻度</ElRadio
            >
            <ElRadio v-if="item.type == '心理调查评估问卷'" label="C"
              >中度</ElRadio
            >
            <ElRadio v-if="item.type == '心理调查评估问卷'" label="D"
              >偏重</ElRadio
            >
            <ElRadio v-if="item.type == '心理调查评估问卷'" label="E"
              >严重</ElRadio
            >

            <ElRadio v-if="item.type == 'SAS量表'" label="A"
              >没有或很少时间有（偶尔）</ElRadio
            >
            <ElRadio v-if="item.type == 'SAS量表'" label="B"
              >小部分时间有（有时）</ElRadio
            >
            <ElRadio v-if="item.type == 'SAS量表'" label="C"
              >相当多时间有（经常）</ElRadio
            >
            <ElRadio v-if="item.type == 'SAS量表'" label="D"
              >绝大部分或全部时间有（持续）</ElRadio
            >

            <ElRadio v-if="item.type == 'SDS量表'" label="A"
              >没有或很少时间有（偶尔）</ElRadio
            >
            <ElRadio v-if="item.type == 'SDS量表'" label="B"
              >小部分时间有（有时）</ElRadio
            >
            <ElRadio v-if="item.type == 'SDS量表'" label="C"
              >相当多时间有（经常）</ElRadio
            >
            <ElRadio v-if="item.type == 'SDS量表'" label="D"
              >绝大部分或全部时间有（持续）</ElRadio
            >
          </ElRadioGroup>
        </template>
      </ElDescriptionsItem>
    </ElDescriptions>
    <!-- </ElCard> -->
  </VDialog>
</template>

<style scoped></style>
