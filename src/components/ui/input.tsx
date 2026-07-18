import { TextInput, type TextInputProps } from "react-native";
import { cn } from "@/lib/utils";
import { colors } from "@/theme/colors";

export type InputProps = TextInputProps & { className?: string };

/**
 * RN Input mirroring web FE components/ui/input. NativeWind `className` applies
 * styling; `placeholderTextColor` defaults to muted-foreground (className can't
 * reach it). Screens override via className (e.g. the borderless OTP input).
 */
export function Input({ className, placeholderTextColor, ...props }: InputProps) {
  return (
    <TextInput
      placeholderTextColor={placeholderTextColor ?? colors.mutedForeground}
      className={cn(
        "h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground",
        className,
      )}
      {...props}
    />
  );
}
