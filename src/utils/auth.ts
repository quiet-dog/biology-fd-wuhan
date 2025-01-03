import Cookies from "js-cookie";
import { storageSession } from "@pureadmin/utils";
import { useUserStoreHook } from "@/store/modules/user";
import { aesEncrypt, aesDecrypt } from "@/utils/crypt";
import { TokenDTO } from "@/api/common/login";

/**
 * 原版前端token实现
 */
export interface DataInfo<T> {
  /** token */
  accessToken: string;
  /** `accessToken`的过期时间（时间戳） */
  expires: T;
  /** 用于调用刷新accessToken的接口时所需的token */
  refreshToken: string;
  /** 用户名 */
  username?: string;
  /** 当前登陆用户的角色 */
  roles?: Array<string>;
}

export const sessionKey = "user-info";
export const tokenKey = "authorized-token";
export const isRememberMeKey = "ag-is-remember-me";
export const passwordKey = "ag-password";

/** 获取`token` */
export function getToken(): TokenDTO {
  // 此处与`TokenKey`相同，此写法解决初始化时`Cookies`中不存在`TokenKey`报错
  return Cookies.get(tokenKey)
    ? JSON.parse(Cookies.get(tokenKey))
    : storageSession().getItem<TokenDTO>(sessionKey)?.token;
}

/**
 * 后端处理token
 */
export function setTokenFromBackend(data: TokenDTO): void {
  const cookieString = JSON.stringify(data);
  Cookies.set(tokenKey, cookieString);

  useUserStoreHook().SET_USERNAME(data.currentUser.userInfo.username);
  useUserStoreHook().SET_ROLES([data.currentUser.roleKey]);
  storageSession().setItem(sessionKey, data);
}

/** 删除`token`以及key值为`user-info`的session信息 */
export function removeToken() {
  Cookies.remove(tokenKey);
  sessionStorage.clear();
}

/** 将密码存入localStorage中 */
export function savePassword(password: string) {
  // base64加密
  const base64Password = btoa(password);
  localStorage.setItem(passwordKey, base64Password);
}

/** 将密码从localStorage中删除 */
export function removePassword() {
  localStorage.removeItem(passwordKey);
}

/** 获取密码 并解密 */
export function getPassword(): string {
  if (localStorage.getItem(passwordKey)) {
    const base64Password = localStorage.getItem(passwordKey);
    return atob(base64Password);
  }
  return "";
}

// 用户名 localStorage
export function getUsername(): string {
  return localStorage.getItem("username") || "";
}

export function saveUsername(username: string) {
  localStorage.setItem("username", username);
}

export function saveIsRememberMe(isRememberMe: boolean) {
  localStorage.setItem(isRememberMeKey, isRememberMe.toString());
}

export function getIsRememberMe() {
  const value = localStorage.getItem(isRememberMeKey);
  return value === "true";
}

/** 格式化token（jwt格式） */
export const formatToken = (token: string): string => {
  return "Bearer " + token;
};
