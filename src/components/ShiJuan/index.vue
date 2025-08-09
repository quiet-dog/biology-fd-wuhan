<script lang='ts' setup>
import { computed, ref } from 'vue';
import VDialog from '../VDialog/VDialog.vue';
import { getResultShiJuan, getShiJuan, setResultShiJuan } from '@/api/resultShiJuan';
import { ElMessage, Sort } from 'element-plus';
import { SetResult } from '@/api/resultShiJuan/types';
import { useIntervalFn } from '@vueuse/core';
import dayjs from "dayjs";
import durationPlus from 'dayjs/plugin/duration';

dayjs.extend(durationPlus);
const visible = ref(false)
const info = ref()
const data = ref([])
const defaultSort: Sort = {
  prop: "createTime",
  order: "descending"
};

const duration = ref(1200)
const disabale = ref(false)
const title = ref("测评")
const dTimer = useIntervalFn(() => {
  if (duration.value === 0) {
    disabale.value = true
    dTimer.pause()
    return
  }
  title.value = dayjs.duration(duration.value, 'seconds').format("HH:mm:ss")
  duration.value--
}, 1000)
const formatTime = computed(() => {
  return dayjs.duration(duration.value, 'seconds').format('HH:mm:ss')
})


const emit = defineEmits(['success'])

function cancelConfirm() {
  if (duration.value != 0) {
    ElMessage.warning("未完成，无法关闭!")
    visible.value = true;
    return
  }
  visible.value = false;
}

function beforeClose() {
  if (duration.value != 0) {
    ElMessage.warning("未完成，无法关闭!")
    visible.value = true;
    return false;
  }
  return true
}

function handleOpen(resultId: number) {
  duration.value = 1200
  getResultShiJuan(resultId).then(res => {
    // @ts-expect-error
    info.value = res.data

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
    })
  })
  visible.value = true
}

function handleConfirem() {
  let isSuccess = false
  data.value.some(item => {
    if (item.select == undefined) {
      ElMessage.warning("还有未完成的测题!")
      isSuccess = true
      return true
    }
    return false
  })

  if (isSuccess) {
    return
  }

  dTimer.pause()
  let result: SetResult = {
    resultId: info.value.resultId,
    result: [],
    useTime: 1200 - duration.value
  }
  let list = []
  data.value.forEach(item => {
    list.push({
      xlShiJuanId: item.xlShiJuanId,
      result: item.select
    })
  })
  result.result = list
  setResultShiJuan(result).then(res => {
    ElMessage.success("提交成功")
    visible.value = false
    emit("success")
  })
}

defineExpose({
  handleOpen
})


</script>

<template>
  <VDialog :before-close="beforeClose" @cancel="cancelConfirm" @confirm="handleConfirem" use-body-scrolling
    :title="title" v-model="visible">


    <!-- <ElCard> -->
    <ElDescriptions v-for="(item, index) in data" :title="`${index}、${item.name}`">
      <ElDescriptionsItem>
        <ElRadioGroup @change="changeRadio" :disabled="disabale" v-model="item['select']">
          <ElRadio v-if="item.type == '心理调查评估问卷'" label="A">从无</ElRadio>
          <ElRadio v-if="item.type == '心理调查评估问卷'" label="B">轻度</ElRadio>
          <ElRadio v-if="item.type == '心理调查评估问卷'" label="C">中度</ElRadio>
          <ElRadio v-if="item.type == '心理调查评估问卷'" label="D">偏重</ElRadio>
          <ElRadio v-if="item.type == '心理调查评估问卷'" label="E">严重</ElRadio>

          <ElRadio v-if="item.type == 'SAS量表'" label="A">没有或很少时间有（偶尔）</ElRadio>
          <ElRadio v-if="item.type == 'SAS量表'" label="B">小部分时间有（有时）</ElRadio>
          <ElRadio v-if="item.type == 'SAS量表'" label="C">相当多时间有（经常）</ElRadio>
          <ElRadio v-if="item.type == 'SAS量表'" label="D">绝大部分或全部时间有（持续）</ElRadio>

          <ElRadio v-if="item.type == 'SDS量表'" label="A">没有或很少时间有（偶尔）</ElRadio>
          <ElRadio v-if="item.type == 'SDS量表'" label="B">小部分时间有（有时）</ElRadio>
          <ElRadio v-if="item.type == 'SDS量表'" label="C">相当多时间有（经常）</ElRadio>
          <ElRadio v-if="item.type == 'SDS量表'" label="D">绝大部分或全部时间有（持续）</ElRadio>
        </ElRadioGroup>
      </ElDescriptionsItem>
    </ElDescriptions>
    <!-- </ElCard> -->

  </VDialog>
</template>

<style scoped></style>
