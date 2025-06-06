<script setup lang="ts">
import Search from "./search/index.vue";
import Notice from "./notice/index.vue";
import mixNav from "./sidebar/mixNav.vue";
import { useNav } from "@/layout/hooks/useNav";
import Breadcrumb from "./sidebar/breadCrumb.vue";
import topCollapse from "./sidebar/topCollapse.vue";
import LogoutCircleRLine from "@iconify-icons/ri/logout-circle-r-line";
import Setting from "@iconify-icons/ri/settings-3-line";
import User from "@iconify-icons/ep/user";

import { onMounted, reactive, ref } from "vue";
import UserAvatar from "@/views/system/user/profile/userAvatar.vue";

const {
  layout,
  device,
  logout,
  userProfile,
  onPanel,
  pureApp,
  username,
  currentUserInfo,
  userAvatar,
  avatarsStyle,
  toggleSideBar
} = useNav();
const noticeRef = ref();
const getNotice = () => {
  noticeRef.value.getNotice();
};
defineExpose({
  getNotice
});
</script>

<template>
  <div
    class="navbar bg-[#fff] shadow-sm shadow-[rgba(0, 21, 41, 0.08)] dark:shadow-[#0d0d0d]"
  >
    <topCollapse
      v-if="device === 'mobile'"
      class="hamburger-container"
      :is-active="pureApp.sidebar.opened"
      @toggleClick="toggleSideBar"
    />

    <Breadcrumb
      v-if="layout !== 'mix' && device !== 'mobile'"
      class="breadcrumb-container"
    />

    <mixNav v-if="layout === 'mix'" />

    <div v-if="layout === 'vertical'" class="vertical-header-right">
      <!-- 菜单搜索 -->
      <!-- <Search /> -->
      <!-- 通知 -->
      <Notice ref="noticeRef" id="header-notice" />
      <!-- 退出登录 -->
      <el-dropdown trigger="click">
        <span
          class="el-dropdown-link navbar-bg-hover select-none flex items-center px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
        >
          <!-- <img :src="userAvatar" :style="avatarsStyle" /> -->
          <!-- <el-icon :size="20">
            <User />
          </el-icon> -->

          <div v-if="username" style="font-size: 18px">
            <span class="dropdown-badge navbar-bg-hover select-none">
              <IconifyIconOffline :icon="User" />
            </span>
            <!-- {{ username }} -->
          </div>
        </span>
        <template #dropdown>
          <div class="w-[200px]">
            <el-dropdown-menu class="!p-2">
              <div
                class="!px-4 !py-2 text-center border-b border-[#eee] text-lg text-gray-500"
              >
                {{
                  currentUserInfo.username ? currentUserInfo.username : username
                }}
                <div class="mt-1" v-if="currentUserInfo.roleName">
                  <el-tag>{{ currentUserInfo.roleName }}</el-tag>
                </div>
              </div>

              <el-dropdown-item
                @click="userProfile"
                class="!flex !items-center !px-4 !py-2 hover:!bg-[#f5f5f5]"
              >
                <IconifyIconOffline
                  :icon="LogoutCircleRLine"
                  class="mr-2 text-lg"
                />
                <span>个人中心</span>
              </el-dropdown-item>
              <el-dropdown-item
                @click="logout"
                class="!flex !items-center !px-4 !py-2 hover:!bg-[#f5f5f5]"
              >
                <IconifyIconOffline
                  :icon="LogoutCircleRLine"
                  class="mr-2 text-lg"
                />
                <span>退出系统</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </div>
        </template>
      </el-dropdown>
      <!-- <span
        class="set-icon navbar-bg-hover"
        title="打开项目配置"
        @click="onPanel"
      >
        <IconifyIconOffline :icon="Setting" />
      </span> -->
    </div>
  </div>
</template>

<style lang="scss" scoped>
.navbar {
  width: 100%;
  height: 48px;
  overflow: hidden;

  .hamburger-container {
    float: left;
    height: 100%;
    line-height: 48px;
    cursor: pointer;
  }

  .vertical-header-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    min-width: 280px;
    height: 48px;
    color: #000000d9;

    .el-dropdown-link {
      display: flex;
      align-items: center;
      justify-content: space-around;
      height: 48px;
      padding: 10px;
      color: #000000d9;
      cursor: pointer;

      p {
        font-size: 14px;
      }

      img {
        width: 22px;
        height: 22px;
        border-radius: 50%;
      }
    }
  }

  .breadcrumb-container {
    float: left;
    margin-left: 16px;
  }
}

.logout {
  max-width: 120px;

  ::v-deep(.el-dropdown-menu__item) {
    display: inline-flex;
    flex-wrap: wrap;
    min-width: 100%;
  }
}
</style>
