import { http } from "@/utils/http";
import { AddNongDuDataReq, NongDuDataListReq } from "./types";

export function nongDuDataList(params: NongDuDataListReq) {
  return http.request("get", `/manage/nongDuData`, {
    params: params
  });
}

export function addNongDuData(data: AddNongDuDataReq) {
  return http.request("post", "/manage/nongDuData", {
    data
  })
}

export function exportNongDuData(params: NongDuDataListReq) {
  return http.request(
    "get",
    "/manage/nongDuData/excel",
    { params },
    {
      responseType: "blob"
    }
  );
}
