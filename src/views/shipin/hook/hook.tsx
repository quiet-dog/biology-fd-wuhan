import { onMounted, reactive, ref, toRaw } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { ChannelQuery, getChannelListApi } from "@/api/video";
import { PaginationProps } from "@pureadmin/table";


type filter = {
  field_name: string;
  opertator: string;
  value: string;
}

export function useVideoHook() {
  const form = reactive<ChannelQuery>({
    sort: "",
    name: ""
  });
  const formEl = ref()
  const playUrl = ref("")

  const columns: TableColumnList = [
    {
      label: "名称",
      prop: "name",
      minWidth: 100
    },
    {
      label: "厂家",
      prop: "manufacturer",
      minWidth: 120
    },
    {
      label: "型号",
      prop: "model",
      minWidth: 150
    },
    {
      label: "状态",
      prop: "status",
      minWidth: 150
    },
    {
      label: "操作",
      fixed: "right",
      width: 140,
      slot: "operation"
    }
  ];

  const loading = ref(false);
  const dataList = ref([]);
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });
  const dialogOb = ref({
    visible: false,
    title: "",
  })

  async function onSearch() {
    try {
      loading.value = true;
      // const { data } = await getRoleListApi(toRaw(form));
      const { data } = await getChannelListApi(toRaw(form));
      dataList.value = data.List;
      pagination.total = data.Total;
    } catch (e) {
      console.error(e);
      ElMessage.error((e as Error)?.message || "加载失败");
    } finally {
      loading.value = false;
    }
  }

  async function handlePageChange() {
    form.pageSize = pagination.pageSize;
    form.pageNum = pagination.currentPage;
    onSearch();
  }



  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  };

  onMounted(onSearch)

  return {
    form,
    loading,
    onSearch,
    resetForm,
    pagination,
    columns,
    dataList,
    handlePageChange,
    dialogOb,
    playUrl
  }
}