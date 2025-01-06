import { http } from "@/utils/http";

//获取日常巡检记录信息
export function dailyInspectionInfo(recordId: number) {
  return http.request("get", `/manage/equipment-daily-inspection/${recordId}`);
}

//更新日常巡检记录
export interface renewDailyInspectionRes {
  inspectionDate: string;
  inspectionCode: string;
  taskDescription: string;
  inspector: string;
  anomalyCount: number;
  anomalyDescription: string;
  inspectionImagePath: string[];
  recordId: number;
}
export function renewDailyInspection(data: renewDailyInspectionRes) {
  let { recordId, ...other } = data;
  return http.request("put", `/manage/equipment-daily-inspection/${recordId}`, {
    data: other
  });
}

//获取日常巡检记录列表
export interface dailyInspectionRes extends BasePageQuery {
  recordId: string;
  startDate: string;
  endDate: string;
}
export function dailyInspectionList(params: dailyInspectionRes) {
  return http.request("get", "/manage/equipment-daily-inspection", {
    params
  });
}

//添加日常巡检记录
export interface addDailyInspectionRes {
  inspectionDate: string;
  inspectionCode: string;
  taskDescription: string;
  inspector: string;
  anomalyCount: number;
  anomalyDescription: string;
  inspectionImagePath: string[];
  inspectorIds: number[];
}
export function addDailyInspection(data: addDailyInspectionRes) {
  return http.request("post", "/manage/equipment-daily-inspection", { data });
}

//删除日常巡检记录
export function deleteDailyInspection(recordIds: string[]) {
  return http.request("delete", "/manage/equipment-daily-inspection", {
    params: {
      recordIds: recordIds.join(",") // 将数组转换为逗号分隔的字符串
    }
  });
}
