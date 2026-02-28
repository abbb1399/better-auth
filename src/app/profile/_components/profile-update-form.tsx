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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { authClient } from "@/lib/auth/auth-client";
import { toast } from "sonner";
import { NumberInput } from "@/components/ui/number-input";
import { useRouter } from "next/navigation";

const profileUpdateSchema = z.object({
  name: z.string().min(1),
  email: z.email().min(1),
  favoriteNumber: z.number().int(),
});

type ProfileUpdateForm = z.infer<typeof profileUpdateSchema>;

export function ProfileUpdateForm({
  user,
}: {
  user: {
    email: string;
    name: string;
    favoriteNumber: number;
  };
}) {
  const router = useRouter();
  const form = useForm<ProfileUpdateForm>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: user,
  });

  const { isSubmitting } = form.formState;

  async function handleProfileUpdate(data: ProfileUpdateForm) {
    const promises = [
      authClient.updateUser({
        name: data.name,
        favoriteNumber: data.favoriteNumber,
      }),
    ];

    if (data.email !== user.email) {
      promises.push(
        authClient.changeEmail({
          newEmail: data.email,
          callbackURL: "/profile",
        }),
      );
    }

    const res = await Promise.all(promises);

    const updateUserResult = res[0];
    const emailResult = res[1] ?? { error: false };

    if (updateUserResult.error) {
      toast.error(updateUserResult.error.message || "프로필 업데이트에 실패했습니다.");
    } else if (emailResult.error) {
      toast.error(emailResult.error.message || "이메일 변경에 실패했습니다.");
    } else {
      if (data.email !== user.email) {
        toast.success("새 이메일 주소로 발송된 인증 메일을 확인해 주세요.");
      } else {
        toast.success("프로필이 업데이트되었습니다.");
      }
      router.refresh();
    }
  }

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(handleProfileUpdate)}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이름</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이메일</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="favoriteNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>좋아하는 숫자</FormLabel>
              <FormControl>
                <NumberInput {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          <LoadingSwap isLoading={isSubmitting}>프로필 업데이트</LoadingSwap>
        </Button>
      </form>
    </Form>
  );
}
