import { http } from "@/utils/http";

//获取阈值设置信息
export function thresholdInfo(thresholdId: number) {
  return http.request("get", `/manage/threshold/${thresholdId}`);
}

//更新阈值设置
export interface renewthresholdRes {
  equipmentId: number;
  sensorName: string;
  sensorModel: string;
  equipmentIndex: string;
  unit: string;
  values: {
    level: string;
    min: number;
    max: number;
  }[];
  emergencyIds: number[];
  sopIds: number[];
  outId: number;
  thresholdId: number;
}
export function renewthreshold(data: renewthresholdRes) {
  const { thresholdId, ...other } = data;
  return http.request("put", `/manage/threshold/${thresholdId}`, {
    data: other
  });
}

//获取阈值设置列表
export interface thresholdListRes extends BasePageQuery {
  sensorName?: string;
  sensorModel?: string;
  equipmentIndex?: string;
  equipmentId?: number;
  equipmentName?: string;
}
export function thresholdList(params: thresholdListRes) {
  return http.request("get", "/manage/threshold", { params });
}

//添加阈值设置
export interface addthresholdRes {
  equipmentId: number;
  sensorName: string;
  sensorModel: string;
  equipmentIndex: string;
  unit: string;
  values: {
    level: string;
    min: number;
    max: number;
  }[];
  emergencyIds: number[];
  sopIds: number[];
  outId: number;
}
export function addthreshold(data: addthresholdRes) {
  return http.request("post", "/manage/threshold", { data });
}

// 首页设备在线统计
export function getThresholdOnline() {
  return http.request("get", "/manage/threshold/online");
}

//删除阈值设置
// export function deletethreshold(thresholdIdss: string[]) {
//   return axios.delete("/manage/threshold", {
//     params: {
//       thresholdIdss: thresholdIdss.join(",") // 将数组转换为逗号分隔的字符串
//     }
//   });
// }
