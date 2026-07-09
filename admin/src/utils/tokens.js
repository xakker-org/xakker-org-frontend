const ACCESS_KEY = "xakker_admin_access";
const REFRESH_KEY = "xakker_admin_refresh";

function activeStorage() {
  return localStorage.getItem(REFRESH_KEY) ? localStorage : sessionStorage;
}

// `remember` picks the storage at login time: localStorage persists across
// browser restarts, sessionStorage clears when the tab closes. Omitting it
// (silent token refresh) keeps writing to whichever storage is already active.
export function setTokens(access, refresh, remember) {
  const storage = remember === undefined ? activeStorage() : remember ? localStorage : sessionStorage;
  const other = storage === localStorage ? sessionStorage : localStorage;
  storage.setItem(ACCESS_KEY, access);
  storage.setItem(REFRESH_KEY, refresh);
  other.removeItem(ACCESS_KEY);
  other.removeItem(REFRESH_KEY);
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY) || sessionStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY) || sessionStorage.getItem(REFRESH_KEY);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  sessionStorage.removeItem(ACCESS_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
}
