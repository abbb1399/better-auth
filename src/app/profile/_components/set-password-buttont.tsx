"use client";

import { BetterAuthActionButton } from "@/components/auth/better-auth-action-button";
import { authClient } from "@/lib/auth/auth-client";

export function SetPasswordButton({ email }: { email: string }) {
  return (
    <BetterAuthActionButton
      variant="outline"
      successMessage="비밀번호 재설정 이메일이 발송되었습니다."
      action={() => {
        return authClient.requestPasswordReset({
          email,
          redirectTo: "/auth/reset-password",
        });
      }}
    >
      비밀번호 재설정 이메일 발송
    </BetterAuthActionButton>
  );
}
