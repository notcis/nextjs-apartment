"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { createContract, updateContract } from "@/actions/contracts.action"; // <--- Import updateContract
import { Loader2, FileSignature, Pencil } from "lucide-react";

// Types เดิม...
type TenantOption = {
  id: number;
  firstName: string;
  lastName: string;
  idCard: string;
};
type RoomOption = {
  id: number;
  number: string;
  branch: { name: string };
  price: number;
};

// เพิ่ม Type สำหรับข้อมูลที่จะแก้ไข
type ContractEditData = {
  id: string;
  tenantId: number;
  roomId: number;
  startDate: Date;
  endDate: Date | null;
  deposit: number;
};

type Props = {
  tenants: TenantOption[];
  vacantRooms: RoomOption[];
  contractToEdit?: ContractEditData; // <--- รับค่านี้เพิ่ม (Optional)
};

export function ContractDialog({
  tenants,
  vacantRooms,
  contractToEdit,
}: Props) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRoomPrice, setSelectedRoomPrice] = useState<number>(0);

  // ถ้าเป็นการแก้ไข ให้ตั้งค่าเริ่มต้น
  const isEditMode = !!contractToEdit;

  const handleRoomChange = (value: string) => {
    const room = vacantRooms.find((r) => r.id.toString() === value);
    if (room) setSelectedRoomPrice(room.price);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);

    if (isEditMode) {
      formData.append("id", contractToEdit.id);
      await updateContract(formData); // เรียก Action แก้ไข
    } else {
      await createContract(formData); // เรียก Action สร้างใหม่
    }

    setIsLoading(false);
    setOpen(false);
  };

  // แปลง Date เป็น string (YYYY-MM-DD) สำหรับใส่ใน input type="date"
  const formatDateForInput = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEditMode ? (
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-yellow-50 text-yellow-600"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <FileSignature className="mr-2 h-4 w-4" /> ทำสัญญาเช่าใหม่
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "แก้ไขสัญญาเช่า" : "ทำสัญญาเช่า (Check-in)"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "แก้ไขข้อมูลวันที่หรือเงินมัดจำ (ไม่สามารถเปลี่ยนห้องหรือผู้เช่าได้ที่นี่)"
              : "เลือกห้องว่างและผู้เช่าเพื่อเริ่มสัญญา"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* เลือกผู้เช่า (Disabled ถ้าแก้ไข) */}
          <div className="space-y-2">
            <Label>ผู้เช่า</Label>
            <Select
              name="tenantId"
              required
              disabled={isEditMode}
              defaultValue={contractToEdit?.tenantId.toString()}
            >
              <SelectTrigger className="disabled:opacity-100 disabled:bg-muted">
                <SelectValue placeholder="ค้นหาผู้เช่า..." />
              </SelectTrigger>
              <SelectContent>
                {tenants.map((t) => (
                  <SelectItem key={t.id} value={t.id.toString()}>
                    {t.firstName} {t.lastName} ({t.idCard})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* เลือกห้องพัก (Disabled ถ้าแก้ไข) */}
          <div className="space-y-2">
            <Label>ห้องพัก</Label>
            <Select
              name="roomId"
              required
              onValueChange={handleRoomChange}
              disabled={isEditMode}
              defaultValue={contractToEdit?.roomId.toString()}
            >
              <SelectTrigger className="disabled:opacity-100 disabled:bg-muted">
                <SelectValue placeholder="เลือกห้องพัก..." />
              </SelectTrigger>
              <SelectContent>
                {/* ถ้าแก้ไข เราต้องแสดงห้องเดิมด้วย (แม้จะไม่ว่าง) */}
                {isEditMode && (
                  <SelectItem value={contractToEdit!.roomId.toString()}>
                    ห้องเดิม (ไม่สามารถเปลี่ยนได้)
                  </SelectItem>
                )}

                {vacantRooms.length > 0 &&
                  !isEditMode &&
                  Object.values(
                    vacantRooms.reduce(
                      (acc, room) => {
                        const branchName = room.branch.name;
                        if (!acc[branchName]) acc[branchName] = [];
                        acc[branchName].push(room);
                        return acc;
                      },
                      {} as Record<string, RoomOption[]>,
                    ),
                  ).map((group, idx) => (
                    <SelectGroup key={idx}>
                      <SelectLabel>{group[0].branch.name}</SelectLabel>
                      {group.map((r) => (
                        <SelectItem key={r.id} value={r.id.toString()}>
                          ห้อง {r.number} (฿{r.price.toLocaleString()})
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>วันเริ่มสัญญา</Label>
              <Input
                name="startDate"
                type="date"
                required
                defaultValue={
                  isEditMode
                    ? formatDateForInput(contractToEdit!.startDate)
                    : formatDateForInput(new Date())
                }
              />
            </div>
            <div className="space-y-2">
              <Label>สิ้นสุดสัญญา</Label>
              <Input
                name="endDate"
                type="date"
                defaultValue={
                  isEditMode ? formatDateForInput(contractToEdit!.endDate) : ""
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>เงินประกัน / มัดจำ (บาท)</Label>
            <Input
              name="deposit"
              type="number"
              required
              placeholder="0.00"
              defaultValue={
                isEditMode
                  ? contractToEdit!.deposit
                  : selectedRoomPrice > 0
                    ? selectedRoomPrice * 2
                    : ""
              }
              key={isEditMode ? "edit" : selectedRoomPrice}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? "บันทึกการแก้ไข" : "บันทึกสัญญา"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
