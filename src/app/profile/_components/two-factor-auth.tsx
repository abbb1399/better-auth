"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { authClient } from "@/lib/auth/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { PasswordInput } from "@/components/ui/password-input";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import QRCode from "react-qr-code";

const twoFactorAuthSchema = z.object({
  password: z.string().min(1),
});

type TwoFactorAuthForm = z.infer<typeof twoFactorAuthSchema>;
type TwoFactorData = {
  totpURI: string;
  backupCodes: string[];
};

export function TwoFactorAuth({ isEnabled }: { isEnabled: boolean }) {
  const [twoFactorData, setTwoFactorData] = useState<TwoFactorData | null>(
    null,
  );
  const router = useRouter();
  const form = useForm<TwoFactorAuthForm>({
    resolver: zodResolver(twoFactorAuthSchema),
    defaultValues: { password: "" },
  });

  const { isSubmitting } = form.formState;

  async function handleDisableTwoFactorAuth(data: TwoFactorAuthForm) {
    await authClient.twoFactor.disable(
      {
        password: data.password,
      },
      {
        onError: (error) => {
          toast.error(error.error.message || "2FA 비활성화에 실패했습니다");
        },
        onSuccess: () => {
          form.reset();
          router.refresh();
        },
      },
    );
  }

  async function handleEnableTwoFactorAuth(data: TwoFactorAuthForm) {
    const result = await authClient.twoFactor.enable({
      password: data.password,
    });

    if (result.error) {
      toast.error(result.error.message || "2FA 활성화에 실패했습니다");
    }
    {
      setTwoFactorData(result.data);
      form.reset();
    }
  }

  if (twoFactorData != null) {
    return (
      <QRCodeVerify
        {...twoFactorData}
        onDone={() => {
          setTwoFactorData(null);
        }}
      />
    );
  }

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(
          isEnabled ? handleDisableTwoFactorAuth : handleEnableTwoFactorAuth,
        )}
      >
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>비밀번호</FormLabel>
              <FormControl>
                <PasswordInput {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
          variant={isEnabled ? "destructive" : "default"}
        >
          <LoadingSwap isLoading={isSubmitting}>
            {isEnabled ? "2FA 비활성화" : "2FA 활성화"}
          </LoadingSwap>
        </Button>
      </form>
    </Form>
  );
}

const qrSchema = z.object({
  token: z.string().length(6),
});

type QrForm = z.infer<typeof qrSchema>;

function QRCodeVerify({
  totpURI,
  backupCodes,
  onDone,
}: TwoFactorData & { onDone: () => void }) {
  const [successfullyEnabled, setSuccessfullyEnabled] = useState(false);
  const router = useRouter();
  const form = useForm<QrForm>({
    resolver: zodResolver(qrSchema),
    defaultValues: { token: "" },
  });

  const { isSubmitting } = form.formState;

  async function handleQrCode(data: QrForm) {
    await authClient.twoFactor.verifyTotp(
      {
        code: data.token,
      },
      {
        onError: (error) => {
          toast.error(error.error.message || "코드 인증에 실패했습니다");
        },
        onSuccess: () => {
          setSuccessfullyEnabled(true);
          router.refresh();
        },
      },
    );
  }

  if (successfullyEnabled) {
    return (
      <>
        <p className="text-sm text-muted-foreground mb-2">
          백업 코드를 안전한 곳에 저장해 두세요. 계정에 접근할 때 사용할 수 있습니다.
        </p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {backupCodes.map((code, index) => (
            <div key={index} className="font-mono text-sm">
              {code}
            </div>
          ))}
        </div>
        <Button variant="outline" onClick={onDone}>
          완료
        </Button>
      </>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        인증 앱으로 QR 코드를 스캔한 후 아래에 코드를 입력하세요:
      </p>

      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(handleQrCode)}>
          <FormField
            control={form.control}
            name="token"
            render={({ field }) => (
              <FormItem>
                <FormLabel>코드</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isSubmitting} className="w-full">
            <LoadingSwap isLoading={isSubmitting}>코드 제출</LoadingSwap>
          </Button>
        </form>
      </Form>
      <div className="p-4 bg-white w-fit">
        <QRCode size={256} value={totpURI} />
      </div>
    </div>
  );
}
