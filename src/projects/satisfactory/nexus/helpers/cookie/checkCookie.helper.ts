import { getIsNotNullorUndefined } from "../data/getIsNotNullorUndefined.helper";
import { getCookie } from "./getCookie.helper";

export const checkCookie = (name: string): boolean => {
  const cookie = getCookie(name);
  return getIsNotNullorUndefined(cookie);
};
