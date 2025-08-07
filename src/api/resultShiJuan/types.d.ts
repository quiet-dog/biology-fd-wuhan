export interface AddResultShiJuanReq {

}

export interface UpdateResultShiJuanReq extends AddResultShiJuanReq {

}

export interface ResultShiJuanListReq extends BasePageQuery {
  userName?: string;
  types?: string[];
  deptIds?: number[];
}

export interface Score {
  xlShiJuanId: number;
  result: string
}

export interface ResultShiJuanRow extends UpdateResultShiJuanReq {
  resultId: number;
  type: string;
  score: number;
  xlShiJuanId: number;
  xlFangAnId: number;
  result: Score[];
  lastTime: number;
}