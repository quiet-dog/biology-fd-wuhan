import { http } from "@/utils/http";
import {
  AddNongDuDeviceReq,
  NongDuDeviceListReq,
  UpdateNongDuDeviceReq
} from "./types";

export function nongDuDeviceList(params: NongDuDeviceListReq) {
  return http.request("get", `/manage/nongDuDevice`, {
    params: params
  });
}

export function addNongDuDevice(data: AddNongDuDeviceReq) {
  return http.request("post", "/manage/nongDuDevice", {
    data
  });
}

export function editNongDuDevice(data: UpdateNongDuDeviceReq) {
  return http.request("put", "/manage/nongDuDevice/" + data.nongDuDeviceId, {
    data
  });
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
