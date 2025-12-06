export interface AddKongTiaoDeviceReq {
  deviceSn?: string;
  name?: string;
  area?: string;
  deviceType?: string;
}

export interface UpdateKongTiaoDeviceReq extends AddKongTiaoDeviceReq {
  kongTiaoDeviceId: number;
}

export interface KongTiaoDeviceListReq extends BasePageQuery {
  deviceSn?: string;
  area?: string;
  online?: string;
  workStatus?: string;
}

export type KongTiaoDeviceRow = UpdateKongTiaoDeviceReq;