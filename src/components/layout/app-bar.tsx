import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { colors } from "@/theme/colors";

/**
 * Sub-page header (mirrors web FE app-bar). Sticky-ish row with a back chevron +
 * title/subtitle. Screens wrap the whole layout in <SafeAreaView edges={["top"]}>,
 * so AppBar itself doesn't manage the top inset.
 */
export function AppBar({
  title,
  subtitle,
  onBack,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}) {
  const router = useRouter();
  return (
    <View className="flex-row items-center gap-2 border-b border-line bg-card px-3 pb-3 pt-3">
      <Pressable
        onPress={() => (onBack ? onBack() : router.back())}
        hitSlop={10}
        className="mr-1 p-1"
      >
        <ChevronLeft size={24} color={colors.deep} />
      </Pressable>
      <View className="flex-1">
        <Text className="text-base font-bold text-foreground" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text className="text-xs text-muted-foreground" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
