import { http } from "@/utils/http";
import { AddCaiYangDataReq, CaiYangDataListReq } from "./types";

export function caiYangDataList(params: CaiYangDataListReq) {
  return http.request("get", `/manage/caiYangData`, {
    params: params
  });
}

export function addCaiYangData(data: AddCaiYangDataReq) {
  return http.request("post", "/manage/caiYangData", {
    data
  })
}


export function exportCaiYangData(params: CaiYangDataListReq) {
  return http.request(
    "get",
    "/manage/caiYangData/excel",
    { params },
    {
      responseType: "blob"
    }
  );
}
