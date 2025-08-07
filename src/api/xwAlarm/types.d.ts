export interface AddXwAlarmReq {
  alarmId: number;             // 外部报警ID
  cameraId: string;            // 摄像头id
  picPath?: string;            // 处理后图片路径（可选）
  seatNumber: string;          // 机位号
  picPathOrg: string;          // 原始图片路径
  timeStamp?: number;          // 时间戳（可选）
  flag?: number;               // 报警标志（可选）
  filterFlag?: number;         // 过滤标志（可选）
  functionType?: number;       // 功能类型（可选）
  displayFlag?: number;        // 显示标志（可选）
  createdAt?: number;          // 外部创建时间（可选）
  pushTime?: number;           // 推送时间（可选）
  creatorId?: number | null;   // 创建者ID（可为 null）
  createTime?: string | null;  // 创建时间（datetime 格式，可为 null）
  updaterId?: number | null;   // 更新者ID（可为 null）
  updateTime?: string | null;  // 更新时间（datetime 格式，可为 null）
  deleted?: boolean;           // 删除标志（0/1 -> true/false）
}

export interface UpdateXwAlarmReq extends AddXwAlarmReq {
  xwAlarmId: number;           // id
}

export interface XwAlarmListReq extends BasePageQuery {
  cameraId: string;
  seatNumer?: string;
}

export interface XwAlarmRow extends UpdateXwAlarmReq {

}