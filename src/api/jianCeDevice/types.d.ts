export interface AddJianCeDeviceReq {
  deviceSn: string;
  name: string;
  area: string;
}

export interface UpdateJianCeDeviceReq extends AddJianCeDeviceReq {
  jianCeDeviceId: number
}

export interface JianCeDeviceListReq extends BasePageQuery {
  deviceSn?: string;
  area?: string;
  online?: string;
}

export interface JianCeDeviceRow extends UpdateJianCeDeviceReq {

}