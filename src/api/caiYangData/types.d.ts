export interface AddCaiYangDataReq {
  deviceSn: string;
  area: string;
}

export interface UpdateCaiYangDataReq extends AddCaiYangDataReq {
  caiYangDataId: number
}

export interface CaiYangDataListReq extends BasePageQuery {
  deviceSn?: string;
  area?: string;
}

export interface CaiYangDataRow extends UpdateCaiYangDataReq {

}