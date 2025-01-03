import { http } from "@/utils/http";

//获取处理手册信息
export function manualInfo(disposeManualId: number) {
  return http.request("get", `/manage/craft-dispose-manual/${disposeManualId}`);
}

//更新处理手册
export interface renewmanualRes {
  requiredTime: string;
  emergencyProcess: string;
  problemDescription: string;
  responsibilityDivision: string;
  craftDisposeManualId: number;
  craftName: string;
  preventiveMeasures: string;
  craftNode: string;
}
export function renewmanual(data: renewmanualRes) {
  const { craftDisposeManualId, ...other } = data;
  return http.request(
    "put",
    `/manage/craft-dispose-manual/${craftDisposeManualId}`,
    { data: other }
  );
}

//获取处理手册列表
export interface manualListRes extends BasePageQuery {
  craftNode: string;
  craftName: string;
  responsibilityDivision: string;
}
export function manualList(params: manualListRes) {
  return http.request("get", "/manage/craft-dispose-manual", { params });
}

//下载导入模板
export function downloadTemplate() {
  return http.request(
    "get",
    "/manage/craft-dispose-manual/excelTemplate",
    {},
    {
      responseType: "blob"
    }
  );
}

//添加处理手册
export interface addmanualRes {
  responsibilityDivision: string;
  requiredTime: string;
  craftNodeId: number | null;
  craftArchiveId: number | null;
  problemDescription: string;
  emergencyProcess: string;
  preventiveMeasures: string;
}
export function addmanual(data: addmanualRes) {
  return http.request("post", "/manage/craft-dispose-manual", { data });
}

//删除处理手册
export function deletemanual(disposeManualIds: string[]) {
  return http.request("delete", "/manage/craft-dispose-manual", {
    params: {
      disposeManualIds: disposeManualIds.join(",") // 将数组转换为逗号分隔的字符串
    }
  });
}
