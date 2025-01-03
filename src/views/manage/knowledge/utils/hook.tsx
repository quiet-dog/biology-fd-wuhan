import {
  deleteKnowledgeApi,
  getKnowledgeListApi,
  getKnowledgeTypeApi,
  KnowledgeListCommand
} from "@/api/manage/knowledge";
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

  const searchFormParams = reactive<KnowledgeListCommand>({
    title: "",
    knowledgeType: null
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
      label: "文档类型",
      prop: "knowledgeType",
      cellRenderer: (row) => {
        if (row?.row?.knowledgeType == "技术文档") {
          return h(ElTag, {
            type: "warning",
          }, row?.row?.knowledgeType)
        }
        if (row?.row?.knowledgeType == "流程制度") {
          return h(ElTag, {
            type: "primary",
          }, row?.row?.knowledgeType)
        }
        if (row?.row?.knowledgeType == "案例分析") {
          return h(ElTag, {
            type: "success",
          }, row?.row?.knowledgeType)
        }
        if (row?.row?.knowledgeType == "培训资料") {
          return h(ElTag, {
            type: "danger",
          }, row?.row?.knowledgeType)
        }
        return h(ElTag, {
          type: "info",
        }, row?.row?.knowledgeType);
      }
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

  const knowledgeTypeList = ref([]);

  async function getKnowledgeList() {
    pageLoading.value = true;

    CommonUtils.fillSortParams(searchFormParams, sortState.value);
    CommonUtils.fillPaginationParams(searchFormParams, pagination);

    const { data } = await getKnowledgeListApi(toRaw(searchFormParams)).finally(
      () => {
        pageLoading.value = false;
      }
    );
    dataList.value = data.rows;

    console.log(dataList.value);

    pagination.total = data.total;
  }

  async function handleDelete(row) {
    await deleteKnowledgeApi([row.knowledgeId]).then(() => {
      message(`您删除了编号为${row.knowledgeId}的这条知识库数据`, {
        type: "success"
      });
      // 刷新列表
      getKnowledgeList();
    });
  }

  async function onSearch(tableRef) {
    getKnowledgeList();
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

  async function getKnowledgeType() {
    await getKnowledgeTypeApi().then(res => {
      knowledgeTypeList.value = res.data;
    });
  }

  onMounted(() => {
    getKnowledgeType();
    getKnowledgeList();
  });

  return {
    searchFormParams,
    pageLoading,
    pagination,
    sortState,
    dataList,
    getKnowledgeList,
    columns,
    defaultSort,
    handleDelete,
    onSearch,
    getKnowledgeType,
    knowledgeTypeList,
    timeRange,
    resetForm
  };
}
