import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { makeQueryClient } from "@/lib/query-client";
import { Toaster } from "@/components/toaster";

/**
 * Root providers. Web FE also mounted next-themes (forced light) — dropped here;
 * NativeWind reads tokens from src/global.css and the app forces light via app.json.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => makeQueryClient());
  return (
    <QueryClientProvider client={client}>
      <SafeAreaProvider>
        {children}
        <Toaster />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
