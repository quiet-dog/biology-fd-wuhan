<script lang='ts' setup>
import { nextTick, watch } from 'vue';
import { useVideoHook } from './video';
import { useIntervalFn } from '@vueuse/core';

// const emit = defineEmits(['refreshKey'])
// const { channelPropId } = defineProps<{
//   channelPropId: string
// }>()


// const refreshKey = () => {
//   emit('refreshKey')
// }

// const timer= useIntervalFn(() => {
//     // 销毁 videoRef.value 恢复到原始
//     // refreshKey()
// }, 2000)
// timer.pause();

const {
  jessibuca,
    play,
    paused,
    destroy,
    create,
    videoRef,
  playUrl,
  channelId
  //  pause, isActive, resume
} = useVideoHook()

// watch(()=>channelPropId, (newVal) => {
//   channelId.value = newVal
// }, {
//   immediate: true
// })

const setChannelId = (id: string) => {
    console.log("改变setChannelId",id)
  channelId.value = id
}




defineExpose({
  play,
  destroy,
  create,
  setChannelId
})


</script>

<template>
  <div >
      <div style="margin: 0 auto;" id="container" ref="videoRef"></div>
  </div>
</template>

<style scoped>
#container {
  background: rgba(13, 14, 27, 0.7);
  width: 960px;
  height: 597px;
}
</style>
