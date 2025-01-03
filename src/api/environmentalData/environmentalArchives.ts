import { http } from "@/utils/http";

//获取环境档案列表
export interface environmentalFilesListRes extends BasePageQuery {
  description: string;
  tag: string;
  environmentIds: number[];
}
export function environmentalFilesList(params: environmentalFilesListRes) {
  return http.request("get", "/manage/environment", { params });
}

export function exportEnvironmentalFiles(params: environmentalFilesListRes) {
  return http.request(
    "get",
    "/manage/environment/excel",
    { params },
    {
      responseType: "blob"
    }
  );
}

//添加环境档案
export interface addenvironmentalRes {
  description: string;
  tag: string;
  type: string;
  scope: string;
  esignal: string;
  supplier: string;
  model: string;
  unit: string;
  plcAddress: string;
  unitName: string;
  emergencyIds: number[];
  sopIds: number[];
  earea: string;
  alarmLevels: { level: string; min: number; max: number }[];
}
export function addenvironmental(data: addenvironmentalRes) {
  return http.request("post", "/manage/environment", { data });
}

//编辑环境档案
export interface editenvironmentalRes {
  description: string;
  tag: string;
  type: string;
  scope: string;
  signal: string;
  supplier: string;
  model: string;
  unit: string;
  plcAddress: string;
  unitName: string;
  emergencyIds: number[];
  sopIds: number[];
  alarmLevels: { level: string; min: number; max: number }[];
  environmentId: number;
}
export function editenvironmental(data: editenvironmentalRes) {
  let { environmentId, ...other } = data;
  return http.request("put", `/manage/environment/${environmentId}`, {
    data: other
  });
}
