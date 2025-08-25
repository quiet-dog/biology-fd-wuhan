<script setup lang="ts">
import "animate.css";
// 引入 src/components/ReIcon/src/offlineIcon.ts 文件中所有使用addIcon添加过的本地图标
import "@/components/ReIcon/src/offlineIcon";
import { setType } from "./types";
import { useLayout } from "./hooks/useLayout";
import { useResizeObserver } from "@vueuse/core";
import { useAppStoreHook } from "@/store/modules/app";
import { useSettingStoreHook } from "@/store/modules/settings";
import { deviceDetection, useDark, useGlobal } from "@pureadmin/utils";
import { useDataThemeChange } from "@/layout/hooks/useDataThemeChange";
import Vide from "@/assets/a.mp3";
import {
  h,
  ref,
  reactive,
  computed,
  onMounted,
  onBeforeMount,
  defineComponent
} from "vue";
import { ElMessageBox, ElNotification } from "element-plus";
import { Client } from "@stomp/stompjs";

import navbar from "./components/navbar.vue";
import tag from "./components/tag/index.vue";
import appMain from "./components/appMain.vue";
import setting from "./components/setting/index.vue";
import Vertical from "./components/sidebar/vertical.vue";
import Horizontal from "./components/sidebar/horizontal.vue";
import backTop from "@/assets/svg/back_top.svg?component";
import { isDebuggerStatement } from "typescript";
import { IconifyIconOffline } from "@/components/ReIcon";
import { AlarmClock } from "@element-plus/icons-vue";
import { iconifyIconOffline } from "@/components/ReIcon";

const appWrapperRef = ref();
const { isDark } = useDark();
const { layout } = useLayout();
const isMobile = deviceDetection();
const pureSetting = useSettingStoreHook();
const { $storage } = useGlobal<GlobalPropertiesApi>();

const set: setType = reactive({
  sidebar: computed(() => {
    return useAppStoreHook().sidebar;
  }),

  device: computed(() => {
    return useAppStoreHook().device;
  }),

  fixedHeader: computed(() => {
    return pureSetting.fixedHeader;
  }),

  classes: computed(() => {
    return {
      hideSidebar: !set.sidebar.opened,
      openSidebar: set.sidebar.opened,
      withoutAnimation: set.sidebar.withoutAnimation,
      mobile: set.device === "mobile"
    };
  }),

  hideTabs: computed(() => {
    return $storage?.configure.hideTabs;
  })
});

function setTheme(layoutModel: string) {
  window.document.body.setAttribute("layout", layoutModel);
  $storage.layout = {
    layout: `${layoutModel}`,
    theme: $storage.layout?.theme,
    darkMode: $storage.layout?.darkMode,
    sidebarStatus: $storage.layout?.sidebarStatus,
    epThemeColor: $storage.layout?.epThemeColor
  };
}

function toggle(device: string, bool: boolean) {
  useAppStoreHook().toggleDevice(device);
  useAppStoreHook().toggleSideBar(bool, "resize");
}

// 判断是否可自动关闭菜单栏
let isAutoCloseSidebar = true;

useResizeObserver(appWrapperRef, entries => {
  if (isMobile) return;
  const entry = entries[0];
  const { width } = entry.contentRect;
  width <= 760 ? setTheme("vertical") : setTheme(useAppStoreHook().layout);
  /** width app-wrapper类容器宽度
   * 0 < width <= 760 隐藏侧边栏
   * 760 < width <= 990 折叠侧边栏
   * width > 990 展开侧边栏
   */
  if (width > 0 && width <= 760) {
    toggle("mobile", false);
    isAutoCloseSidebar = true;
  } else if (width > 760 && width <= 990) {
    if (isAutoCloseSidebar) {
      toggle("desktop", false);
      isAutoCloseSidebar = false;
    }
  } else if (width > 990 && !set.sidebar.isClickCollapse) {
    toggle("desktop", true);
    isAutoCloseSidebar = true;
  } else {
    toggle("desktop", false);
    isAutoCloseSidebar = false;
  }
});

// WebSocket客户端配置
const stompClient = new Client({
  brokerURL: "/ws-api/ws"
  // process.env.NODE_ENV === "development"
  //   ? "ws://home.icepie.net:9020/ws"
  //   : "/ws-api/ws"
});
const audu = ref();
stompClient.onConnect = frame => {
  stompClient.subscribe("/topic/info", greeting => {
    console.log("greeting", JSON.parse(greeting.body));
    const data = JSON.parse(greeting.body);

    // 根据消息类型设置通知类型和颜色
    let iconColor = "";
    switch (data.content.type) {
      case "环境报警":
        // iconColor = "#FAAD14"; // 橙色
        iconColor = "#FF4D4F"; // 红色
        break;
      case "设备报警":
        iconColor = "#FF4D4F"; // 红色
        break;
      case "物料报警":
        iconColor = "#FADC19"; // 黄色
        break;
      case "工艺报警":
        iconColor = "#FAAD14"; // 橙色
        break;
      default:
        iconColor = "#1890FF"; // 蓝色
    }

    // 音频是否在播放

    if (audu.value.paused) {
      audu.value.play().catch(err => {
        console.log(err);
      });
    }

    ElNotification({
      title: data.content.type,
      message: data.content.description,
      customClass: "custom-notification",
      position: "bottom-right",
      icon: h(IconifyIconOffline, {
        icon: "alarmIcon",
        style: `color: ${iconColor};`
      })
    });
    navbarRef.value.getNotice();
  });

  stompClient.subscribe("/topic/ketisan", greeting => {
    const data = JSON.parse(greeting.body);
    let iconColor = "";
    switch (data.content.type) {
      case "sm_alarm": {
        iconColor = "#FF4D4F"; // 红色
      }
      default: {
        iconColor = "#1890FF"; // 蓝色
      }
    }
    if (audu.value.paused) {
      audu.value.play().catch(err => {
        console.log(err);
      });
    }
    ElNotification({
      title: data.content.type,
      message: data.content.description,
      customClass: "custom-notification",
      position: "bottom-right",
      icon: h(IconifyIconOffline, {
        icon: "alarmIcon",
        style: `color: ${iconColor};`
      })
    });
    navbarRef.value.getNotice();
  })
};

stompClient.onWebSocketError = error => {
  console.error("Broker reported error: " + error);
};

stompClient.onStompError = frame => {
  console.error("Broker reported error: " + frame.headers["message"]);
  console.error("Additional details: " + frame.body);
};


// 在现有的onMounted中添加WebSocket激活
onMounted(() => {
  if (isMobile) {
    toggle("mobile", false);
  }
  // 激活WebSocket连接
  stompClient.activate();
  // 是否已经用户同意播放
  // ElMessageBox.alert('是否允许播放报警音频', '提示', {
  //   // if you want to disable its autofocus
  //   // autofocus: false,
  //   confirmButtonText: 'OK',
  //   callback: (action) => {

  //   },
  // })
  // setTimeout(() => {
  //   audu.value.play().catch(err => {
  //     console.log(err);
  //   });
  // }, 5000); 
});

onBeforeMount(() => {
  useDataThemeChange().dataThemeChange();
});

const navbarRef = ref();
const layoutHeader = defineComponent({
  render() {
    return h(
      "div",
      {
        class: { "fixed-header": set.fixedHeader },
        style: [
          set.hideTabs && layout.value.includes("horizontal")
            ? isDark.value
              ? "box-shadow: 0 1px 4px #0d0d0d"
              : "box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08)"
            : ""
        ]
      },
      {
        default: () => [
          !pureSetting.hiddenSideBar &&
            (layout.value.includes("vertical") || layout.value.includes("mix"))
            ? h(navbar, {
              ref: navbarRef,
              ref_key: "navbarRef",
            })
            : null,
          !pureSetting.hiddenSideBar && layout.value.includes("horizontal")
            ? h(Horizontal)
            : null,
          h(tag)
        ]
      }
    );
  }
});
</script>

<template>
  <div ref="appWrapperRef" :class="['app-wrapper', set.classes]">
    <div v-show="set.device === 'mobile' &&
      set.sidebar.opened &&
      layout.includes('vertical')
      " class="app-mask" @click="useAppStoreHook().toggleSideBar()" />
    <Vertical v-show="!pureSetting.hiddenSideBar &&
      (layout.includes('vertical') || layout.includes('mix'))
      " />
    <div :class="[
      'main-container',
      pureSetting.hiddenSideBar ? 'main-hidden' : ''
    ]">
      <div v-if="set.fixedHeader">
        <layout-header />
        <!-- 主体内容 -->
        <app-main :fixed-header="set.fixedHeader" />
      </div>
      <el-scrollbar v-else>
        <el-backtop title="回到顶部" target=".main-container .el-scrollbar__wrap">
          <backTop />
        </el-backtop>
        <layout-header />
        <!-- 主体内容 -->
        <app-main :fixed-header="set.fixedHeader" />
      </el-scrollbar>
    </div>
    <!-- 系统设置 -->
    <!-- <setting /> -->
    <audio style="display: none;" controls ref="audu">
      <source :src="Vide" type="audio/mpeg" />
    </audio>
  </div>
</template>

<style lang="scss" scoped>
.app-wrapper {
  position: relative;
  width: 100%;
  height: 100%;

  &::after {
    display: table;
    clear: both;
    content: "";
  }

  &.mobile.openSidebar {
    position: fixed;
    top: 0;
  }
}

.app-mask {
  position: absolute;
  top: 0;
  z-index: 999;
  width: 100%;
  height: 100%;
  background: #000;
  opacity: 0.3;
}

.re-screen {
  margin-top: 12px;
}
</style>
