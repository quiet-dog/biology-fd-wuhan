import { http } from "@/utils/http";

//获取维修手册信息
export function MaintenanceManualInfo(manualId: number) {
  return http.request(
    "get",
    `/manage/equipment-maintenance-manual/${manualId}`
  );
}

//更新维修手册
export interface renewMaintenanceManualRes {
  equipmentId: string;
  manualVersion: string;
  manualCode: string;
  isEnabled: boolean;
  manualFilePath: string[];
  manualId: number;
}
export function renewMaintenanceManual(data: renewMaintenanceManualRes) {
  let { manualId, ...other } = data;
  return http.request(
    "put",
    `/manage/equipment-maintenance-manual/${manualId}`,
    {
      data: other
    }
  );
}

//获取维修手册列表
export interface maintenanceManualRes extends BasePageQuery {
  equipmentName: string;
  equipmentType: string;
}
export function maintenanceManualList(params: maintenanceManualRes) {
  return http.request("get", "/manage/equipment-maintenance-manual", {
    params
  });
}

//添加维修手册
export interface addMaintenanceManualRes {
  equipmentId: number;
  manualVersion: string;
  manualCode: string;
  isEnabled: boolean;
  manualFilePath: string[];
}
export function addMaintenanceManual(data: addMaintenanceManualRes) {
  return http.request("post", "/manage/equipment-maintenance-manual", { data });
}

//删除维修手册
export function deleteMaintenanceManual(manualIds: string[]) {
  return http.request("delete", "/manage/equipment-maintenance-manual", {
    params: {
      manualIds: manualIds.join(",") // 将数组转换为逗号分隔的字符串
    }
  });
}
