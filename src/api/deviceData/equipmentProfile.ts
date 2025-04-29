import { http } from "@/utils/http";

//获取设备档案信息
export function equipmentInfo(equipmentId: number) {
  return http.request("get", `/manage/equipment/${equipmentId}`);
}

//更新设备档案
export interface renewequipmentRes {
  equipmentCode: string;
  equipmentName: string;
  model: string;
  manufacturer: string;
  purchaseDate: string;
  installationLocation: string;
  usageStatus: string;
  equipmentId: string;
}
export function renewprocess(data: renewequipmentRes) {
  let { equipmentId, ...other } = data;
  return http.request("put", `/manage/equipment/${equipmentId}`, {
    data: other
  });
}

//获取设备档案列表
export interface equipmentListRes extends BasePageQuery {
  equipmentName?: string;
  manufacturer?: string;
  startPurchaseDate?: string;
  endPurchaseDate?: string;
  usageStatus?: string;
  equipmentType?: string;
}
export function equipmentList(params: equipmentListRes) {
  return http.request("get", "/manage/equipment", { params });
}

//下载导入模板
export function downloadTemplate() {
  return http.request(
    "get",
    "/manage/equipment/template",
    {},
    {
      responseType: "blob"
    }
  );
}

//添加设备档案
export interface addequipmentRes {
  code: string;
  title: string;
  version: string;
  deptId: number;
  scope: string;
  riskType: string;
  paths: string[];
  keywordIds: number[];
}
export function addequipment(data: addequipmentRes) {
  return http.request("post", "/manage/equipment", { data });
}

//删除设备档案
export function deleteequipment(equipmentIds: string[]) {
  return http.request("delete", "/manage/equipment", {
    params: {
      equipmentIds: equipmentIds.join(",") // 将数组转换为逗号分隔的字符串
    }
  });
}
