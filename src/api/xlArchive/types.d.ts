export interface AddXlArchiveReq {
  status?: number;
  userId?: number;
  personnelId: number;
}

export interface UpdateXlArchiveReq extends AddXlArchiveReq {
  xlArchiveId: number;           // id
}

export interface XlArchiveListReq extends BasePageQuery {
  name?: string;
  deptName?: string;
  userIds?: number[];
}

export interface XlArchiveRow extends UpdateXlArchiveReq {
  jobCode?: string;
  nickname?: string;
  deptName?: string;
  username?: string;
}