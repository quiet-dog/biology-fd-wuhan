import { http } from "@/utils/http";
import {
  AddJianCeDeviceReq,
  JianCeDeviceListReq,
  UpdateJianCeDeviceReq
} from "./types";

export function jianCeDeviceList(params: JianCeDeviceListReq) {
  return http.request("get", `/manage/jianCeDevice`, {
    params: params
  });
}

export function addJianCeDevice(data: AddJianCeDeviceReq) {
  return http.request("post", "/manage/jianCeDevice", {
    data
  });
}

export function editJianCeDevice(data: UpdateJianCeDeviceReq) {
  return http.request("put", "/manage/jianCeDevice/" + data.jianCeDeviceId, {
    data
  });
}

export function exportJianCeDevice(params: JianCeDeviceListReq) {
  return http.request(
    "get",
    "/manage/jianCeDevice/excel",
    { params },
    {
      responseType: "blob"
    }
  );
}
