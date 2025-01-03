import { http } from "@/utils/http";

//获取通知信息
export function notificationInfo(notificationId: number) {
  return http.request("get", `/manage/notification/${notificationId}`);
}

//获取通知列表
export interface notificationListRes extends BasePageQuery {
  notificationTitle: string;
  notificationType: string;
  // orderColumn=purchaseDate&orderDirection=descending
  orderColumn: string;
  orderDirection: string;
  //pageNum
  pageNum: number;
  //pageSize
  pageSize: number;
  isPersonal: boolean;
}
export function notificationList(params: notificationListRes) {
  return http.request("get", "/manage/notification", { params });
}

//删除通知
export const deletenode = (data: Array<number>) => {
  return http.request("delete", "/manage/notification", {
    params: {
      notificationIds: data.toString()
    }
  });
};

// 更新通知
export const updateNotification = (notificationId: number, data: any) => {
  return http.request("put", `/manage/notification/${notificationId}`, {
    data
  });
};
