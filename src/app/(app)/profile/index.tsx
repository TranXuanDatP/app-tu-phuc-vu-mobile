import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronRight, LogOut, Mail, MapPin, Phone, UserCircle } from "lucide-react-native";
import { useCustomerProfile, useRelatedAccounts, useCustomerTimeline } from "@/features/customers/queries";
import { useSignOut } from "@/features/auth/hooks";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";
import { colors } from "@/theme/colors";

const CLASSIFICATION: Record<string, string> = {
  sinh_hoat: "Sinh hoạt",
  san_xuat: "Sản xuất",
  hanh_chinh: "Hành chính",
};

export default function ProfileScreen() {
  const profile = useCustomerProfile();
  const related = useRelatedAccounts();
  const timeline = useCustomerTimeline();
  const signOut = useSignOut();

  const p = profile.data;
  const initials = (p?.fullName ?? "?")
    .split(" ")
    .map((w) => w[0])
    .slice(-2)
    .join("")
    .toUpperCase();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }}>
        {/* Identity */}
        {profile.isLoading || !p ? (
          <Skeleton className="h-28 w-full rounded-2xl" />
        ) : (
          <View className="flex-row items-center gap-4 rounded-2xl bg-deep p-5">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-white/15">
              <Text className="text-xl font-extrabold text-white">{initials}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-lg font-extrabold text-white">{p.fullName}</Text>
              <Text className="text-xs text-white/80">{p.customerId}</Text>
              <View className="mt-1.5 flex-row gap-2">
                <View className="rounded-full bg-white/15 px-2.5 py-0.5">
                  <Text className="text-[11px] font-semibold text-white">
                    {CLASSIFICATION[p.classification] ?? p.classification}
                  </Text>
                </View>
                {p.status === "active" ? (
                  <View className="rounded-full bg-mint/30 px-2.5 py-0.5">
                    <Text className="text-[11px] font-semibold text-white">Đang hoạt động</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        )}

        {/* Contact */}
        <View className="gap-2">
          <View className="flex-row items-center justify-between px-1">
            <Text className="text-sm font-bold text-foreground">Liên hệ</Text>
            <Pressable onPress={() => router.push("/profile/edit")} className="flex-row items-center gap-1">
              <Text className="text-[13px] font-semibold text-aqua">Cập nhật</Text>
              <ChevronRight size={14} color={colors.aqua} />
            </Pressable>
          </View>
          {p ? (
            <View className="gap-3 rounded-2xl border border-line bg-card p-4">
              <ContactRow icon={<Phone size={16} color={colors.deep} />} label="Điện thoại" value={p.contactInfo.phone} />
              <ContactRow icon={<Mail size={16} color={colors.deep} />} label="Email" value={p.contactInfo.email} />
              <ContactRow icon={<MapPin size={16} color={colors.deep} />} label="Địa chỉ" value={p.contactInfo.contactAddress} />
            </View>
          ) : null}
          {p?.address.fullAddress ? (
            <View className="flex-row gap-2 rounded-xl border border-line bg-card p-3.5">
              <MapPin size={16} color={colors.mutedForeground} />
              <Text className="flex-1 text-[13px] text-muted-foreground">{p.address.fullAddress}</Text>
            </View>
          ) : null}
        </View>

        {/* Related accounts */}
        {(related.data?.accounts ?? []).length > 0 ? (
          <View className="gap-2">
            <Text className="px-1 text-sm font-bold text-foreground">Tài khoản liên quan</Text>
            {(related.data?.accounts ?? []).map((a) => (
              <View key={a.customerId} className="flex-row items-center gap-3 rounded-xl border border-line bg-card p-3.5">
                <UserCircle size={20} color={colors.deep} />
                <View className="flex-1">
                  <Text className="text-[13px] font-semibold text-foreground">{a.name}</Text>
                  <Text className="text-xs text-muted-foreground">
                    {a.relationshipType}
                    {a.address ? ` · ${a.address}` : ""}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {/* Timeline */}
        {(timeline.data?.entries ?? []).length > 0 ? (
          <View className="gap-2">
            <Text className="px-1 text-sm font-bold text-foreground">Hoạt động gần đây</Text>
            {(timeline.data?.entries ?? [])
              .slice(0, 5)
              .map((e, i) => (
                <View key={i} className="gap-0.5 rounded-xl border border-line bg-card p-3.5">
                  <Text className="text-[13px] font-semibold text-foreground">{e.summary}</Text>
                  <Text className="text-xs text-muted-foreground">
                    {formatDateTime(e.timestamp)}
                    {e.channel ? ` · ${e.channel}` : ""}
                  </Text>
                </View>
              ))}
          </View>
        ) : null}

        {/* Logout */}
        <Pressable
          onPress={signOut}
          className="mt-2 flex-row items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 py-3.5 active:opacity-80"
        >
          <LogOut size={18} color={colors.destructive} />
          <Text className="text-sm font-bold text-destructive">Đăng xuất</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function ContactRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
}) {
  return (
    <View className="flex-row items-center gap-3">
      {icon}
      <View className="flex-1">
        <Text className="text-[11px] text-muted-foreground">{label}</Text>
        <Text className="text-[13px] font-semibold text-foreground">{value || "—"}</Text>
      </View>
    </View>
  );
}
