import { http } from "@/utils/http";

//获取工艺节点信息
export function nodeInfo(craftNodeId: number) {
  return http.request("get", `/manage/craft-node/${craftNodeId}`);
}

//更新工艺节点
export interface renewnodeRes {
  requiredTime: string;
  isHighRisk: boolean;
  operationMethod: string;
  operationDescription: string;
  craftNodeId: number;
  nodeName: string;
  craftArchiveId: number;
  nodeOrder: number;
  nodeTags: string;
  nodeCode: string;
  equipmentIds: number[];
  craftArchive: {
    craftArchiveId: number;
    craftArchiveName: string;
  };
  color: string;
  colorDescription: string;
  labelName: string;
}
export function renewnode(data: renewnodeRes) {
  const { craftNodeId, ...other } = data;
  return http.request("put", `/manage/craft-node/${craftNodeId}`, {
    data: other
  });
}

//获取工艺节点列表
export interface nodeListRes extends BasePageQuery {
  nodeName: string;
  craftArchiveName: string;
  craftArchiveId: number;
}
export function nodeList(params: nodeListRes) {
  return http.request("get", "/manage/craft-node", { params });
}

//添加工艺节点
export interface addnodeRes {
  isHighRisk: boolean;
  operationMethod: string;
  operationDescription: string;
  nodeName: string;
  craftArchiveId: number;
  craftArchive: {
    craftArchiveId: number;
    craftArchiveName: string;
  };
  requiredTime: string;
  nodeOrder: number;
  nodeTags: string;
  nodeCode: string;
  equipmentIds: number[];
  color: string;
  colorDescription: string;
  labelName: string;
}
export function addnode(data: addnodeRes) {
  return http.request("post", "/manage/craft-node", { data });
}

//删除工艺节点
// export function deletenode(nodeIds: string[]) {
//   return axios.delete("/manage/craft-node", {
//     params: {
//       nodeIds: nodeIds.join(",") // 将数组转换为逗号分隔的字符串
//     }
//   });
// }
//删除工艺节点
export const deletenode = (data: Array<number>) => {
  return http.request<ResponseData<void>>("delete", "/manage/craft-node", {
    params: {
      // 需要将数组转换为字符串  否则Axios会将参数变成 noticeIds[0]:1  noticeIds[1]:2 这种格式，后端接收参数不成功
      nodeIds: data.toString()
    }
  });
};
