import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronRight, LogOut, Mail, MapPin, MessageSquare, Phone, ShieldCheck } from "lucide-react-native";
import { useCustomerProfile } from "@/features/customers/queries";
import { useProfileStatus, useSignOut } from "@/features/auth/hooks";
import { ErrorRetry, Skeleton } from "@/components/ui";
import { HOTLINE, openHotline } from "@/lib/hotline";
import { BUILD_ID } from "@/lib/build";
import { colors } from "@/theme/colors";

const CLASSIFICATION: Record<string, string> = {
  sinh_hoat: "Sinh hoạt",
  san_xuat: "Sản xuất",
  hanh_chinh: "Hành chính",
};

/**
 * Identity block — BA trạng thái phân tách rõ (đừng gộp một empty-state):
 *  (3) query lỗi (vd 403 BINDING_REQUIRED nuốt thành loading) → ErrorRetry.
 *      Skeleton "vô hạn" thường là cái này, KHÔNG phải chưa có hồ sơ.
 *  (1) chưa liên kết (linked=false) → CTA đi /bind (khớp ProfileGate flip
 *      sang linked) — NGÕ CỤT kiểu "Chưa có hồ sơ" là sai nghiệp vụ ở đây.
 *  (2) đã liên kết nhưng hồ sơ rỗng (data=null) → "Chưa có hồ sơ" + hotline.
 */
export default function ProfileScreen() {
  const profile = useCustomerProfile();
  const me = useProfileStatus();
  const signOut = useSignOut();
  const p = profile.data;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }}>
        <Text className="text-2xl font-extrabold text-foreground">Tài khoản</Text>

        {/* Identity — 3 trạng thái (xem comment trên) */}
        {profile.isError ? (
          <ErrorRetry
            text="Không tải được hồ sơ. Kiểm tra kết nối rồi thử lại."
            onRetry={() => void profile.refetch()}
          />
        ) : !me.data?.linked && !me.isLoading ? (
          <View className="items-center gap-3 rounded-2xl border border-line bg-card p-6">
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-aqua-soft">
              <ShieldCheck size={26} color={colors.deep} />
            </View>
            <Text className="text-center text-[15px] font-bold text-foreground">
              Liên kết tài khoản để xem hồ sơ
            </Text>
            <Text className="text-center text-[12.5px] leading-relaxed text-muted-foreground">
              Xác minh bằng thông tin hóa đơn để mở khóa hồ sơ khách hàng của bạn.
            </Text>
            <Pressable
              onPress={() => router.push("/bind")}
              className="w-full items-center rounded-xl bg-deep py-3 active:opacity-80"
            >
              <Text className="text-[14px] font-extrabold text-white">Liên kết tài khoản</Text>
            </Pressable>
          </View>
        ) : profile.isLoading ? (
          <Skeleton className="h-24 w-full rounded-2xl" />
        ) : !p ? (
          <View className="items-center gap-2 rounded-2xl border border-line bg-card p-6">
            <Text className="text-[15px] font-bold text-foreground">Chưa có hồ sơ</Text>
            <Text className="text-center text-[12.5px] leading-relaxed text-muted-foreground">
              Tài khoản đã liên kết nhưng hồ sơ khách hàng đang trống. Vui lòng liên hệ
              tổng đài {HOTLINE} để được hỗ trợ.
            </Text>
            <Pressable
              onPress={() => void openHotline()}
              className="mt-1 flex-row items-center gap-2 rounded-xl border border-line px-4 py-2.5 active:opacity-80"
            >
              <Phone size={15} color={colors.deep} />
              <Text className="text-[13.5px] font-bold text-deep">Gọi tổng đài {HOTLINE}</Text>
            </Pressable>
          </View>
        ) : (
          <View className="rounded-2xl border border-line bg-card p-5">
            <Text className="text-lg font-extrabold text-foreground">{p.fullName}</Text>
            <Text className="mt-0.5 text-xs text-muted-foreground">Mã KH: {p.customerId}</Text>
            <Text className="mt-0.5 text-xs text-muted-foreground">
              {CLASSIFICATION[p.classification] ?? p.classification}
            </Text>
          </View>
        )}

        {/* Contact — chỉ có nghĩa khi đã có hồ sơ */}
        {p ? (
        <View className="gap-2">
          <View className="flex-row items-center justify-between px-1">
            <Text className="text-sm font-bold text-foreground">Liên hệ</Text>
            <Pressable onPress={() => router.push("/profile/edit")} className="flex-row items-center gap-1">
              <Text className="text-[13px] font-semibold text-aqua">Cập nhật</Text>
              <ChevronRight size={14} color={colors.aqua} />
            </Pressable>
          </View>
          <View className="gap-3 rounded-2xl border border-line bg-card p-4">
            <Row icon={<Phone size={16} color={colors.deep} />} label="Điện thoại" value={p.contactInfo.phone} />
            <Row icon={<Mail size={16} color={colors.deep} />} label="Email" value={p.contactInfo.email} />
            <Row icon={<MapPin size={16} color={colors.deep} />} label="Địa chỉ" value={p.address?.fullAddress} />
          </View>
        </View>
        ) : null}

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
              onPress={() => void openHotline()}
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

        {/* Build stamp — cùng nguồn với login (git hash lúc expo start) */}
        <Text className="mt-2 text-center text-[9px] text-muted-foreground/70">
          build {BUILD_ID}
        </Text>
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
