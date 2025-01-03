import { http } from "@/utils/http";

//获取检修手册信息
export function inspectionManualInfo(manualId: number) {
  return http.request("get", `/manage/equipment-inspection-manual/${manualId}`);
}

//更新检修手册
export interface renewInspectionManualRes {
  equipmentId: string;
  manualVersion: string;
  manualCode: string;
  isEnabled: boolean;
  suitableScope: string;
  manualFilePath: string[];
  manualId: number;
}
export function renewInspectionManual(data: renewInspectionManualRes) {
  let { manualId, ...other } = data;
  return http.request(
    "put",
    `/manage/equipment-inspection-manual/${manualId}`,
    {
      data: other
    }
  );
}

//获取检修手册列表
export interface inspectionManualRes extends BasePageQuery {
  equipmentName: string;
  equipmentType: string;
}
export function inspectionManualList(params: inspectionManualRes) {
  return http.request("get", "/manage/equipment-inspection-manual", {
    params
  });
}

//添加检修手册
export interface addInspectionManualRes {
  equipmentId: string;
  manualVersion: string;
  manualCode: string;
  suitableScope: string;
  isEnabled: boolean;
  manualFilePath: string[];
}
export function addInspectionManual(data: addInspectionManualRes) {
  return http.request("post", "/manage/equipment-inspection-manual", { data });
}

//删除检修手册
export function deleteInspectionManual(manualIds: string[]) {
  return http.request("delete", "/manage/equipment-inspection-manual", {
    params: {
      manualIds: manualIds.join(",") // 将数组转换为逗号分隔的字符串
    }
  });
}
