import { http } from "@/utils/http";

//获取应急调度-报警事件信息
export function emergencyEventInfo(emergencyEventId: number) {
  return http.request("get", `/manage/emergencyEvent/${emergencyEventId}`);
}

//获取应急调度-报警事件列表
export interface emergencyEventListRes extends BasePageQuery {
  eventName: string;
  handlerName: string;
}
export function emergencyEventList(params: emergencyEventListRes) {
  return http.request("get", "/manage/emergencyEvent", { params });
}

export function exportAlarmEvents(params: emergencyEventListRes) {
  return http.request(
    "get",
    "/manage/emergencyEvent/excel",
    { params },
    {
      responseType: "blob"
    }
  );
}

//添加应急调度-报警事件
export interface addemergencyEventRes {
  eventName: string;
  code: string;
  content: string;
  processingFlow: string;
  handleIds: number[];
  emergencyAlarmIds: number[];
  type: string;
}
export function addemergencyEvent(data: addemergencyEventRes) {
  return http.request("post", "/manage/emergencyEvent", { data });
}
