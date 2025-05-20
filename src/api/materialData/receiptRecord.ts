import { http } from "@/utils/http";

//获取领用记录列表
export interface receiveListRes extends BasePageQuery {
  name?: string;
  department?: string;
  materialName?: string;
}

export function receiveList(params: receiveListRes) {
  return http.request("get", "/manage/receive", { params });
}

// 管理后台根据物料名称获取各种类型的数量
export function materialsNameStockName(params: any) {
  return http.request("get", "/manage/receive/stockName", { params });
}

export function materialsNameStockNameType(params: any) {
  return http.request("get", "/manage/receive/stockNameType", { params });
}

//添加领用记录
export interface addreceiveRes {
  receiveUserId: number;
  materialsId: number;
  receiveNum: number;
  receiveExplain: string;
}

export interface AddMaterials {
  name?: string;
  code?: string;
  specification?: string;
  type?: string;
  stock?: number;
  tag?: string;
  lastStock?: number;
  unit?: string;
  batch?: string;
  model?: "";
  supplier?: "";
  color?: string;
  colorDescription?: string;
}
export function addreceive(data: addreceiveRes) {
  return http.request("post", "/manage/receive", { data });
}

export function addMaterials(data: AddMaterials) {
  return http.request("post", "/manage/materials", { data });
}
