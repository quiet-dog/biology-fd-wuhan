import { http } from "@/utils/http";

// 获取当天门禁出入统计
export function getDayStatus() {
  return http.request("get", "/manage/door/enter");
}


export interface DoorEventQuery extends BasePageQuery {
  outId?: string;
  doorPlace?: string;
  name?: string;
  doorDate?: number;
}

export interface DoorDTO {
  enterStatus?: string
  doorCode?: string
  doorPlace?: string
  verificationMode?: string
  eventType?: string
  doorDate?: number
  doorId?: number
}


export function getDoorEventList(data: DoorEventQuery) {
  return http.request<ResponseData<PageDTO<DoorDTO>>>("get", "/manage/door", {
    params: data
  });
}


export function getMaterialsEasy() {
  return http.request<ResponseData<PageDTO<DoorDTO>>>("get", "/manage/materials/getMaterialsEasy");
}


export function editDoor(data: DoorDTO) {
  return http.request<ResponseData<void>>("put", "/manage/door/" + data.doorId, {
    data
  });
}


export function exportDoorTemplate() {
  return http.request("get", "/manage/door/excelTemplate", {
    responseType: "blob"
  });
}