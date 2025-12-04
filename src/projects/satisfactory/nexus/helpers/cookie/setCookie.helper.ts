type Args = {
  name: string;
  value: string;
  hours: number;
};

export const setCookie = ({ name, value, hours = 1 }: Args): void => {
  let expires = "";
  if (hours) {
    const date = new Date();
    date.setTime(date.getTime() + hours * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }
  document.cookie = `${name}=${value || ""}${expires}; path=/`;
};
