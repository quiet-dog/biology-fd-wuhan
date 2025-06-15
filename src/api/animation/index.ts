import { http } from "@/utils/http";

export interface AnimationDTO {
  animationId?: number;
  name?: string;
  description?: string;
  type?: string;
  key?: string;
}

export interface SendAnimationCommand {
  animationIds: number[];
  type: string;
}

export interface SearchAnimationCommand extends BasePageQuery { }

export const getAnimationApi = (data: SearchAnimationCommand) => {
  return http.request<ResponseData<PageDTO<AnimationDTO>>>("get", `/manage/animation`, {
    params: data
  });
};

export const sendAnimationApi = (data: SendAnimationCommand) => {
  return http.request<ResponseData<void>>("post", `/manage/animation/control`, {
    data
  });
}