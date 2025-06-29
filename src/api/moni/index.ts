import { http } from "@/utils/http";

export interface AddMoniCommand {
  /** 描述 */
  description?: string;

  /** 阈值ID */
  thresholdIds?: number[];

  /** 环境ID */
  environmentIds?: number[];

  /** 最小 */
  min?: number;

  /** 最大 */
  max?: number;

  /** 推送类型 */
  pushType?: string;

  /** 推送频率 */
  pushFrequency?: number;
}

export interface UpdateMoniCommand extends AddMoniCommand {
  moniId: number;
}

export interface MoniDTO {
  description?: string;
  createTime?: string;
  moniId?: number;
}

export interface SearchMoniCommand extends BasePageQuery { }


export const getMoniApi = (data: SearchMoniCommand) => {
  return http.request<ResponseData<PageDTO<MoniDTO>>>("get", `/manage/moni`, {
    params: data
  });
};

export const createMoniApi = (data: AddMoniCommand) => {
  return http.request<ResponseData<MoniDTO>>("post", `/manage/moni`, {
    data
  });
}

export const updateMoniApi = (data: UpdateMoniCommand) => {
  return http.request<ResponseData<MoniDTO>>("put", `/manage/moni/${data.moniId}`, {
    data
  });
};

export const startMoniApi = (moniId: number) => {
  return http.request<ResponseData<MoniDTO>>("get", `/manage/moni/start/${moniId}`, {
  });
}


export const stopMoniApi = (moniId: number) => {
  return http.request<ResponseData<MoniDTO>>("get", `/manage/moni/stop/${moniId}`, {
  });
}

export const deleteMoniApi = (moniId: number) => {
  return http.request<ResponseData<MoniDTO>>("post", `/manage/moni/delete`, {
    data: {
      moniIds: [moniId]
    }
  });
}


export const sendDataMoniApi = (moniId: number, data: number) => {
  return http.request<ResponseData<MoniDTO>>("post", `/manage/moni/send`, {
    data: {
      moniId,
      value: data
    }
  });
}
