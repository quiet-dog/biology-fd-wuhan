import { http } from "@/utils/http";

//获取检修记录信息
export function inspectionInfo(recordId: number) {
  return http.request("get", `/manage/equipment-inspection/${recordId}`);
}

//更新检修记录
export interface renewinspectionRes {
  equipmentId: string;
  inspectionCode: string;
  inspectionDate: string;
  inspectionContent: string;
  inspector: string;
  faultReason: string;
  inspectionImagePath: string[];
  inspectionReportPath: string[];
  recordId: number;
}
export function renewinspection(data: renewinspectionRes) {
  let { recordId, ...other } = data;
  return http.request("put", `/manage/equipment-inspection/${recordId}`, {
    data: other
  });
}

//获取检修记录列表
export interface inspectionRes extends BasePageQuery {
  equipmentCode: string;
  inspector: string;
  startInspectionDate: string;
  endInspectionDate: string;
}
export function inspectionList(params: inspectionRes) {
  return http.request("get", "/manage/equipment-inspection", { params });
}

//添加检修记录
export interface addInspectionRes {
  equipmentId: number;
  inspectionCode: string;
  inspectionDate: string;
  inspectionContent: string;
  inspector: string;
  faultReason: string;
  inspectionImagePath: string[];
  inspectionReportPath: string[];
}
export function addInspection(data: addInspectionRes) {
  return http.request("post", "/manage/equipment-inspection", { data });
}

//删除检修记录
export function deleteInspection(recordIds: string[]) {
  return http.request("delete", "/manage/equipment-inspection", {
    params: {
      recordIds: recordIds.join(",") // 将数组转换为逗号分隔的字符串
    }
  });
}

//下载导入模板
export function downloadTemplate() {
  return http.request(
    "get",
    "/manage/equipment-inspection/excelTemplate",
    {},
    {
      responseType: "blob"
    }
  );
}
