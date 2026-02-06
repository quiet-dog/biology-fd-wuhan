<script lang="ts" setup>
import { resultShiJuanList } from "@/api/resultShiJuan";
import VDialog from "@/components/VDialog/VDialog.vue";
import dayjs from "dayjs";
import { ref } from "vue";
const visiable = ref(false);
const searchShuJu = ref({
  pageNum: 1,
  pageSize: 10,
  data: [],
  total: 0,
  userId: 0,
  isNotNull: ["score"]
});
const searchResult = ref({
  pageNum: 1,
  pageSize: 10,
  data: [],
  total: 0,
  userId: 0,
  isNeedLastTime: true,
  isNotNull: ["score", "gan_yu_time"]
});

function getShuJu() {
  resultShiJuanList({
    pageNum: searchShuJu.value.pageNum,
    pageSize: searchShuJu.value.pageSize,
    userId:
      searchShuJu.value.userId != 0 ? searchShuJu.value.userId : undefined,
    isNotNull: searchShuJu.value.isNotNull
  }).then(res => {
    // @ts-expect-error
    searchShuJu.value.data = res.data.rows;
    // @ts-expect-error
    searchShuJu.value.total = res.data.total;
  });
}

function getResult() {
  resultShiJuanList({
    pageNum: searchResult.value.pageNum,
    pageSize: searchResult.value.pageSize,
    userId:
      searchResult.value.userId != 0 ? searchShuJu.value.userId : undefined,
    isNeedLastTime: true,
    isNotNull: searchResult.value.isNotNull
  }).then(res => {
    // @ts-expect-error
    searchResult.value.data = res.data.rows;
    // @ts-expect-error
    searchResult.value.total = res.data.total;
  });
}

function handleOpen(userId: number) {
  searchShuJu.value.pageNum = 1;
  searchShuJu.value.userId = userId;
  searchResult.value.userId = userId;
  searchResult.value.pageNum = 1;
  getShuJu();
  getResult();
  visiable.value = true;
}

function cancel() {
  visiable.value = false;
}

defineExpose({
  handleOpen
});
</script>

<template>
  <VDialog @cancel="cancel" v-model="visiable" title="心理健康信息">
    <ElTabs>
      <ElTabPane label="心理测评数据">
        <ElTable :data="searchShuJu.data">
          <ElTableColumn label="测评编号" prop="resultId" />
          <ElTableColumn label="量表名称" prop="type" />
          <ElTableColumn label="最终得分" prop="score" />
          <ElTableColumn label="评估结果" prop="cePing" />
          <ElTableColumn label="评估时间" prop="lastTime">
            <template #default="{ row }">
              {{ dayjs(row.lastTime).format("YYYY-MM-DD") }}
            </template>
          </ElTableColumn>
        </ElTable>
        <el-pagination
          @current-change="getShuJu"
          v-model:page-size="searchShuJu.pageSize"
          v-model:current-page="searchShuJu.pageNum"
          layout="prev, pager, next,total"
          :total="searchShuJu.total"
        />
      </ElTabPane>
      <ElTabPane label="干预措施">
        <ElTable :data="searchResult.data">
          <ElTableColumn label="测评编号" prop="cePing" />
          <ElTableColumn label="干预方式" prop="ganYuFangShi" />
          <ElTableColumn label="干预时间" prop="ganYuTime">
            <template #default="{ row }">
              {{ dayjs(row.ganYuTime).format("YYYY-MM-DD") }}
            </template>
          </ElTableColumn>
          <ElTableColumn label="执行人员" prop="execUser" />
          <ElTableColumn label="跟踪结果" prop="ganYuResult" />
        </ElTable>
        <el-pagination
          @current-change="getResult"
          v-model:page-size="searchResult.pageSize"
          v-model:current-page="searchResult.pageNum"
          layout="prev, pager, next,total"
          :total="searchShuJu.total"
        />
      </ElTabPane>
    </ElTabs>
  </VDialog>
</template>

<style scoped></style>
