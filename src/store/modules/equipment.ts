import { defineStore } from "pinia";
import { ref } from "vue";
import { equipmentList } from '../../api/deviceData/equipmentProfile';

export const useEquipmentStore = defineStore("equipemnt", () => {
  const list = ref([])
  const getEquipmentList = () => {
    equipmentList({
      pageNum: 1,
      pageSize: 500
    }).then(res => {
      list.value = res.rows
      console.log("list.value", list.value)
    })
  }
  getEquipmentList()
  return {
    list
  }
})