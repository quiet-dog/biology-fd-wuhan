import { http } from "@/utils/http";
import { AddXwDeviceReq, XwDeviceListReq } from "./types";

export function xwDeviceList(params: XwDeviceListReq) {
  return http.request("get", `/manage/xwDevice`, {
    params: params
  });
}

export function addXwDevice(data: AddXwDeviceReq) {
  return http.request("post", "/manage/xwDevice", {
    data
  })
}
