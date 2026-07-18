import { View, Text } from "react-native";

/** Placeholder for tab routes not yet built in this slice. */
export function Placeholder({ title }: { title: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <Text className="text-lg font-extrabold text-foreground">{title}</Text>
      <Text className="mt-1.5 text-sm text-muted-foreground">Màn hình sẽ xây ở slice tiếp theo.</Text>
    </View>
  );
}
