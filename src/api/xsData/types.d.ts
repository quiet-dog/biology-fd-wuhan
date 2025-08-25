export interface AddXsDataReq {
  deviceSn: string;
  area: string;
}

export interface UpdateXsDataReq extends AddXsDataReq {
  xsDataId: number
}

export interface XsDataListReq extends BasePageQuery {
  deviceSn?: string;
  area?: string;
}

export interface XsDataRow extends UpdateXsDataReq {

}