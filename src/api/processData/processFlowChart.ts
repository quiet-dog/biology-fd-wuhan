import { http } from "@/utils/http";

//获取工艺流程图信息
export function processInfo(craftProcessId: number) {
  return http.request("get", `/manage/craft-process/${craftProcessId}`);
}

//更新工艺流程图
export interface renewprocessRes {
  craftArchiveId: number;
  craftNodeId: number;
  equipmentFactors: string;
  materialFactors: string;
  environmentFactors: string;
  personnelFactors: string;
  nodeOrder: number;
  craftProcessId: number;
}
export function renewprocess(data: renewprocessRes) {
  const { craftProcessId, ...other } = data;
  return http.request("put", `/manage/craft-process/${craftProcessId}`, {
    data
  });
}

//获取工艺流程图列表
export interface processListRes extends BasePageQuery {
  craftNode: string;
  craftArchiveName: string;
  craftArchiveId: number;
}
export function processList(params: processListRes) {
  return http.request("get", "/manage/craft-process", { params });
}

//添加工艺流程图
export interface addprocessRes {
  equipmentFactors: string;
  personnelFactors: string;
  craftArchiveId: number;
  craftNodeId: number;
  materialFactors: string;
  nodeOrder: number;
  environmentFactors: string;
}
export function addprocess(data: addprocessRes) {
  return http.request("post", "/manage/craft-process", { data });
}

//删除工艺流程图
export function deleteprocess(craftProcessIds: string[]) {
  return http.request("delete", "/manage/craft-process", {
    params: {
      craftProcessIds: craftProcessIds.join(",") // 将数组转换为逗号分隔的字符串
    }
  });
}
