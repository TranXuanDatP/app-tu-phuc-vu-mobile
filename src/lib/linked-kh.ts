import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Client-side "linked customer" gate (web stored this in localStorage under
 * "linked-kh"). RN equivalent: AsyncStorage. It records that the user has linked
 * (or skipped linking) a Customer 360 record, so post-login they go straight to
 * the dashboard instead of the link-kh screen.
 */
const KEY = "linked-kh";

export const linkedKh = {
  get: () => AsyncStorage.getItem(KEY),
  set: (value: string) => AsyncStorage.setItem(KEY, value),
  remove: () => AsyncStorage.removeItem(KEY),
};
