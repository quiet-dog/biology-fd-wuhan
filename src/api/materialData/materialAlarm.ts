import { http } from "@/utils/http";

//获取库存报警列表
export interface materialAlarmRes extends BasePageQuery {
  materialsName: string;
  sort: string;
}
export function materialAlarmList(params: materialAlarmRes) {
  return http.request("get", "/manage/alarm", { params });
}
