<script setup lang="ts">
import { onMounted, ref } from "vue";
// import { noticesData } from "./data";
import NoticeList from "./noticeList.vue";
import Bell from "@iconify-icons/ep/bell";
import {
  notificationInfo,
  notificationList,
  notificationListRes
} from "@/api/notificationCenter";
import { PaginationProps } from "@pureadmin/table";
import { CommonUtils } from "@/utils/common";
const noticesNum = ref(0);
import { Sort } from "element-plus";
import { useUserStore } from "@/store/modules/user";

// 添加类型定义
interface NoticeItem {
  key: string;
  title: string;
  description: string;
  type: string;
  datetime: string;
}

interface NoticeGroup {
  key: string;
  name: string;
  list: NoticeItem[];
}

// 修改notices的类型定义
const notices = ref<NoticeGroup[]>([
  {
    key: "1",
    name: "系统通知",
    list: []
  },
  {
    key: "2",
    name: "个人通知",
    list: []
  }
]);

const activeKey = ref("1");

const pagination: PaginationProps = {
  total: 0,
  pageSize: 1000,
  currentPage: 1,
  background: true
};

const defaultSort: Sort = {
  prop: "createTime",
  order: "ascending"
};

const sortState = ref<Sort>(defaultSort);

// 添加系统和个人通知数量的引用
const sysNoticesNum = ref(0);
const personalNoticesNum = ref(0);

// 添加未读消息数量的引用
const unreadSysNoticesNum = ref(0);
const unreadPersonalNoticesNum = ref(0);

const getNotices = async () => {
  try {
    // 获取系统通知
    const sysRes = await notificationList({
      notificationTitle: "",
      notificationType: "",
      orderColumn: "createTime",
      orderDirection: "descending",
      pageNum: 1,
      pageSize: 1000,
      isPersonal: false // 系统通知
    });

    // 获取个人通知
    const personalRes = await notificationList({
      notificationTitle: "",
      notificationType: "",
      orderColumn: "createTime",
      orderDirection: "descending",
      pageNum: 1,
      pageSize: 1000,
      isPersonal: true // 个人通知
    });

    const sysData = sysRes.data;
    const personalData = personalRes.data;

    // 分别计算系统和个人未读消息数量
    unreadSysNoticesNum.value = sysData.rows.filter(
      v => v.readStatus === 0
    ).length;
    unreadPersonalNoticesNum.value = personalData.rows.filter(
      v => v.readStatus === 0
    ).length;

    // 总未读消息数量
    noticesNum.value =
      unreadSysNoticesNum.value + unreadPersonalNoticesNum.value;

    // 更新通知数量
    useUserStore().SET_NOTICES_NUM(noticesNum.value);

    // 转换系统通知数据
    notices.value[0].list = sysData.rows.map(v => ({
      key: v.notificationId,
      title: v.notificationTitle,
      description: v.notificationContent,
      type: v.notificationType,
      datetime: v.sendTime,
      readStatus: v.readStatus
    }));

    // 转换个人通知数据
    notices.value[1].list = personalData.rows.map(v => ({
      key: v.notificationId,
      title: v.notificationTitle,
      description: v.notificationContent,
      type: v.notificationType,
      datetime: v.sendTime,
      readStatus: v.readStatus
    }));

    // 更新分页总数
    pagination.total = sysData.total + personalData.total;
  } catch (error) {
    console.error("获取通知列表失败:", error);
  }
};

onMounted(async () => {
  await getNotices();
  console.log("notices", notices);
});

//read 事件
const handleRead = async (key: number) => {
  await notificationInfo(key);
  await getNotices();
};
</script>

<template>
  <el-dropdown trigger="click" placement="bottom-end">
    <span class="dropdown-badge navbar-bg-hover select-none">
      <el-badge :value="noticesNum" :max="99">
        <span class="header-notice-icon">
          <IconifyIconOffline :icon="Bell" />
        </span>
      </el-badge>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-tabs
          :stretch="true"
          v-model="activeKey"
          class="dropdown-tabs"
          :style="{ width: notices.length === 0 ? '200px' : '330px' }"
        >
          <el-empty
            v-if="notices?.length === 0"
            description="暂无消息"
            :image-size="60"
          />
          <span v-else>
            <template v-for="item in notices" :key="item.key">
              <el-tab-pane
                :label="`${item.name}(${
                  item.key === '1'
                    ? unreadSysNoticesNum
                    : unreadPersonalNoticesNum
                })`"
                :name="`${item.key}`"
              >
                <el-scrollbar max-height="330px">
                  <div class="noticeList-container">
                    <NoticeList :list="item.list" @read="handleRead" />
                  </div>
                </el-scrollbar>
              </el-tab-pane>
            </template>
          </span>
        </el-tabs>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<style lang="scss" scoped>
.dropdown-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 48px;
  margin-right: 10px;
  cursor: pointer;

  .header-notice-icon {
    font-size: 18px;
  }
}

.dropdown-tabs {
  .noticeList-container {
    padding: 15px 24px 0;
  }

  :deep(.el-tabs__header) {
    margin: 0;
  }

  :deep(.el-tabs__nav-wrap)::after {
    height: 1px;
  }

  :deep(.el-tabs__nav-wrap) {
    padding: 0 36px;
  }
}
</style>
