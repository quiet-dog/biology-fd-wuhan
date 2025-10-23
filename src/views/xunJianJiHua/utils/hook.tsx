import {
  deleteXunJianApi,
  getXunJianListApi,
  getXunJianTypeApi,
  XunJianListCommand
} from "@/api/manage/xunJian";
import { CommonUtils } from "@/utils/common";
import { message } from "@/utils/message";
import { PaginationProps } from "@pureadmin/table";
import { ElTag, Sort } from "element-plus";
import { computed, h, onMounted, reactive, ref, toRaw } from "vue";

export function useHook() {
  const defaultSort: Sort = {
    prop: "createTime",
    order: "descending"
  };

  const searchFormParams = reactive<XunJianListCommand>({
    title: "",
    xunJianType: null
  });

  const timeRange = computed<[string, string] | null>({
    get() {
      if (searchFormParams.beginTime && searchFormParams.endTime) {
        return [searchFormParams.beginTime, searchFormParams.endTime];
      } else {
        return null;
      }
    },
    set(v) {
      if (v?.length === 2) {
        searchFormParams.beginTime = v[0];
        searchFormParams.endTime = v[1];
      } else {
        searchFormParams.beginTime = undefined;
        searchFormParams.endTime = undefined;
      }
    }
  });

  const pageLoading = ref(true);

  const pagination: PaginationProps = {
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  };

  const sortState = ref<Sort>(defaultSort);

  const dataList = ref([]);

  const columns: TableColumnList = [
    {
      label: "文档编号",
      prop: "code"
    },
    {
      label: "文档标题",
      prop: "title"
    },
    {
      label: "类型",
      prop: "xunJianType",
    },
    // {
    //   label: "创建者",
    //   prop: "createrName"
    // },
    {
      label: "创建时间",
      prop: "createTime",
      slot: "createTime"
    },
    {
      label: "更新日期",
      prop: "updateTime",
      slot: "updateTime"
    },
    {
      label: "操作",
      fixed: "right",
      width: 200,
      slot: "operation"
    }
  ];

  const xunJianTypeList = ref([]);

  async function getXunJianList() {
    pageLoading.value = true;

    CommonUtils.fillSortParams(searchFormParams, sortState.value);
    CommonUtils.fillPaginationParams(searchFormParams, pagination);

    const { data } = await getXunJianListApi(toRaw(searchFormParams)).finally(
      () => {
        pageLoading.value = false;
      }
    );
    dataList.value = data.rows;

    console.log(dataList.value);

    pagination.total = data.total;
  }

  async function handleDelete(row) {
    await deleteXunJianApi([row.xunJianId]).then(() => {
      message(`您删除了编号为${row.xunJianId}的这条知识库数据`, {
        type: "success"
      });
      // 刷新列表
      getXunJianList();
    });
  }

  async function onSearch(tableRef) {
    getXunJianList();
    // 点击搜索的时候，需要重置排序，重新排序的时候会重置分页并发起查询请求
    tableRef.getTableRef().sort("createTime", "descending");
  }

  function resetForm(formEl, tableRef) {
    if (!formEl) return;
    // 清空查询参数
    formEl.resetFields();
    // 清空时间查询  TODO  这块有点繁琐  有可以优化的地方吗？
    // Form组件的resetFields方法无法清除datepicker里面的数据。
    searchFormParams.beginTime = undefined;
    searchFormParams.endTime = undefined;
    // 重置分页并查询
    onSearch(tableRef);
  }

  // async function getXunJianType() {
  //   await getXunJianTypeApi().then(res => {
  //     xunJianTypeList.value = res.data;
  //   });
  // }

  onMounted(() => {
    // getXunJianType();
    getXunJianList();
  });

  return {
    searchFormParams,
    pageLoading,
    pagination,
    sortState,
    dataList,
    getXunJianList,
    columns,
    defaultSort,
    handleDelete,
    onSearch,
    // getXunJianType,
    xunJianTypeList,
    timeRange,
    resetForm
  };
}
