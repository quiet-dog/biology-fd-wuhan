import { http } from "@/utils/http";
import { string } from "vue-types";

export type XunJianListCommand = BasePageQuery;

export type XunJianHistoryListCommand = BasePageQuery;

export interface XunJianPageResponse {
  xunJianId: number;
  fanWei: string;
  xunJianPinLu: string;
  xunJianLeiXing: string;
  startTime: number;
  endTime: number;
  enable: boolean;
}

export type XunJianInfo = XunJianPageResponse;

export interface AddXunJianCommand {
  fanWei: string;
  xunJianPinLu: string;
  xunJianLeiXing: string;
  enable: boolean;
  timeRange?: number[];
  dayRange?: number[];
}

export interface UpdateXunJianCommand extends AddXunJianCommand {
  xunJianId: number;
}

export interface XunJianTypeEntity { }

export const getXunJianListApi = (params: XunJianListCommand) => {
  return http.request<ResponseData<PageDTO<XunJianPageResponse>>>(
    "get",
    "/manage/xunJian",
    {
      params
    }
  );
};

export const getXunJianApi = (id: number) => {
  return http.request("get", `/manage/xunJian/${id}`);
};

export const addXunJianApi = (data: AddXunJianCommand) => {
  return http.request<ResponseData<void>>("post", "/manage/xunJian", {
    data
  });
};

export const updateXunJianApi = (data: UpdateXunJianCommand) => {
  const { xunJianId, ...other } = data;
  return http.request<ResponseData<void>>(
    "put",
    `/manage/xunJian/${xunJianId}`,
    {
      data: other
    }
  );
};

export const deleteXunJianApi = (data: Array<number>) => {
  return http.request<ResponseData<void>>("delete", "/manage/xunJian", {
    params: {
      // 需要将数组转换为字符串  否则Axios会将参数变成 noticeIds[0]:1  noticeIds[1]:2 这种格式，后端接收参数不成功
      xunJianIds: data.toString()
    }
  });
};

export const getXunJianTypeApi = () => {
  return http.request<ResponseData<Array<XunJianTypeEntity>>>(
    "get",
    "/manage/xunJian/type"
  );
};

export const getXunJianHistoryListApi = (params: XunJianListCommand) => {
  return http.request<ResponseData<PageDTO<XunJianPageResponse>>>(
    "get",
    "/manage/xunJian/history",
    {
      params
    }
  );
};

export const getAllAreas = () => {
  return http.request("get", "/manage/xunJian/areas");
};
