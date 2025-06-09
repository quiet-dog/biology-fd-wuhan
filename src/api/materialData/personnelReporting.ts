import { http } from "@/utils/http";

//获取人员上报列表
export interface reportListRes extends BasePageQuery {
  reporterName: string;
  reportType: string;
  materialsName?: string;
}
export function reportList(params: reportListRes) {
  return http.request("get", "/manage/report", { params });
}

//添加人员上报
export interface addreportRes {
  code: string;
  materialsCode: string;
  reportType: string;
  reportNum: number;
  reportReason: string;
  paths: string[];
  materialsId: number;
}
export function addreport(data: addreportRes) {
  return http.request("post", "/manage/report", { data });
}

//获取人员上报信息
export function reportInfo(reportId: number) {
  return http.request("get", `/manage/report/${reportId}`);
}

export function getstatistics(params: { dayType: string }) {
  return http.request("get", "/manage/report/stock", { params });
}
