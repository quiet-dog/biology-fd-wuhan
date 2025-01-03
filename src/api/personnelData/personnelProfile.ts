import { http } from "@/utils/http";

//获取人员档案信息
export function personnelInfo(personnelId: number) {
  return http.request("get", `/manage/personnel/${personnelId}`);
}

//获取人员档案列表
export interface personnelListRes extends BasePageQuery {
  name: string;
  department: string;
  post: string;
  education: string;
  contact: string;
}

export interface PersonnelDTO {
  personnelId: number;
  code: string;
  name: string;
  sex: string;
  department: string;
  post: string;
  pRank: string;
  email: string;
  card: string;
  education: string;
  contact: string;
  entryTime: string;
  leaveTime: string;
}

export interface UpdatePersonnelDTO extends PersonnelDTO {
  personnelId: number;
}

export function personnelList(params: personnelListRes) {
  return http.request("get", "/manage/personnel", { params });
}

export function exportPersonnel(params: personnelListRes) {
  return http.request(
    "get",
    "/manage/personnel/excel",
    { params },
    { responseType: "blob" }
  );
}

//下载导入模板
export function downloadTemplate() {
  return http.request(
    "get",
    "/manage/personnel/excel",
    {},
    {
      responseType: "blob"
    }
  );
}

// excelTemplate 下载导入模板
export function exportPersonnelTemplate() {
  return http.request("get", "/manage/personnel/excelTemplate", {
    responseType: "blob"
  });
}


// 编辑人员档案
export function editPersonnel(params: UpdatePersonnelDTO) {
  return http.request("put", "/manage/personnel/" + params.personnelId, {
    data: params
  });
}
