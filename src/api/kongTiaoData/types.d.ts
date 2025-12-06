export interface AddKongTiaoDataReq {
  deviceSn?: string;
  name?: string;
  area?: string;
  deviceType?: string;
}

export interface UpdateKongTiaoDataReq extends AddKongTiaoDataReq {
  kongTiaoDataId: number;
}

export interface KongTiaoDataListReq extends BasePageQuery {
  kongTiaoDataId: number;          // Long -> number
  deviceSn: string;

  zhiBanGongKuanYaLiSheDing: number | null;
  zhiBanGongKuanFengLiangSheDing: number | null;

  fengFaWenDingZhuangTai: number | null;
  faWeiFanKuan: number | null;
  qiangZhiFaWeiSheDing: number | null;
  qiangZhiMoShiKaiGuan: number | null;
  pidKongZhiJiFenXiShu: number | null;
  fengLiangFanKuan: number | null;

  fangJianShiJiYaLi: number | null;
  gongKuangMoShi: string;

  shuangGongKuangQieHuanShiJian: number | null;
  fengLiangSheDing: number | null;
  yaLiSheDing: number | null;

  deviceType: string;

  huiFengJiShouZiDong: string;
  huiFengJiGuZhang: string;
  huiFengJiYunXing: string;

  huiFengMiBiKaiGuanKongZhi: string;
  huiFengMiBiGuanDaoWei: string;
  huiFengMiBiKaiDaoWei: string;
  huiFengJiQiTing: string;

  yuanXinFengKouZengJiaXinFengFaKaiGuanKongZhi: string;
  zengJiaXinFengKouXinFengFaKaiGuanKongZhi: string;

  yuanXinFengKouZengJiaXinFengFaGuanDaoWei: string;
  zengJiaXinFengKouXinFengFaGuanDaoWei: string;

  yuanXinFengKouZengJiaXinFengFaKaiDaoWei: string;
  zengJiaXinFengKouXinFengFaKaiDaoWei: string;

  moShiQieHuan: string;
  gongKuangQieHuan: string;
  huiFengJiPinLvFanKuan: string;

  paiFengFaZhiGuanFengFaFanKuan: string;
}

export type KongTiaoDataRow = UpdateKongTiaoDataReq;