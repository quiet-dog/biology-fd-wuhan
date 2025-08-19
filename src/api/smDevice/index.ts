import { http } from "@/utils/http";
import { AddSmDeviceReq, GetSmThresholdRes, SetSmThreshold, SmDeviceListReq } from "./types";

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

export function getSmThreshold(id: number) {
  return http.request<ResponseData<GetSmThresholdRes[]>>("get", "/manage/smDevice/getThreshold/" + id)
}

export function setSmThrehold(data: SetSmThreshold) {
  return http.request<ResponseData<GetSmThresholdRes[]>>("post", "/manage/smDevice/setThreshold", {
    data
  })
}


export function exportSmDevice(params: SmDeviceListReq) {
  return http.request(
    "get",
    "/manage/smDevice/excel",
    { params },
    {
      responseType: "blob"
    }
  );
}
