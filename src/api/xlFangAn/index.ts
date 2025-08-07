import { http } from "@/utils/http";
import { AddXlFangAnReq, XlFangAnListReq } from "./types";

export function xlFangAnList(params: XlFangAnListReq) {
  return http.request("get", `/manage/xlFangAn`, {
    params: params
  });
}

export function addXlFangAn(data: AddXlFangAnReq) {
  return http.request("post", "/manage/xlFangAn", {
    data
  })
}
