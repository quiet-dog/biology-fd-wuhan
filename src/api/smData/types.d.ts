export interface AddSmDataReq {
  smDataId: number;        // sm_data_id
  smDeviceId: number;      // sm_device_id
  battery: number | null;  // battery
  co2: number | null;      // co2
  humility: number | null; // humility
  temp: number | null;     // temp
  huxi: number[];          // huxi
  sendTime: number;        // sendTime
  xinDian: number[];       // xin_dian
  xinlv: number | null;    // xinlv
  xueYang: number | null;  // xue_yang
}

export interface UpdateSmDataReq extends AddSmDataReq {
  smDataId: number
}

export interface SmDataListReq extends BasePageQuery {
  smDeviceSn?: string;
  smDataId?: number[];
  timeRange?: string;
}

export interface SmDataRow extends UpdateSmDataReq {

}