import { http } from "@/utils/http";
import { AddKongTiaoDataReq, KongTiaoDataListReq } from "./types";

export function kongTiaoDataList(params: KongTiaoDataListReq) {
  return http.request("get", `/manage/kongTiaoData`, {
    params: params
  });
}

export function addKongTiaoData(data: AddKongTiaoDataReq) {
  return http.request("post", "/manage/kongTiaoData", {
    data
  });
}

export function editKongTiaoData(data: AddKongTiaoDataReq) {
  return http.request("put", "/manage/kongTiaoData/" + data.kongTiaoDataId, {
    data
  });
}

export function exportKongTiaoData(params: KongTiaoDataListReq) {
  return http.request(
    "get",
    "/manage/kongTiaoData/excel",
    { params },
    {
      responseType: "blob"
    }
  );
}
