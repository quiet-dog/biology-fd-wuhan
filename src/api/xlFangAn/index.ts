import { http } from "@/utils/http";
import { AddXlFangAnReq, UpdateXlFangAnReq, XlFangAnListReq } from "./types";

export function xlFangAnList(params: XlFangAnListReq) {
  return http.request("get", `/manage/xlFangAn`, {
    params: params
  });
}

export function addXlFangAn(data: AddXlFangAnReq) {
  return http.request("post", "/manage/xlFangAn", {
    data
  });
}

export function editXlFangAn(data: UpdateXlFangAnReq) {
  return http.request("put", "/manage/xlFangAn/" + data.xlFangAnId, {
    data
  });
}

export function getXiLiGroup() {
  return http.request<string[]>("get", `/manage/xlFangAn/getDeptGroup`, {});
}

export function exportXlFangAnDevice(params: XlFangAnListReq) {
  return http.request(
    "get",
    "/manage/xlFangAn/excel",
    { params },
    {
      responseType: "blob"
    }
  );
}
