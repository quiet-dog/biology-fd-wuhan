import { http } from "@/utils/http";

//获取SOP信息
export function sopInfo(sopId: number) {
  return http.request("get", `/manage/sop/${sopId}`);
}

//更新SOP
export interface renewsopRes {
  code: string;
  name: string;
  scope: string;
  paths: string[];
  sopId: number;
}
export function renewsop(data: renewsopRes) {
  let { sopId, ...other } = data;
  return http.request("put", `/manage/sop/${sopId}`, {
    data: other
  });
}

//获取SOP列表
export interface sopListRes extends BasePageQuery {
  name: string;
  scope: string;
}
export function sopList(params: sopListRes) {
  return http.request("get", "/manage/sop", { params });
}

//添加SOP
export interface addsopRes {
  code: string;
  name: string;
  scope: string;
  paths: string[];
}
export function addsop(data: addsopRes) {
  return http.request("post", "/manage/sop", { data });
}

//删除SOP
export function deletesop(sopIds: string[]) {
  return http.request("delete", "/manage/sop", {
    params: {
      sopIds: sopIds.join(",") // 将数组转换为逗号分隔的字符串
    }
  });
}
