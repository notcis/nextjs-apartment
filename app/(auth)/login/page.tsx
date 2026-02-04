"use client";

import { useState, useEffect } from "react"; // 1. เพิ่ม useEffect
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Building2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: session } = authClient.useSession();

  // 2. ย้าย Logic การ Redirect ไปไว้ใน useEffect
  useEffect(() => {
    if (session?.user?.id) {
      router.push("/dashboard"); // ถ้ามี Session แล้ว ให้ดีดไป Dashboard
    }
  }, [session, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    await authClient.signIn.email(
      {
        email,
        password,
      },
      {
        onSuccess: () => {
          // Login สำเร็จ -> ไปหน้า Dashboard
          router.push("/dashboard");
          router.refresh(); // แนะนำให้ refresh เพื่อให้ Server Component โหลดข้อมูลผู้ใช้ใหม่
        },
        onError: (ctx) => {
          // Login พลาด -> แสดง Error
          setError(ctx.error.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
          setIsLoading(false);
        },
      },
    );
  };

  // ถ้ากำลัง Redirect (มี session แล้ว) ไม่ต้องแสดง Form เพื่อกันหน้ากระพริบ
  if (session?.user?.id) {
    return null;
  }

  return (
    <div className="flex w-full min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">ระบบจัดการหอพัก</CardTitle>
          <CardDescription>
            เข้าสู่ระบบเพื่อจัดการอพาร์ตเมนต์และสัญญาเช่า
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">อีเมล</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@apartment.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">รหัสผ่าน</Label>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </CardContent>

          <CardFooter className="mt-5">
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังเข้าสู่ระบบ...
                </>
              ) : (
                "เข้าสู่ระบบ"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
