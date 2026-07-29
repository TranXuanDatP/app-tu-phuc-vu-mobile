import { Pressable, ScrollView, Text, View } from "react-native";
import { Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronRight, LogOut, Mail, MapPin, MessageSquare, Phone } from "lucide-react-native";
import { useCustomerProfile } from "@/features/customers/queries";
import { useSignOut } from "@/features/auth/hooks";
import { Skeleton } from "@/components/ui";
import { toast } from "@/lib/toast";
import { colors } from "@/theme/colors";

const CLASSIFICATION: Record<string, string> = {
  sinh_hoat: "Sinh hoạt",
  san_xuat: "Sản xuất",
  hanh_chinh: "Hành chính",
};

const HOTLINE = "19001008";

export default function ProfileScreen() {
  const profile = useCustomerProfile();
  const signOut = useSignOut();
  const p = profile.data;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }}>
        <Text className="text-2xl font-extrabold text-foreground">Tài khoản</Text>

        {/* Identity */}
        {profile.isLoading || !p ? (
          <Skeleton className="h-24 w-full rounded-2xl" />
        ) : (
          <View className="rounded-2xl border border-line bg-card p-5">
            <Text className="text-lg font-extrabold text-foreground">{p.fullName}</Text>
            <Text className="mt-0.5 text-xs text-muted-foreground">Mã KH: {p.customerId}</Text>
            <Text className="mt-0.5 text-xs text-muted-foreground">
              {CLASSIFICATION[p.classification] ?? p.classification}
            </Text>
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
          <View className="gap-3 rounded-2xl border border-line bg-card p-4">
            <Row icon={<Phone size={16} color={colors.deep} />} label="Điện thoại" value={p?.contactInfo.phone} />
            <Row icon={<Mail size={16} color={colors.deep} />} label="Email" value={p?.contactInfo.email} />
            <Row icon={<MapPin size={16} color={colors.deep} />} label="Địa chỉ" value={p?.address?.fullAddress} />
          </View>
        </View>

        {/* Support */}
        <View className="gap-2">
          <Text className="px-1 text-sm font-bold text-foreground">Hỗ trợ</Text>
          <View className="rounded-2xl border border-line bg-card">
            <Pressable
              onPress={() => router.push("/chat")}
              className="flex-row items-center gap-3 border-b border-line px-4 py-3.5 active:opacity-70"
            >
              <MessageSquare size={18} color={colors.deep} />
              <Text className="flex-1 text-[14px] font-semibold text-foreground">Chat với nhân viên</Text>
              <ChevronRight size={16} color={colors.mutedForeground} />
            </Pressable>
            <Pressable
              onPress={() => Linking.openURL(`tel:${HOTLINE}`).catch(() => toast.error("Không gọi được"))}
              className="flex-row items-center gap-3 px-4 py-3.5 active:opacity-70"
            >
              <Phone size={18} color={colors.deep} />
              <Text className="flex-1 text-[14px] font-semibold text-foreground">Tổng đài</Text>
              <Text className="text-[13px] text-muted-foreground">{HOTLINE}</Text>
            </Pressable>
          </View>
        </View>

        {/* Logout */}
        <Pressable
          onPress={signOut}
          className="mt-2 flex-row items-center justify-center gap-2 rounded-xl border border-destructive/30 py-3.5 active:opacity-80"
        >
          <LogOut size={18} color={colors.destructive} />
          <Text className="text-sm font-bold text-destructive">Đăng xuất</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | null | undefined }) {
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
