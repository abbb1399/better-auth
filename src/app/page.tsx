import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="my-6 px-4 max-w-md mx-auto">
      <div className="text-center space-y-6">
        <h1 className="text-3xl font-bold">Better Auth</h1>
        <Button asChild size="lg">
          <Link href="/auth/login">로그인 / 회원가입</Link>
        </Button>
      </div>
    </div>
  );
}
