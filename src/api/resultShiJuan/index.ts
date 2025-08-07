import { http } from "@/utils/http";
import { AddResultShiJuanReq, ResultShiJuanListReq } from "./types";

//获取工艺节点信息
export function resultShiJuanList(params: ResultShiJuanListReq) {
  return http.request("get", `/manage/resultShiJuan`, {
    params: params
  });
}

export function addResultShiJuan(data: AddResultShiJuanReq) {
  return http.request("post", "/manage/resultShiJuan", {
    data
  })
}

export function getResultShiJuan(data: number) {
  return http.request("get", `/manage/resultShiJuan/` + data)
}


export function resultShiJuanListByCreator(params: ResultShiJuanListReq) {
  return http.request("get", `/manage/resultShiJuan/listByCreator`, {
    params: params
  });
}


export function resultShiJuanListByUser(params: ResultShiJuanListReq) {
  return http.request("get", `/manage/resultShiJuan/listByUser`, {
    params: params
  });
}