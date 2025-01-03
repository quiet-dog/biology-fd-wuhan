import { http } from "@/utils/http";

//获取物料档案信息
export function materialFilesInfo(materialsId: number) {
  return http.request("get", `/manage/materials/${materialsId}`);
}

//更新物料档案
export interface renewmaterialFilesRes {
  name: string;
  code: string;
  stock: number;
  unit: string;
  type: string;
  specification: string;
  materialsId: number;
  values: {
    level: string;
    min: number;
    max: string;
  }[];
}
export function renewmaterialFiles(data: renewmaterialFilesRes) {
  const { materialsId, ...other } = data;
  return http.request("put", `/manage/materials/${materialsId}`, {
    data: other
  });
}

//获取物料档案列表
export interface materialFilesListRes extends BasePageQuery {
  name?: string;
  materialsType?: string;
}
export function materialFilesList(params: materialFilesListRes) {
  return http.request("get", "/manage/materials", { params });
}

//下载导入模板
export function downloadTemplate() {
  return http.request(
    "get",
    "/manage/materials/excelTemplate",
    {},
    {
      responseType: "blob"
    }
  );
}

//添加物料档案
export interface addmaterialFilesRes {
  name: string;
  code: string;
  scope: string;
  stock: number;
  unit: string;
}
export function addmaterialFiles(data: addmaterialFilesRes) {
  return http.request("post", "/manage/materials", { data });
}

export function getstatistics(materialsId: number) {
  return http.request("get", `/manage/materials/stock/${materialsId}`, {
    params: {
      dayType: "week"
    }
  });
}

//删除物料档案
// export function deletematerialFiles(materialsIdss: string[]) {
//   return axios.delete("/manage/materials", {
//     params: {
//       materialsIdss: materialsIdss.join(",") // 将数组转换为逗号分隔的字符串
//     }
//   });
// }
