import { http } from "@/utils/http";
//获取报警级别列表
export interface detectionListRes extends BasePageQuery {
  description: string;
  tag: string;
  type?: string;
  environmentId?: number;
}
export function detectionList(params: detectionListRes) {
  return http.request("get", "/manage/detection", { params });
}

export function getstatistics(detectionId: number, params: any) {
  return http.request("get", `/manage/detection/data/${detectionId}`, {
    params: params
  });
}

// /manage/detection/unitNameAndArea
export function unitNameAndArea(params: any) {
  return http.request("get", "/manage/detection/unitNameAndArea", { params });
}


export function getNormalMaterails() {
  return http.request("get", "/manage/materials/getAllNormal");

}

// /manage/detection/allGroup
export function allGroup() {
  return http.request("get", "/manage/environment/allGroup");
}
