import { http } from "@/utils/http";

//获取维修记录信息
export function equipmentRepairInfo(recordId: number) {
  return http.request("get", `/manage/equipment-repair/${recordId}`);
}

//更新维修记录
export interface equipmentRepairRes {
  equipmentId: string;
  repairCode: string;
  repairDate: string;
  faultReason: string;
  repairPersonnel: string;
  repairCost: number;
  repairResult: string;
  repairImagePath: string[];
  recordId: number;
}
export function renewEquipmentRepair(data: equipmentRepairRes) {
  let { recordId, ...other } = data;
  return http.request("put", `/manage/equipment-repair/${recordId}`, {
    data: other
  });
}

//获取维修记录列表
export interface equipmentRepairListRes extends BasePageQuery {
  equipmentCode: string;
  repairPersonnel: string;
  startRepairDate: string;
  endRepairDate: string;
}
export function equipmentRepairList(params: equipmentRepairListRes) {
  return http.request("get", "/manage/equipment-repair", { params });
}

//添加维修记录
export interface addequipmentRepairRes {
  equipmentId: string;
  repairCode: string;
  repairDate: string;
  repairContent: string;
  faultReason: string;
  repairPersonnel: string;
  repairCost: string;
  repairResult: string;
  repairImagePath: string[];
}
export function addEquipmentRepair(data: addequipmentRepairRes) {
  return http.request("post", "/manage/equipment-repair", { data });
}

//删除维修记录
export function deleteEquipmentRepair(recordIds: string[]) {
  return http.request("delete", "/manage/equipment-repair", {
    params: {
      recordIds: recordIds.join(",") // 将数组转换为逗号分隔的字符串
    }
  });
}

//下载导入模板
export function downloadTemplate() {
  return http.request(
    "get",
    "/manage/equipment-repair/excelTemplate",
    {},
    {
      responseType: "blob"
    }
  );
}
