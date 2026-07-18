import { Pressable, Text, View } from "react-native";
import { AlertCircle, RefreshCw } from "lucide-react-native";
import { Skeleton } from "./skeleton";
import { colors } from "@/theme/colors";

/** Shared list states — loading / empty / error+retry — for consistent UX across list screens. */

export function SkeletonList({ count = 3, height = 64 }: { count?: number; height?: number }) {
  return (
    <View className="gap-3 pt-2">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="w-full" style={{ height }} />
      ))}
    </View>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <View className="mt-16 items-center">
      <Text className="text-sm text-muted-foreground">{text}</Text>
    </View>
  );
}

export function ErrorRetry({ text, onRetry }: { text?: string; onRetry: () => void }) {
  return (
    <View className="mt-16 items-center gap-3">
      <AlertCircle size={32} color={colors.mutedForeground} />
      <Text className="text-sm text-muted-foreground">{text ?? "Không tải được dữ liệu"}</Text>
      <Pressable
        onPress={onRetry}
        className="flex-row items-center gap-1.5 rounded-xl border border-line bg-card px-4 py-2 active:opacity-80"
      >
        <RefreshCw size={14} color={colors.deep} />
        <Text className="text-sm font-semibold text-deep">Thử lại</Text>
      </Pressable>
    </View>
  );
}
