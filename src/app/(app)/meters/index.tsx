import { ScrollView, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronRight, TrendingDown, TrendingUp, Wrench } from "lucide-react-native";
import Svg, { Circle } from "react-native-svg";
import { useConsumption } from "@/features/meters/queries";
import { Skeleton } from "@/components/ui";
import { formatNumber } from "@/lib/utils";
import { colors } from "@/theme/colors";

/** Consumption ring (SVG) — current month vs the period peak. */
function Ring({ pct, volume }: { pct: number; volume: number }) {
  const size = 96;
  const stroke = 9;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (Math.min(pct, 100) / 100) * c;
  return (
    <View className="items-center justify-center">
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.aquaSoft} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.aqua}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${dash} ${c - dash}`}
          strokeLinecap="round"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View className="absolute items-center">
        <Text className="text-xl font-extrabold text-white">{formatNumber(volume)}</Text>
        <Text className="text-[10px] text-white/70">m³</Text>
      </View>
    </View>
  );
}

export default function UsageScreen() {
  const { data, isLoading } = useConsumption();
  const readings = (data?.readings ?? []).slice().sort((a, b) => a.month.localeCompare(b.month));
  const current = readings.at(-1);
  const previous = readings.at(-2);
  const peak = readings.reduce((m, r) => Math.max(m, r.volume), 0);
  const delta = current && previous ? current.volume - previous.volume : 0;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }}>
        <View>
          <Text className="text-2xl font-extrabold text-foreground">Tiêu thụ nước</Text>
          <Text className="mt-0.5 text-sm text-muted-foreground">Theo dõi lượng nước sử dụng</Text>
        </View>

        {/* Current month hero */}
        {isLoading || !current ? (
          <Skeleton className="h-40 w-full rounded-2xl" />
        ) : (
          <View className="flex-row items-center gap-4 rounded-2xl bg-deep p-5">
            <Ring pct={peak > 0 ? Math.round((current.volume / peak) * 100) : 0} volume={current.volume} />
            <View className="flex-1">
              <Text className="text-xs text-white/80">Kỳ hiện tại · {current.month}</Text>
              <View className="mt-1 flex-row items-center gap-1.5">
                {delta > 0 ? (
                  <TrendingUp size={16} color="#fce6e1" />
                ) : delta < 0 ? (
                  <TrendingDown size={16} color="#e1f3ec" />
                ) : null}
                <Text className="text-sm font-semibold text-white">
                  {delta === 0
                    ? "Không đổi"
                    : `${delta > 0 ? "+" : ""}${formatNumber(delta)} m³ so với kỳ trước`}
                </Text>
              </View>
              <Text className="mt-1 text-[11px] text-white/70">
                Cao nhất 12 tháng: {formatNumber(peak)} m³
              </Text>
            </View>
          </View>
        )}

        {/* Meter history button */}
        <Pressable
          onPress={() => router.push("/meters/history")}
          className="flex-row items-center gap-3 rounded-2xl border border-line bg-card p-4 active:opacity-80"
        >
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-aqua-soft">
            <Wrench size={18} color={colors.deep} />
          </View>
          <View className="flex-1">
            <Text className="text-[15px] font-bold text-foreground">Lịch sử đồng hồ</Text>
            <Text className="text-xs text-muted-foreground">Lắp đặt, hiệu chuẩn, thay thế</Text>
          </View>
          <ChevronRight size={18} color={colors.mutedForeground} />
        </Pressable>

        {/* Readings history */}
        <View className="gap-2">
          <Text className="text-sm font-bold text-foreground">Lịch sử tiêu thụ</Text>
          {isLoading ? (
            <View className="gap-2">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </View>
          ) : (
            readings
              .slice()
              .reverse()
              .map((r) => (
                <View key={r.month} className="flex-row items-center justify-between rounded-xl border border-line bg-card px-4 py-3">
                  <Text className="text-sm font-semibold text-foreground">{r.month}</Text>
                  <View className="flex-row items-center gap-3">
                    <Text className="text-sm font-bold text-deep">{formatNumber(r.volume)} m³</Text>
                    {r.volume === peak ? <Text className="text-[10px] font-semibold text-warning">↓ Cao nhất</Text> : null}
                  </View>
                </View>
              ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
