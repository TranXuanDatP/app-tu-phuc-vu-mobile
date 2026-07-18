import { Text, View } from "react-native";
import { Input, type InputProps } from "./input";

/** Labeled input wrapper with optional error (mirrors the login/link-kh field pattern). */
export function FormField({
  label,
  error,
  className,
  ...inputProps
}: { label: string; error?: string | null } & InputProps) {
  return (
    <View className="gap-1.5">
      <Text className="text-[12.5px] font-semibold text-muted-foreground">{label}</Text>
      <Input className={className} {...inputProps} />
      {error ? <Text className="text-sm text-destructive">{error}</Text> : null}
    </View>
  );
}
