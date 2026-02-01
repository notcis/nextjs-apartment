"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { upsertTenant } from "@/actions/tenants.action";
import {
  Loader2,
  Plus,
  Pencil,
  User,
  Phone,
  CreditCard,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner"; // แนะนำให้ลง sonner เพิ่มเพื่อแจ้งเตือน (optional)

// หรือถ้ายังไม่ได้ลง sonner ให้ใช้ alert ธรรมดาไปก่อน

type TenantData = {
  id: number;
  firstName: string;
  lastName: string;
  idCard: string;
  phone: string;
  lineId: string | null;
};

export function TenantDialog({ tenantToEdit }: { tenantToEdit?: TenantData }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    if (tenantToEdit) {
      formData.append("id", tenantToEdit.id.toString());
    }

    const result = await upsertTenant(formData);

    setIsLoading(false);
    if (result.success) {
      setOpen(false);
      toast.success("บันทึกข้อมูลสำเร็จ");
    } else {
      toast.error(result.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {tenantToEdit ? (
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="mr-2 h-4 w-4" /> เพิ่มผู้เช่า
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {tenantToEdit ? "แก้ไขข้อมูลผู้เช่า" : "ลงทะเบียนผู้เช่าใหม่"}
          </DialogTitle>
          <DialogDescription>
            กรอกข้อมูลส่วนตัวสำหรับทำสัญญาเช่า
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">ชื่อจริง</Label>
              <div className="relative">
                <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="firstName"
                  name="firstName"
                  className="pl-9"
                  defaultValue={tenantToEdit?.firstName}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">นามสกุล</Label>
              <Input
                id="lastName"
                name="lastName"
                defaultValue={tenantToEdit?.lastName}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="idCard">เลขบัตรประชาชน (13 หลัก)</Label>
            <div className="relative">
              <CreditCard className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="idCard"
                name="idCard"
                className="pl-9"
                maxLength={13}
                placeholder="xxxxxxxxxxxxx"
                defaultValue={tenantToEdit?.idCard}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
              <div className="relative">
                <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  name="phone"
                  className="pl-9"
                  defaultValue={tenantToEdit?.phone}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lineId">Line ID (ถ้ามี)</Label>
              <div className="relative">
                <MessageCircle className="absolute left-2.5 top-2.5 h-4 w-4 text-green-500" />
                <Input
                  id="lineId"
                  name="lineId"
                  className="pl-9"
                  defaultValue={tenantToEdit?.lineId || ""}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              บันทึกข้อมูล
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
