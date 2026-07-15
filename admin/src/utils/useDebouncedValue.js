import { useEffect, useState } from "react";

/**
 * Returns `value` delayed by `delay` ms — used to avoid firing a network
 * request on every keystroke in list-page search inputs (previously every
 * ResourceListPage/UsersPage/AdminsPage search box re-queried the API on
 * each keypress).
 */
export function useDebouncedValue(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
