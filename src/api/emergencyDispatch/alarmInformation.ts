import { http } from "@/utils/http";

//获取报警信息详情
export function alarmInformationInfo(emergencyAlarmId: number) {
  return http.request("get", `/manage/emergencyAlarm/${emergencyAlarmId}`);
}

//获取报警信息列表
export interface alarmInformationListRes extends BasePageQuery {
  type: string;
  level: string;
}
export function alarmInformationList(params: alarmInformationListRes) {
  return http.request("get", "/manage/emergencyAlarm", { params });
}
