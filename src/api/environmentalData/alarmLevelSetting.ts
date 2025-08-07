import { http } from "@/utils/http";
//获取报警级别列表
export interface detectionListRes extends BasePageQuery {
  description?: string;
  tag?: string;
  type?: string;
  environmentId?: number;
  dayType?: string;
}


export interface nenghapListRes extends BasePageQuery {
  type?: string;
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

export function getNenghaoList(params: nenghapListRes) {
  return http.request("get", "/manage/detection/getNenghao", { params });
}


export function getTongJiNenghaoApi(params: detectionListRes) {
  return http.request("get", "/manage/detection/getTongJiNenghao", { params });
}



export function getBuTongApi(data) {
  return http.request("post", "/manage/detection/getBuTong", {
    data: data
  });
}


