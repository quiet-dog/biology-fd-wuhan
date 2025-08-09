export interface AddResultShiJuanReq {

}

export interface UpdateResultShiJuanReq extends AddResultShiJuanReq {

}

export interface ResultShiJuanListReq extends BasePageQuery {
  userName?: string;
  types?: string[];
  deptIds?: number[];
  userId?: number;
  isNeedLastTime?: boolean;
  isNull?: string[];
  isNotNull?: string[];
  deptName?: string;
  type?: string
}

export interface ShiJuanListReq extends BasePageQuery {
  type?: string;
}

export interface Score {
  xlShiJuanId: number;
  result: string
}


export interface SetResult {
  resultId: number;
  result: Score[];
  useTime: number;
}

export interface SetGanYu {
  resultId: number;
  ganYuFangShi: string | null;
  ganYuTime: number | null;
  execUser: string | null;
  ganYuResult: string | null;
}

export interface ResultShiJuanRow extends UpdateResultShiJuanReq {
  resultId: number;
  type: string;
  score: number;
  xlShiJuanId: number;
  xlFangAnId: number;
  result: Score[];
  lastTime: number;

  userId: number | null;
  userJobCode: string | null;
  userNickname: string | null;
  startTime: number | null;
  useTime: number | null;
  cePing: string | null;
  ganYuFangShi: string | null;
  ganYuTime: number | null;
  execUser: string | null;
  ganYuResult: string | null;

}