import { http } from "@/utils/http";

export interface PoliciesPageResponse extends AddPoliciesCommand {
  policiesId: number;
}

export interface PoliciesgeEntity extends AddPoliciesCommand {
  policiesId: number;
}

export interface AddPoliciesCommand {
  policiesCode: string;
  policiesName: string;
  releaseDate: string;
  paths: string[];
  type: string;
}

export interface UpdatePoliciesCommand extends AddPoliciesCommand {
  policiesId: number;
}

export interface PoliciesListCommand extends BasePageQuery {
  policiesCode?: string;
  policiesName?: string;
  type?: string;
}



export const getPoliciesListApi = (params: PoliciesListCommand) => {
  return http.request<ResponseData<PageDTO<PoliciesPageResponse>>>(
    "get",
    "/manage/policies",
    {
      params
    }
  );
}

export const getPoliciesgeApi = (id: number) => {
  return http.request<ResponseData<PoliciesgeEntity>>(
    "get",
    `/manage/policies/${id}`,
  );
}

export const addPoliciesApi = (data: AddPoliciesCommand) => {
  return http.request<ResponseData<void>>("post", "/manage/policies", {
    data
  });
};

export const updatePoliciesApi = (data: UpdatePoliciesCommand) => {
  let { policiesId, ...other } = data;
  return http.request<ResponseData<void>>("put", `/manage/policies/${policiesId}`, {
    data: other
  });
};

export const deletePoliciesApi = (data: Array<number>) => {
  return http.request<ResponseData<void>>("delete", "/manage/policies", {
    params: {
      // 需要将数组转换为字符串  否则Axios会将参数变成 noticeIds[0]:1  noticeIds[1]:2 这种格式，后端接收参数不成功
      policiesIds: data.toString()
    }
  });
};

