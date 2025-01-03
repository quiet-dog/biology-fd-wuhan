import { http } from "@/utils/http";

//获取设备数据列表
export interface deviceDataListRes extends BasePageQuery {
  equipmentName: string;
  monitoringIndicator: string;
}
export function deviceDataList(params: deviceDataListRes) {
  return http.request("get", "/manage/equipment-data", { params });
}
