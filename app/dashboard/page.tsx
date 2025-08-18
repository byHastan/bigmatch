"use client";
import { Button } from "@/components/ui/button";
import { signOut } from "@/src/lib/auth-client";

export default function Dashboard() {
  return (
    <div className="bg-red-500 h-screen w-screen flex justify-center items-center">
      Dashboard
      <Button onClick={() => signOut()}>Sign out</Button>
    </div>
  );
}
