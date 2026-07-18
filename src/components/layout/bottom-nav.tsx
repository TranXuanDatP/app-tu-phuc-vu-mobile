import { Pressable, Text, View } from "react-native";
import { Droplet, Home, ReceiptText, Siren, UserRound } from "lucide-react-native";
import { cn } from "@/lib/utils";
import { colors } from "@/theme/colors";

/**
 * Props passed to a custom expo-router Tabs `tabBar`. Defined inline (rather than
 * importing from @react-navigation/bottom-tabs) because SDK 57 bundles its own
 * react-navigation copy under expo-router/build/react-navigation — the public type
 * isn't a stable import surface.
 */
type BottomTabBarProps = {
  state: {
    index: number;
    routes: { name: string; key: string }[];
  };
  // Loosely typed: the real react-navigation NavigationHelpers has an overloaded
  // `emit` whose `canPreventDefault` is the literal `true`, which doesn't structurally
  // match a hand-written signature. SDK 57 bundles its own react-navigation copy, so
  // there's no stable public type to import. Usage only needs emit + navigate.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigation: any;
};

const META: Record<string, { label: string; icon: typeof Home }> = {
  dashboard: { label: "Trang chủ", icon: Home },
  invoices: { label: "Hóa đơn", icon: ReceiptText },
  meters: { label: "Tiêu thụ", icon: Droplet },
  incidents: { label: "Sự cố", icon: Siren },
  profile: { label: "Tài khoản", icon: UserRound },
};

/** Custom bottom tab bar mirroring web FE BottomNav (5 tabs, active chip). */
export function BottomTabBar({ state, navigation }: BottomTabBarProps) {
  return (
    <View className="flex-row border-t border-line bg-card px-1.5 pb-4 pt-2">
      {state.routes.map((route, index) => {
        const meta = META[route.name];
        if (!meta) return null; // skip pushed-flow routes (payments/contracts/notifications) — not tabs
        const Icon = meta.icon;
        const active = state.index === index;
        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!event.defaultPrevented) navigation.navigate(route.name);
        };
        return (
          <Pressable key={route.key} onPress={onPress} className="flex-1 items-center gap-1 py-1">
            <View className={cn("h-8 w-11 items-center justify-center rounded-xl", active && "bg-aqua-soft")}>
              <Icon size={20} color={active ? colors.deep : colors.mutedForeground} />
            </View>
            <Text
              className={cn("text-[10.5px] font-semibold", active ? "text-deep" : "text-muted-foreground")}
            >
              {meta.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
