import { http } from "@/utils/http";
import { AddXlArchiveReq, XlArchiveListReq } from "./types";

export function xlArchiveList(params: XlArchiveListReq) {
  return http.request("get", `/manage/xlArchive`, {
    params: params
  });
}

export function addXlArchive(data: AddXlArchiveReq) {
  return http.request("post", "/manage/xlArchive", {
    data
  });
}

export function exportXlArchive(params: XlArchiveListReq) {
  return http.request(
    "get",
    "/manage/xlArchive/excel",
    { params },
    {
      responseType: "blob"
    }
  );
}

export function downloadTemplate() {
  return http.request(
    "get",
    "/manage/xlArchive/excelTemplate",
    {},
    {
      responseType: "blob"
    }
  );
}
