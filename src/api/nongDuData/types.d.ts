export interface AddNongDuDataReq {
  deviceSn: string;
  area: string;
}

export interface UpdateNongDuDataReq extends AddNongDuDataReq {
  nongDuDataId: number
}

export interface NongDuDataListReq extends BasePageQuery {
  deviceSn?: string;
  area?: string;
}

export interface NongDuDataRow extends UpdateNongDuDataReq {

}