import { http } from "@/utils/http";
import { AddXwDeviceReq, UpdateXwDeviceReq, XwDeviceListReq } from "./types";

export function xwDeviceList(params: XwDeviceListReq) {
  return http.request("get", `/manage/xwDevice`, {
    params: params
  });
}

export function addXwDevice(data: AddXwDeviceReq) {
  return http.request("post", "/manage/xwDevice", {
    data
  });
}

export function editXwDevice(data: UpdateXwDeviceReq) {
  return http.request("put", "/manage/xwDevice/" + data.xwDeviceId, {
    data
  });
}

export function exportXwDevice(params: XwDeviceListReq) {
  return http.request(
    "get",
    "/manage/xwDevice/excel",
    { params },
    {
      responseType: "blob"
    }
  );
}
