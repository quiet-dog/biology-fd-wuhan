export interface AddXwDeviceReq {
  cameraId: string;
  name: string;
  seatNumber: string;
  content: string;
}

export interface UpdateXwDeviceReq extends AddXwDeviceReq {
  xwDeviceId: number
}

export interface XwDeviceListReq extends BasePageQuery {
  cameraId: string;
  seatNumber?: string;
  online?: string;
}

export interface XwDeviceRow extends UpdateXwDeviceReq {

}