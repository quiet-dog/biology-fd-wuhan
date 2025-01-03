import { http } from "@/utils/http";

//获取应急预案信息
export function emergencyInfo(emergencyId: number) {
  return http.request("get", `/manage/emergency/${emergencyId}`);
}

//更新应急预案
export interface renewemergencyRes {
  code: string;
  title: string;
  version: string;
  deptId: number;
  scope: string;
  riskType: string;
  paths: string[];
  keywordIds: number[];
  emergencyId: number;
}
export function renewprocess(data: renewemergencyRes) {
  let { emergencyId, ...other } = data;
  return http.request("put", `/manage/emergency/${emergencyId}`, {
    data: other
  });
}

//获取应急预案列表
export interface emergencyListRes extends BasePageQuery {
  title: string;
  riskType:string;
}
export function emergencyList(params: emergencyListRes) {
  return http.request("get", "/manage/emergency", { params });
}

//添加应急预案
export interface addemergencyRes {
  code: string;
  title: string;
  version: string;
  deptId: number;
  scope: string;
  riskType: string;
  paths: string[];
  keywordIds: number[];
}
export function addemergency(data: addemergencyRes) {
  return http.request("post", "/manage/emergency", { data });
}

//删除应急预案
export function deleteemergency(emergencyIds: string[]) {
  return http.request("delete", "/manage/emergency", {
    params: {
      emergencyIds: emergencyIds.join(",") // 将数组转换为逗号分隔的字符串
    }
  });
}
