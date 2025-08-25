import { http } from "@/utils/http";
import { AddXsDataReq, XsDataListReq } from "./types";

export function xsDataList(params: XsDataListReq) {
  return http.request("get", `/manage/xsData`, {
    params: params
  });
}

export function addXsData(data: AddXsDataReq) {
  return http.request("post", "/manage/xsData", {
    data
  })
}

export function exportXsData(params: XsDataListReq) {
  return http.request(
    "get",
    "/manage/xsData/excel",
    { params },
    {
      responseType: "blob"
    }
  );
}

