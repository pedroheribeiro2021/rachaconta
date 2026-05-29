const KEY = "rachaconta-user";

export function saveLocalNickname(nickname: string) {
  localStorage.setItem(KEY, nickname);
}

export function getLocalNickname() {
  return localStorage.getItem(KEY);
}
