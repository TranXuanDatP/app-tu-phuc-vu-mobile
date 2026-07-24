import { useEffect, useState } from "react";
import { AppState } from "react-native";

/**
 * Whether the app is in the foreground ("active"). RN's `setInterval` keeps
 * running when the app is backgrounded, so React Query's polling (and any other
 * timed work) must be gated on this to avoid wasted background requests.
 *
 * React Query's own `refetchIntervalInBackground` is web-only (it checks
 * `document.visibilityState`, which doesn't exist on RN) — so we pause polling
 * explicitly via this hook inside `useProfileStatus`.
 */
export function useAppActive(): boolean {
  const [active, setActive] = useState(AppState.currentState === "active");

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      setActive(state === "active");
    });
    return () => subscription.remove();
  }, []);

  return active;
}
