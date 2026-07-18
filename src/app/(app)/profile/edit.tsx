import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppBar } from "@/components/layout/app-bar";
import { FormField } from "@/components/ui/form-field";
import { Skeleton } from "@/components/ui";
import { useCustomerProfile, useUpdateProfile } from "@/features/customers/queries";
import { router } from "expo-router";

export default function EditProfileScreen() {
  const { data: p, isLoading } = useCustomerProfile();
  const update = useUpdateProfile();

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [contactAddress, setContactAddress] = useState("");

  // Prefill once the profile loads.
  useEffect(() => {
    if (p) {
      setPhone(p.contactInfo.phone ?? "");
      setEmail(p.contactInfo.email ?? "");
      setContactAddress(p.contactInfo.contactAddress ?? "");
    }
  }, [p]);

  function submit() {
    update.mutate(
      { phone, email, contactAddress },
      {
        onSuccess: () => {
          // success toast handled in the hook
          router.back();
        },
      },
    );
  }

  if (isLoading || !p) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-background">
        <AppBar title="Cập nhật liên hệ" />
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <AppBar title="Cập nhật liên hệ" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }}>
        <Text className="text-sm text-muted-foreground">
          Cập nhật thông tin liên hệ để nhận thông báo và hóa đơn đúng kênh.
        </Text>

        <FormField label="Số điện thoại" value={phone} onChangeText={setPhone} placeholder="09xx xxx xxx" keyboardType="phone-pad" />
        <FormField label="Email" value={email} onChangeText={setEmail} placeholder="email@example.com" keyboardType="email-address" />
        <FormField
          label="Địa chỉ liên hệ"
          value={contactAddress}
          onChangeText={setContactAddress}
          placeholder="Địa chỉ nhận thư"
          multiline
          className="items-start py-2"
        />

        <Pressable
          onPress={submit}
          disabled={update.isPending}
          className="mt-2 items-center rounded-xl bg-deep py-3.5 active:opacity-80 disabled:opacity-60"
        >
          <Text className="text-[15px] font-extrabold text-white">
            {update.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
