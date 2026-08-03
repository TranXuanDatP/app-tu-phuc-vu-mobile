import { useEffect } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { ShieldCheck, UserPlus } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSession } from "@/lib/auth-client";
import { colors } from "@/theme/colors";

/**
 * Shown after OTP when the user has NO Customer 360 match (new phone).
 * "Bạn chưa đăng ký tài khoản" → "Đăng ký ngay" (register form) or "Bỏ qua"
 * (continue in limited mode — dashboard with gated features).
 */
export default function NotRegisteredScreen() {
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session) router.replace("/login");
  }, [session, isPending]);

  if (isPending) return <View className="flex-1 bg-foam" />;

  return (
    <View className="flex-1 bg-foam">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <LinearGradient
          colors={[colors.deep, colors.aqua]}
          style={{ paddingHorizontal: 24, paddingBottom: 32, paddingTop: 64 }}
        >
          <View className="mb-4 h-[70px] w-[70px] items-center justify-center self-center rounded-[22px] bg-white/20">
            <UserPlus color="white" size={32} />
          </View>
          <Text className="text-center text-2xl font-extrabold text-white">
            Bạn chưa đăng ký tài khoản
          </Text>
          <Text className="mt-1.5 text-center text-[13.5px] text-white/90">
            Số điện thoại chưa có hồ sơ khách hàng. Đăng ký để sử dụng dịch vụ nước.
          </Text>
          <Text className="mt-1 text-center text-[12px] text-white/70">
            Nếu bạn là khách hàng của QUAWACO, liên hệ tổng đài để được hỗ trợ.
          </Text>
        </LinearGradient>

        <View className="flex-1 gap-3 px-6 py-6">
          <Pressable
            onPress={() => router.push("/register")}
            className="h-[52px] w-full items-center justify-center rounded-[14px] bg-deep active:opacity-80"
          >
            <Text className="text-[15.5px] font-extrabold text-white">Đăng ký ngay</Text>
          </Pressable>

          <Pressable onPress={() => router.replace("/dashboard")} className="py-1">
            <Text className="text-center text-[13.5px] font-semibold text-aqua">
              Bỏ qua — dùng chế độ giới hạn
            </Text>
          </Pressable>

          <View className="mt-2 flex-row items-start gap-1.5">
            <ShieldCheck size={14} color={colors.mutedForeground} />
            <Text className="flex-1 text-[11.5px] leading-relaxed text-muted-foreground">
              Chế độ giới hạn cho phép xem trang chủ và hỗ trợ. Các tính năng như hóa đơn, tiêu thụ,
              thanh toán cần đăng ký hồ sơ khách hàng.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
