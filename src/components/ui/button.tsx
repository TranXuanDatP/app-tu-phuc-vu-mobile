import { Pressable, type PressableProps } from "react-native";
import { cn } from "@/lib/utils";

export type ButtonProps = PressableProps & { className?: string };

/**
 * Minimal RN Button (Pressable) for the slice. Web FE's auth/dashboard used raw
 * <button> with utility classes; those port to <Pressable className="...">.
 * This wrapper adds a sensible default + disabled styling.
 */
export function Button({ className, disabled, ...props }: ButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      className={cn(
        "items-center justify-center rounded-md bg-primary px-4",
        disabled && "opacity-50",
        className,
      )}
      {...props}
    />
  );
}
