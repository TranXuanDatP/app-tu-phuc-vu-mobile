import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { Droplet, ShieldCheck } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FormField } from "@/components/ui/form-field";
import { useRegister } from "@/features/auth/hooks";
import { useSession } from "@/lib/auth-client";
import { toast } from "@/lib/toast";
import { ApiError } from "@/lib/types/api";
import { colors } from "@/theme/colors";
import type { CustomerClassification } from "@/lib/types/entities";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CLASSIFICATIONS: { value: CustomerClassification; label: string }[] = [
  { value: "sinh_hoat", label: "Sinh hoạt" },
  { value: "san_xuat", label: "Sản xuất" },
  { value: "hanh_chinh", label: "Hành chính" },
];

type FieldErrors = {
  fullName?: string;
  classification?: string;
  street?: string;
  ward?: string;
  district?: string;
  city?: string;
  email?: string;
};

interface AddressState {
  street: string;
  ward: string;
  district: string;
  city: string;
}

/**
 * New-customer registration (replaces complete-profile). Collects the info needed
 * to create a Customer 360 record — Họ tên, phân loại, a structured address (+ optional
 * email). CCCD / identity verification is NOT part of registration (a separate, undecided
 * plan). Submit → POST /auth/register → the BFF creates a customer (mock-first) + links it
 * to the auth user, then routes to the dashboard with full access.
 */
export default function RegisterScreen() {
  const { data: session, isPending } = useSession();
  const register = useRegister();
  const [fullName, setFullName] = useState("");
  const [classification, setClassification] = useState<CustomerClassification>("sinh_hoat");
  const [address, setAddress] = useState<AddressState>({ street: "", ward: "", district: "", city: "" });
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (!isPending && !session) router.replace("/login");
  }, [session, isPending]);

  if (isPending) return <View className="flex-1 bg-foam" />;

  function setAddr(field: keyof AddressState, value: string) {
    setAddress((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
  }

  function validate(): boolean {
    const next: FieldErrors = {};
    if (fullName.trim().length < 2) next.fullName = "Nhập họ tên (tối thiểu 2 ký tự)";
    if (!address.street.trim()) next.street = "Nhập số nhà + đường";
    if (!address.ward.trim()) next.ward = "Nhập phường/xã";
    if (!address.district.trim()) next.district = "Nhập quận/huyện";
    if (!address.city.trim()) next.city = "Nhập tỉnh/thành phố";
    if (email.trim() && !EMAIL_RE.test(email.trim())) next.email = "Email không hợp lệ";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    try {
      await register.mutateAsync({
        fullName: fullName.trim(),
        classification,
        address: {
          street: address.street.trim(),
          ward: address.ward.trim(),
          district: address.district.trim(),
          city: address.city.trim(),
        },
        ...(email.trim() ? { email: email.trim() } : {}),
      });
      toast.success("Đăng ký thành công. Chào mừng bạn!");
      router.replace("/dashboard");
    } catch (err) {
      // 409 CUSTOMER_EXISTS_USE_BIND — a customer for this phone already exists (race tail
      // or re-resolve). The register branch is resolve-gated against exactly this; reroute
      // to the bind (challenge) flow instead of showing a generic error.
      if (err instanceof ApiError && err.code === "CUSTOMER_EXISTS_USE_BIND") {
        toast.info("Khách hàng đã tồn tại với số này — chuyển sang liên kết tài khoản.");
        router.replace("/bind");
      } else {
        toast.error((err as { message?: string })?.message ?? "Không đăng ký được. Thử lại.");
      }
    }
  }

  return (
    <View className="flex-1 bg-foam">
      {/* iOS: keyboard đè lên view (không adjustResize như Android) — không có
          KAV thì phần form dưới bàn phím kéo cỡ nào cũng không thấy được. */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <LinearGradient
          colors={[colors.deep, colors.aqua]}
          style={{ paddingHorizontal: 24, paddingBottom: 32, paddingTop: 64 }}
        >
          <View className="mb-4 h-[70px] w-[70px] items-center justify-center self-center rounded-[22px] bg-white/20">
            <Droplet color="white" size={32} />
          </View>
          <Text className="text-center text-2xl font-extrabold text-white">Đăng ký dịch vụ nước</Text>
          <Text className="mt-1.5 text-center text-[13.5px] text-white/90">
            Cung cấp thông tin để mở hồ sơ khách hàng
          </Text>
        </LinearGradient>

        {/* KHÔNG dùng flex-1 cho form trong ScrollView: Yoga co form theo viewport
            thay vì tràn xuống → ScrollView thấy content vừa khít → không kéo được
            (anti-pattern RN — 2 trường cuối kẹt dưới bàn phím). */}
        <View className="gap-4 px-6 py-6">
          <FormField
            label="Họ và tên"
            placeholder="Nguyễn Văn A"
            value={fullName}
            onChangeText={(v) => {
              setFullName(v);
              if (errors.fullName) setErrors((p) => ({ ...p, fullName: undefined }));
            }}
            error={errors.fullName}
            className="h-[52px] rounded-[13px] text-base"
          />

          {/* Classification segmented control */}
          <View className="gap-1.5">
            <Text className="text-[12.5px] font-semibold text-muted-foreground">Phân loại khách hàng</Text>
            <View className="flex-row gap-2">
              {CLASSIFICATIONS.map((c) => {
                const active = classification === c.value;
                return (
                  <Pressable
                    key={c.value}
                    onPress={() => setClassification(c.value)}
                    className={`flex-1 items-center rounded-[13px] border-[1.5px] py-3 ${
                      active ? "border-deep bg-deep" : "border-line bg-card"
                    }`}
                  >
                    <Text className={`text-[13px] font-semibold ${active ? "text-white" : "text-muted-foreground"}`}>
                      {c.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Structured address */}
          <View className="gap-3">
            <Text className="text-[12.5px] font-semibold text-muted-foreground">Địa chỉ lắp đồng hồ</Text>
            <FormField
              label="Số nhà + đường"
              placeholder="123 Lê Lợi"
              value={address.street}
              onChangeText={(v) => setAddr("street", v)}
              error={errors.street}
              className="h-[48px] rounded-[12px] text-[15px]"
            />
            <FormField
              label="Phường / Xã"
              placeholder="Phường Hải Châu 1"
              value={address.ward}
              onChangeText={(v) => setAddr("ward", v)}
              error={errors.ward}
              className="h-[48px] rounded-[12px] text-[15px]"
            />
            <FormField
              label="Quận / Huyện"
              placeholder="Quận Hải Châu"
              value={address.district}
              onChangeText={(v) => setAddr("district", v)}
              error={errors.district}
              className="h-[48px] rounded-[12px] text-[15px]"
            />
            <FormField
              label="Tỉnh / Thành phố"
              placeholder="Đà Nẵng"
              value={address.city}
              onChangeText={(v) => setAddr("city", v)}
              error={errors.city}
              className="h-[48px] rounded-[12px] text-[15px]"
            />
          </View>

          <FormField
            label="Email (tuỳ chọn)"
            placeholder="nguyenvana@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
            }}
            error={errors.email}
            className="h-[52px] rounded-[13px] text-base"
          />

          <Pressable
            onPress={handleSubmit}
            disabled={register.isPending}
            className="mt-1 h-[52px] w-full items-center justify-center rounded-[14px] bg-deep disabled:opacity-60"
          >
            <Text className="text-[15.5px] font-extrabold text-white">
              {register.isPending ? "Đang đăng ký..." : "Đăng ký"}
            </Text>
          </Pressable>

          <Pressable onPress={() => router.replace("/dashboard")} className="py-1">
            <Text className="text-center text-[13.5px] font-semibold text-aqua">
              Bỏ qua — dùng chế độ giới hạn
            </Text>
          </Pressable>

          <View className="mt-2 flex-row items-start gap-1.5">
            <ShieldCheck size={14} color={colors.mutedForeground} />
            <Text className="flex-1 text-[11.5px] leading-relaxed text-muted-foreground">
              Thông tin của bạn được bảo mật theo quy định. Xác thực định danh (CCCD) sẽ được bổ sung sau.
            </Text>
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
