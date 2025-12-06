import { http } from "@/utils/http";
import { AddKongTiaoDeviceReq, KongTiaoDeviceListReq } from "./types";

export function kongTiaoDeviceList(params: KongTiaoDeviceListReq) {
  return http.request("get", `/manage/kongTiaoDevice`, {
    params: params
  });
}

export function addKongTiaoDevice(data: AddKongTiaoDeviceReq) {
  return http.request("post", "/manage/kongTiaoDevice", {
    data
  });
}

export function editKongTiaoDevice(data: AddKongTiaoDeviceReq) {
  return http.request(
    "put",
    "/manage/kongTiaoDevice/" + data.kongTiaoDeviceId,
    {
      data
    }
  );
}

export function exportKongTiaoDevice(params: KongTiaoDeviceListReq) {
  return http.request(
    "get",
    "/manage/kongTiaoDevice/excel",
    { params },
    {
      responseType: "blob"
    }
  );
}
