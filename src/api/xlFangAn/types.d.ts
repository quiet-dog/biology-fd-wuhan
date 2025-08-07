export interface AddXlFangAnReq {
  name: string;
  userIds: number[];
  shiJuanTypes: string[];
}

export interface UpdateXlFangAnReq extends AddXlFangAnReq {
  xlFangAnId: number;           // id
}

export interface XlFangAnListReq extends BasePageQuery {
  seatNumer?: string;
  name?: string;
}

export interface XlFangAnRow extends UpdateXlFangAnReq {

}