import { http } from "@/utils/http";
export const getXunJianEcharts = (params: string) => {
  return http.request("get", "/manage/xunJian/history/alarmCount", {
    params: {
      dayType: params
    }
  });
};
