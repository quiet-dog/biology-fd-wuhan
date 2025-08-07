export interface AddSmDeviceReq {
  deviceSn: string;
  personnelId: number;
  name: string;
  area: string;
}

export interface UpdateSmDeviceReq extends AddSmDeviceReq {
  smDeviceId: number
}

export interface SmDeviceListReq extends Omit<AddSmDeviceReq, 'personnelId'>, BasePageQuery {
  personnelName: string;
}

export interface SmDeviceRow extends UpdateSmDeviceReq {

}