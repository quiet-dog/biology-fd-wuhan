import { http } from "@/utils/http";
import { string } from "vue-types";

export interface KnowledgeListCommand extends BasePageQuery {
  title?: string;
  knowledgeType?: string;
}

export interface KnowledgePageResponse {
  knowledgeId: number;
  title: string;
  knowledgeType: string;
  knowledgeTypeName: string;
  content: string;
  createTime: string;
  viewCount: number;
  paths: string[];
}

export interface KnowledgeInfo extends KnowledgePageResponse {
  paths: string[];
}

export interface AddKnowledgeCommand {
  knowledgeType: string;
  code: string;
  title: string;
  createrName: string;
  paths?: string[];
}

export interface UpdateKnowledgeCommand extends AddKnowledgeCommand {
  knowledgeId: number;
}

export interface KnowledgeTypeEntity {
  knowledgeTypeId: number;
  typeName: string;
}

export const getKnowledgeListApi = (params: KnowledgeListCommand) => {
  return http.request<ResponseData<PageDTO<KnowledgePageResponse>>>(
    "get",
    "/manage/knowledge",
    {
      params
    }
  );
};

export const getKnowledgeApi = (id: number) => {
  return http.request("get", `/manage/knowledge/${id}`);
};

export const addKnowledgeApi = (data: AddKnowledgeCommand) => {
  return http.request<ResponseData<void>>("post", "/manage/knowledge", {
    data
  });
};

export const updateKnowledgeApi = (data: UpdateKnowledgeCommand) => {
  let { knowledgeId, ...other } = data;
  return http.request<ResponseData<void>>(
    "put",
    `/manage/knowledge/${knowledgeId}`,
    {
      data: other
    }
  );
};

export const deleteKnowledgeApi = (data: Array<number>) => {
  return http.request<ResponseData<void>>("delete", "/manage/knowledge", {
    params: {
      // 需要将数组转换为字符串  否则Axios会将参数变成 noticeIds[0]:1  noticeIds[1]:2 这种格式，后端接收参数不成功
      knowledgeIds: data.toString()
    }
  });
};

export const getKnowledgeTypeApi = () => {
  return http.request<ResponseData<Array<KnowledgeTypeEntity>>>(
    "get",
    "/manage/knowledge/type"
  );
};
