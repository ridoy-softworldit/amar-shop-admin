"use client";
import { Suspense } from "react";
import { isAuthed } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function GuardContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthed()) router.replace("/login");
  }, [router]);

  return <>{children}</>;
}

export default function Guard({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GuardContent>{children}</GuardContent>
    </Suspense>
  );
}
