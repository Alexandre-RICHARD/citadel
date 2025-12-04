export const getCookie = (name: string): string | undefined => {
  const decodedCookies = decodeURIComponent(document.cookie);
  const splitedCookies = decodedCookies
    .split(";")
    .map((cookie) => cookie.trim());
  const foundCookie = splitedCookies.find((cookie) => {
    return cookie.startsWith(`${name}=`);
  });
  if (foundCookie) {
    return foundCookie.substring(name.length + 1);
  }
  return undefined;
};
