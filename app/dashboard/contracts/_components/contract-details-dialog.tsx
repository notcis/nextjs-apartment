"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Eye, User, Home, CalendarClock, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

// Define Type ให้ตรงกับข้อมูลที่ส่งมาจาก Server Action
type ContractDetailProps = {
  contract: {
    id: string;
    isActive: boolean;
    startDate: Date;
    endDate: Date | null;
    deposit: number;
    tenant: {
      firstName: string;
      lastName: string;
      idCard: string;
      phone: string;
      lineId: string | null;
    };
    room: {
      number: string;
      floor: number;
      price: number;
      branch: {
        name: string;
        address: string | null;
      };
    };
  };
};

export function ContractDetailsDialog({ contract }: ContractDetailProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-blue-50 text-blue-600"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            รายละเอียดสัญญาเช่า
            {contract.isActive ? (
              <Badge className="bg-green-500">Active</Badge>
            ) : (
              <Badge variant="secondary">Ended</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            รหัสสัญญา: <span className="font-mono text-xs">{contract.id}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* ส่วนที่ 1: ข้อมูลผู้เช่า */}
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2 text-primary">
              <User className="h-4 w-4" /> ข้อมูลผู้เช่า
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm pl-6">
              <div className="text-muted-foreground">ชื่อ-นามสกุล:</div>
              <div className="font-medium">
                {contract.tenant.firstName} {contract.tenant.lastName}
              </div>

              <div className="text-muted-foreground">เลขบัตร ปชช.:</div>
              <div className="font-mono">{contract.tenant.idCard}</div>

              <div className="text-muted-foreground">เบอร์โทรศัพท์:</div>
              <div>{contract.tenant.phone}</div>

              <div className="text-muted-foreground">Line ID:</div>
              <div>{contract.tenant.lineId || "-"}</div>
            </div>
          </div>

          <Separator />

          {/* ส่วนที่ 2: ข้อมูลห้องพัก */}
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2 text-primary">
              <Home className="h-4 w-4" /> ข้อมูลห้องพัก
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm pl-6">
              <div className="text-muted-foreground">สาขา/อาคาร:</div>
              <div className="font-medium">{contract.room.branch.name}</div>

              <div className="text-muted-foreground">เลขห้อง:</div>
              <div className="font-medium text-lg">
                ห้อง {contract.room.number}
              </div>

              <div className="text-muted-foreground">ชั้น:</div>
              <div>{contract.room.floor}</div>

              <div className="text-muted-foreground">ค่าเช่ารายเดือน:</div>
              <div className="font-medium text-green-600">
                ฿{contract.room.price.toLocaleString()}
              </div>
            </div>
          </div>

          <Separator />

          {/* ส่วนที่ 3: เงื่อนไขสัญญา */}
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2 text-primary">
              <CalendarClock className="h-4 w-4" /> เงื่อนไขสัญญา
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm pl-6">
              <div className="text-muted-foreground">วันเริ่มสัญญา:</div>
              <div>
                {format(contract.startDate, "d MMMM yyyy", { locale: th })}
              </div>

              <div className="text-muted-foreground">วันสิ้นสุด:</div>
              <div>
                {contract.endDate
                  ? format(contract.endDate, "d MMMM yyyy", { locale: th })
                  : "ไม่กำหนดระยะเวลา"}
              </div>

              <div className="text-muted-foreground flex items-center gap-1">
                <CreditCard className="h-3 w-3" /> เงินประกัน/มัดจำ:
              </div>
              <div className="font-bold">
                ฿{contract.deposit.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
