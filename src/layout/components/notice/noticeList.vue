<script setup lang="ts">
import { PropType } from "vue";
import { ListItem } from "./data";
import NoticeItem from "./noticeItem.vue";

const props = defineProps({
  list: {
    type: Array as PropType<Array<ListItem>>,
    default: () => []
  }
});
</script>

<template>
  <div v-for="item in list" :key="item.key" class="notice-item">
    <div class="notice-content">
      <div class="notice-title">{{ item.title }}</div>
      <div class="notice-desc">{{ item.description }}</div>
      <div class="notice-time">{{ item.datetime }}</div>
    </div>
    <div class="notice-action">
      <el-button
        v-if="item.readStatus === 0"
        type="primary"
        link
        size="small"
        @click="$emit('read', item.key)"
      >
        标记已读
      </el-button>
      <span v-else class="read-status">已读</span>
    </div>
  </div>

</template>

<style lang="scss" scoped>
.notice-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 10px 0;
  border-bottom: 1px solid #eee;

  .notice-content {
    flex: 1;
    margin-right: 10px;
  }

  .notice-title {
    font-weight: bold;
    margin-bottom: 5px;
  }

  .notice-desc {
    color: #666;
    margin-bottom: 5px;
  }

  .notice-time {
    font-size: 12px;
    color: #999;
  }

  .notice-action {
    min-width: 60px;
    text-align: right;
  }

  .read-status {
    font-size: 12px;
    color: #999;
  }
}
</style>
