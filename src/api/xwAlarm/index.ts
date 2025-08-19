import { http } from "@/utils/http";
import { AddXwAlarmReq, XwAlarmListReq } from "./types";

export function xwAlarmList(params: XwAlarmListReq) {
  return http.request("get", `/manage/xwAlarm`, {
    params: params
  });
}

export function addXwAlarm(data: AddXwAlarmReq) {
  return http.request("post", "/manage/xwAlarm", {
    data
  })
}

export function exportXwAlarm(params: XwAlarmListReq) {
  return http.request(
    "get",
    "/manage/xwAlarm/excel",
    { params },
    {
      responseType: "blob"
    }
  );
}
