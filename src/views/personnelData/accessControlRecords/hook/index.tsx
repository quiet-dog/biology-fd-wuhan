import { DoorEventQuery, getDoorEventList } from "@/api/door/door";
import { CommonUtils } from "@/utils/common";
import { PaginationProps } from "@pureadmin/table";
import dayjs from "dayjs";
import { ElTag, Sort } from "element-plus";
import { onMounted, reactive, ref, toRaw } from "vue";

export function useDoorHook() {

  const pagination: PaginationProps = {
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  };

  const table = ref([])
  const pageLoading = ref(false)
  const form: DoorEventQuery = reactive({
    outId: "",
    doorPlace: "",
    name: "",
  })
  const columns: TableColumnList = [
    {
      label: "编号",
      prop: "doorId",
      // width: 90,
      // fixed: "left"
    },
    {
      label: "门禁设备编号",
      prop: "outId",
      // width: 200,
      // fixed: "left"
    },
    {
      label: "门禁地点",
      prop: "doorPlace",
      // width: 200,
    },
    {
      label: "员工姓名",
      prop: "name",
      // width: 200,
    },
    {
      label: "刷卡时间",
      prop: "doorDate",
      cellRenderer: ({ row, props }) => (
        <span size={props.size} type="info">
          {dayjs.unix(row.doorDate).format('YYYY-MM-DD HH:mm:ss')}
        </span>
      ),
      width: 200
    },
    {
      label: "进入状态",
      prop: "enterStatus",
      cellRenderer: ({ row, props }) => (
        <span size={props.size} type="info">
          {row.enterStatus === '通行' ? <ElTag type="primary">{row.enterStatus}</ElTag> : <ElTag type="danger">{row.enterStatus}</ElTag>}
        </span>
      ),
    }

  ];

  const onSearch = (tableRef) => {
    pageLoading.value = true;
    getDoorEventList(toRaw(form)).then(res => {
      table.value = res.data.rows
      pagination.total = res.data.total;
    }).catch(err => { }).finally(() => {
      pageLoading.value = false
    })
  }


  const defaultSort: Sort = {
    prop: "createTime",
    order: "descending"
  };
  const sortState = ref<Sort>(defaultSort);
  const getDoorList = () => {
    pageLoading.value = true;
    // CommonUtils.fillPaginationParams(form, pagination);
    CommonUtils.fillSortParams(form, sortState.value);
    CommonUtils.fillPaginationParams(form, pagination);
    getDoorEventList(form).then(res => {
      table.value = res.data.rows
      pagination.total = res.data.total;
    }).catch(err => {

    }).finally(() => {
      pageLoading.value = false
    })
  }


  function resetForm(formEl, tableRef) {
    if (!formEl) return;
    // 清空查询参数
    formEl.resetFields();
    // 清空时间查询  TODO  这块有点繁琐  有可以优化的地方吗？
    // Form组件的resetFields方法无法清除datepicker里面的数据。
    form.beginTime = undefined;
    form.endTime = undefined;
    form.outId = ""
    form.doorPlace = ""
    form.name = ""
    // 重置分页并查询
    onSearch(tableRef);
  }

  onMounted(() => {
    getDoorList()
  })

  return {
    table,
    form,
    columns,
    pageLoading,
    pagination,
    getDoorList,
    onSearch,
    resetForm
  }
}