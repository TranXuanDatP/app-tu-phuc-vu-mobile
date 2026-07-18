import { useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Camera, X } from "lucide-react-native";
import { AppBar } from "@/components/layout/app-bar";
import { FormField } from "@/components/ui/form-field";
import { useCreateReport, useUploadReportPhoto } from "@/features/incidents/queries";
import { toast } from "@/lib/toast";
import { colors } from "@/theme/colors";

const TYPES = [
  { value: "water_outage", label: "Mất nước" },
  { value: "water_quality", label: "Chất lượng nước" },
  { value: "low_pressure", label: "Yếu áp" },
  { value: "meter_issue", label: "Lỗi đồng hồ" },
  { value: "other", label: "Khác" },
];

export default function CreateReportScreen() {
  const [type, setType] = useState<string>("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [photoUris, setPhotoUris] = useState<string[]>([]);
  const create = useCreateReport();
  const uploadPhoto = useUploadReportPhoto();

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.7,
    });
    if (result.canceled) return;
    const a = result.assets[0];
    const res = await uploadPhoto.mutateAsync({
      asset: { uri: a.uri, name: a.fileName ?? undefined, type: a.mimeType ?? undefined },
    });
    setPhotoUris((p) => [...p, res.publicUrl]);
    toast.success("Đã thêm ảnh.");
  }

  function submit() {
    if (!type) {
      toast.error("Vui lòng chọn loại sự cố");
      return;
    }
    if (!description.trim()) {
      toast.error("Vui lòng mô tả sự cố");
      return;
    }
    create.mutate(
      {
        type,
        description: description.trim(),
        photoUrls: photoUris,
        location: { lat: 0, lng: 0, address: address.trim(), area: null },
      },
      {
        onSuccess: () => {
          toast.success("Đã gửi báo cáo sự cố.");
          router.back();
        },
      },
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <AppBar title="Báo sự cố" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }}>
        {/* Type */}
        <View className="gap-1.5">
          <Text className="text-[12.5px] font-semibold text-muted-foreground">Loại sự cố</Text>
          <View className="flex-row flex-wrap gap-2">
            {TYPES.map((t) => {
              const active = type === t.value;
              return (
                <Pressable
                  key={t.value}
                  onPress={() => setType(t.value)}
                  className={`rounded-full px-3.5 py-1.5 ${active ? "bg-deep" : "border border-line bg-card"}`}
                >
                  <Text className={`text-[13px] font-semibold ${active ? "text-white" : "text-muted-foreground"}`}>
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <FormField
          label="Mô tả chi tiết"
          value={description}
          onChangeText={setDescription}
          placeholder="Mô tả sự cố bạn gặp phải..."
          multiline
          numberOfLines={4}
          className="h-24 items-start py-2 text-top"
        />

        <FormField
          label="Địa chỉ"
          value={address}
          onChangeText={setAddress}
          placeholder="Số nhà, đường, phường..."
        />

        {/* Photos */}
        <View className="gap-1.5">
          <Text className="text-[12.5px] font-semibold text-muted-foreground">Ảnh minh họa</Text>
          <View className="flex-row flex-wrap gap-2">
            {photoUris.map((uri, i) => (
              <View key={i} className="relative">
                <Image source={{ uri }} className="h-20 w-20 rounded-xl" />
                <Pressable
                  onPress={() => setPhotoUris((p) => p.filter((_, idx) => idx !== i))}
                  className="absolute -right-1.5 -top-1.5 h-6 w-6 items-center justify-center rounded-full bg-destructive"
                >
                  <X size={14} color="white" />
                </Pressable>
              </View>
            ))}
            <Pressable
              onPress={pickPhoto}
              disabled={uploadPhoto.isPending}
              className="h-20 w-20 items-center justify-center gap-1 rounded-xl border-2 border-dashed border-aqua bg-aqua-soft/40 active:opacity-80"
            >
              <Camera size={20} color={colors.deep} />
              <Text className="text-[10px] font-semibold text-deep">
                {uploadPhoto.isPending ? "Đang tải..." : "Thêm ảnh"}
              </Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          onPress={submit}
          disabled={create.isPending}
          className="mt-2 items-center rounded-xl bg-deep py-3.5 active:opacity-80 disabled:opacity-60"
        >
          <Text className="text-[15px] font-extrabold text-white">
            {create.isPending ? "Đang gửi..." : "Gửi báo cáo"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
