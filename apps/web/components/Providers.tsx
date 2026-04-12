"use client";

import React from "react";
import { AuthProvider } from "./auth-context";
import { StadiumProvider } from "./stadium-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <StadiumProvider>{children}</StadiumProvider>
    </AuthProvider>
  );
}

