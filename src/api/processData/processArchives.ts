import { http } from "@/utils/http";

//获取工艺档案信息
export function archiveInfo(craftArchiveId: number) {
  return http.request("get", `/manage/craft-archive/${craftArchiveId}`);
}

//更新工艺档案
export interface renewArchiveRes {
  craftArchiveCode: string;
  craftArchiveName: string;
  creator: string;
  version: string;
  createDate: number;
  craftArchiveId: number;
  attachmentPath: string[];
}
export function renewArchive(data: renewArchiveRes) {
  let { craftArchiveId, ...other } = data;
  return http.request<ResponseData<void>>(
    "put",
    `/manage/craft-archive/${craftArchiveId}`,
    {
      data: other
    }
  );
}

//获取工艺档案列表
export interface archiveListRes extends BasePageQuery {
  craftArchiveCode: string;
  craftArchiveName: string;
  version: string;
  ids: number[];
  exportType?: string;
}
export function archiveList(params: archiveListRes) {
  return http.request("get", "/manage/craft-archive", { params });
}
//导出工艺档案
export function exportArchive(data: archiveListRes) {
  return http.request(
    "post",
    "/manage/craft-archive/export",
    { data },
    {
      responseType: "blob"
    }
  );
}

//下载导入模板
export function downloadTemplate() {
  return http.request(
    "get",
    "/manage/craft-archive/excelTemplate",
    {},
    {
      responseType: "blob"
    }
  );
}

//添加工艺档案
export interface addArchiveRes {
  craftArchiveCode: string;
  craftArchiveName: string;
  creator: string;
  version: string;
  createDate: string;
  attachmentPath: string[];
  labelName: string;
  color: string;
  colorDescription: string;
}
export function addArchive(data: addArchiveRes) {
  return http.request("post", "/manage/craft-archive", { data });
}

//删除工艺档案
// export function deleteArchive(craftArchiveIds: string[]) {
//   return axios.delete("/manage/craft-archive", {
//     params: {
//       craftArchiveIds: craftArchiveIds.join(",") // 将数组转换为逗号分隔的字符串
//     }
//   });
// }
