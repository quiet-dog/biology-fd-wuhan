<script lang='ts' setup>
import { TokenDTO } from "@/api/common/login";
import { getResultShiJuan, resultShiJuanListByUser } from "@/api/resultShiJuan";
import TouXiang from "@/assets/touxiang.png";
import { CommonUtils } from "@/utils/common";
import { PaginationProps } from "@pureadmin/table";
import { storageSession } from "@pureadmin/utils";
import { Sort } from "element-plus";
import { onMounted, reactive, ref, toRaw } from "vue";
const userInfo = storageSession().getItem<TokenDTO>("user-info")?.currentUser.userInfo

const searchFormParams = reactive({
})
const defaultSort: Sort = {
  prop: "createTime",
  order: "descending"
};
const pagination: PaginationProps = {
  total: 0,
  pageSize: 9,
  currentPage: 1,
  background: true,
};
const pageLoading = ref(true);
const sortState = ref<Sort>(defaultSort);
const table = ref([])
async function resultShiJuanListByUserFunc() {
  pageLoading.value = true
  CommonUtils.fillSortParams(searchFormParams, sortState.value);
  CommonUtils.fillPaginationParams(searchFormParams, pagination);
  const { data } = await resultShiJuanListByUser(toRaw(searchFormParams)).finally(() => {
    pageLoading.value = false;
  });
  table.value = data.rows;
  pagination.total = data.total;
}

function loadMore() {

}

onMounted(() => {
  resultShiJuanListByUserFunc()
})

</script>

<template>
  <div class="main">
    <el-container>
      <el-header height="300px" class="change search-form bg-bg_color w-[99/100] pl-8 pt-[12px]">
        <div class="info">
          <div>
            <el-avatar size="large" :src="TouXiang" />
          </div>
          <div style="width: 400px;">
            <!-- @vue-ignore -->
            <el-descriptions :title="userInfo.nickname">
              <el-descriptions-item label="性别">{{ userInfo.sex === 0 ? '男' : "女" }}</el-descriptions-item>
              <el-descriptions-item label="部门">{{ userInfo.deptName }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
      </el-header>
      <el-main>
        <el-scrollbar @end-reached="loadMore" height="800px">
          <template v-for="(item, index) in table">
            <el-row :gutter="20" v-if="(index % 3) == 0">
              <template v-for="(info, infoIndex) in [0, 1, 2]" v-if="(index + 1) < table.length">
                <el-col :span="8">
                  <el-card>
                    <template #header>
                      <span>{{ table[infoIndex + index].type }}</span>
                    </template>
                    <el-descriptions :column="1">
                      <el-descriptions-item label="类型">
                        <el-tag>{{  table[infoIndex + index].type }}</el-tag>
                      </el-descriptions-item>
                      <el-descriptions-item label="数量">
                        <el-tag>90道</el-tag>
                      </el-descriptions-item>
                      <el-descriptions-item label="预计时间">
                        <el-tag>20分钟</el-tag>
                      </el-descriptions-item>
                    </el-descriptions>
                    <template #footer>
                      <el-button>开始测评</el-button>
                    </template>
                  </el-card>
                </el-col>
              </template>
            </el-row>
          </template>
        </el-scrollbar>
      </el-main>
    </el-container>
  </div>
</template>

<style scoped>
.change {
  display: flex;
  flex-direction: column;
  justify-content: center;
  /* 上下居中 */
}

.info {
  display: flex;
}
</style>
