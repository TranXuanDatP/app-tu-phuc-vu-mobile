import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { QrCode, ShieldCheck } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Input } from "@/components/ui/input";
import { useSession } from "@/lib/auth-client";
import { apiClient } from "@/lib/api-client";
import { toast } from "@/lib/toast";
import { linkedKh } from "@/lib/linked-kh";
import { colors } from "@/theme/colors";

export default function LinkKhScreen() {
  const { data: session, isPending } = useSession();
  const [maKh, setMaKh] = useState("");

  useEffect(() => {
    if (!isPending && !session) router.replace("/login");
  }, [session, isPending]);

  async function linkAndContinue() {
    if (!maKh.trim()) return;
    try {
      const result = await apiClient.post<{ matched: boolean; customer?: { customerId?: string } }>(
        "/auth/link-customer",
        { maKh: maKh.trim() },
      );
      if (result?.matched) {
        await linkedKh.set(result.customer?.customerId ?? maKh.trim());
        toast.success(`Đã liên kết mã KH ${maKh.trim()}`);
        router.replace("/dashboard");
      } else {
        toast.error("Không tìm thấy mã KH trong hệ thống");
      }
    } catch {
      toast.error("Lỗi kết nối — thử lại");
    }
  }

  function skip() {
    linkedKh.set("skip").then(() => router.replace("/dashboard"));
  }

  return (
    <View className="flex-1 bg-foam">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <LinearGradient colors={[colors.deep, colors.aqua]} style={{ paddingHorizontal: 24, paddingBottom: 32, paddingTop: 64 }}>
          <View className="mb-4 h-[70px] w-[70px] items-center justify-center self-center rounded-[22px] bg-white/20">
            <QrCode color="white" size={32} />
          </View>
          <Text className="text-center text-2xl font-extrabold text-white">Liên kết mã khách hàng</Text>
          <Text className="mt-1.5 text-center text-[13.5px] text-white/90">Bước cuối để bắt đầu</Text>
        </LinearGradient>

        <View className="flex-1 px-6 pt-6">
          <Pressable
            onPress={() => toast.info("Mở camera quét QR — demo")}
            className="mb-5 h-[180px] items-center justify-center rounded-[18px] border-2 border-dashed border-aqua bg-aqua-soft active:opacity-80"
          >
            <QrCode size={40} color={colors.deep} />
            <Text className="mt-2 text-base font-bold text-deep">Quét mã QR trên hóa đơn cũ</Text>
            <Text className="mt-1 text-xs text-deep/80">Đưa mã trên tờ hóa đơn giấy vào khung</Text>
          </Pressable>

          <Text className="mb-2 text-[12.5px] font-semibold text-muted-foreground">
            Hoặc nhập mã khách hàng thủ công
          </Text>
          <Input value={maKh} onChangeText={setMaKh} placeholder="VD: QN-0912345" className="h-[52px] rounded-[13px] text-base" />

          <Pressable
            onPress={linkAndContinue}
            disabled={!maKh.trim()}
            className="mt-5 h-[52px] w-full items-center justify-center rounded-[14px] bg-deep disabled:opacity-50"
          >
            <Text className="text-[15.5px] font-extrabold text-white">Liên kết & bắt đầu</Text>
          </Pressable>

          <Pressable onPress={skip} className="mt-3 w-full py-2">
            <Text className="text-center text-[13.5px] font-semibold text-aqua">Bỏ qua — liên kết sau</Text>
          </Pressable>

          <Text className="mt-5 text-center text-[12.5px] leading-relaxed text-muted-foreground">
            Hệ thống xác minh mã KH với Customer 360 & Hóa đơn trước khi liên kết vào tài khoản của bạn.
          </Text>

          <View className="mt-6 flex-row items-center justify-center gap-1.5">
            <ShieldCheck size={14} color={colors.mutedForeground} />
            <Text className="text-[11.5px] text-muted-foreground">Xác thực bảo mật bởi better-auth</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
