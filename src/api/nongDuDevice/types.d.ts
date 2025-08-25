export interface AddNongDuDeviceReq {
  deviceSn: string;
  name: string;
  area: string;
}

export interface UpdateNongDuDeviceReq extends AddNongDuDeviceReq {
  nongDuDeviceId: number
}

export interface NongDuDeviceListReq extends BasePageQuery {
  deviceSn?: string;
  area?: string;
}

export interface NongDuDeviceRow extends UpdateNongDuDeviceReq {

}