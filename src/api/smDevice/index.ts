import { http } from "@/utils/http";
import { AddSmDeviceReq, SmDeviceListReq } from "./types";

//获取工艺节点信息
export function smDeviceList(params: SmDeviceListReq) {
  return http.request("get", `/manage/smDevice`, {
    params: params
  });
}

export function addSmDevice(data: AddSmDeviceReq) {
  return http.request("post", "/manage/smDevice", {
    data
  })
}
