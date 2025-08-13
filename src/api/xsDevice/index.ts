import { http } from "@/utils/http";
import { AddXsDeviceReq, XsDeviceListReq } from "./types";

export function xsDeviceList(params: XsDeviceListReq) {
  return http.request("get", `/manage/xsDevice`, {
    params: params
  });
}

export function addXsDevice(data: AddXsDeviceReq) {
  return http.request("post", "/manage/xsDevice", {
    data
  })
}
