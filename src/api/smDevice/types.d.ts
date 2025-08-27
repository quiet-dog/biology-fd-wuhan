export interface AddSmDeviceReq {
  deviceSn: string;
  personnelId: number;
  name: string;
  area: string;
  lastTimeStr?: string;
}

export interface UpdateSmDeviceReq extends AddSmDeviceReq {
  smDeviceId: number
}

export interface SmDeviceListReq extends Omit<AddSmDeviceReq, 'personnelId'>, BasePageQuery {
  personnelName: string;
  online?: string
  smDeviceIds?: number[];
}

export interface SmDeviceRow extends UpdateSmDeviceReq {

}


export interface GetSmThresholdRes {
  type: string;
  data: SmThreshold[];
}

export interface SetSmThreshold {
  id: number;
  data: SmThresholdData[];
}


export interface SmThresholdData {
  type: string;
  values: SmThreshold[];
}

export interface SmThreshold {
  smDeviceId: number
  min: number;
  max: number;
  type: string;
  level: string;
}