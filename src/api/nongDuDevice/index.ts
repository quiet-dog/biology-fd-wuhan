import { http } from "@/utils/http";
import { AddNongDuDeviceReq, NongDuDeviceListReq } from "./types";

export function nongDuDeviceList(params: NongDuDeviceListReq) {
  return http.request("get", `/manage/nongDuDevice`, {
    params: params
  });
}

export function addNongDuDevice(data: AddNongDuDeviceReq) {
  return http.request("post", "/manage/nongDuDevice", {
    data
  })
}


export function exportNongDuDevice(params: NongDuDeviceListReq) {
  return http.request(
    "get",
    "/manage/nongDuDevice/excel",
    { params },
    {
      responseType: "blob"
    }
  );
}

