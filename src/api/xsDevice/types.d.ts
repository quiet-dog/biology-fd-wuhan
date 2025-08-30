export interface AddXsDeviceReq {
  deviceSn: string;
  name: string;
  area: string;
}

export interface UpdateXsDeviceReq extends AddXsDeviceReq {
  xsDeviceId: number
}

export interface XsDeviceListReq extends BasePageQuery {
  deviceSn?: string;
  area?: string;
  online?: string;
  workStatus?: string;
}

export interface XsDeviceRow extends UpdateXsDeviceReq {

}