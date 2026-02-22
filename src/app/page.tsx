"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

export default function Home() {
  const { data: session, isPending: loading } = authClient.useSession();

  if (loading) {
    return <div>로딩중...</div>;
  }

  return (
    <div className="my-6 px-4 max-w-md mx-auto">
      <div className="text-center space-y-6">
        {session == null ? (
          <>
            <h1 className="text-3xl font-bold">Better Auth</h1>
            <Button asChild size="lg">
              <Link href="/auth/login">로그인 / 회원가입</Link>
            </Button>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold">
              안녕하세요. {session.user.name}님!
            </h1>
            <Button
              size="lg"
              variant="destructive"
              onClick={() => authClient.signOut()}
            >
              로그아웃
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
