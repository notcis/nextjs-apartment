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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { upsertRoom } from "@/actions/rooms.action";
import { Loader2, Plus, Pencil } from "lucide-react";

// Type ของข้อมูลที่จะรับเข้ามา (กรณีแก้ไข)
type RoomData = {
  id: number;
  number: string;
  floor: number;
  price: number; // หรือ Decimal
  status: string;
  branchId: number;
};

type Props = {
  branches: { id: number; name: string }[]; // รับรายการสาขามาแสดง
  roomToEdit?: RoomData; // ถ้ามีส่งมา = แก้ไข, ไม่มี = เพิ่มใหม่
};

export function RoomDialog({ branches, roomToEdit }: Props) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    // ถ้าเป็นการแก้ไข ให้แนบ ID ไปด้วย
    if (roomToEdit) {
      formData.append("id", roomToEdit.id.toString());
    }

    await upsertRoom(formData);

    setIsLoading(false);
    setOpen(false); // ปิด Modal
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {roomToEdit ? (
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="mr-2 h-4 w-4" /> เพิ่มห้องพัก
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {roomToEdit ? "แก้ไขห้องพัก" : "เพิ่มห้องพักใหม่"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="number">เลขห้อง</Label>
              <Input
                id="number"
                name="number"
                placeholder="101"
                defaultValue={roomToEdit?.number}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="floor">ชั้น</Label>
              <Input
                id="floor"
                name="floor"
                type="number"
                placeholder="1"
                defaultValue={roomToEdit?.floor}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">ราคาเช่า (บาท/เดือน)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              defaultValue={roomToEdit ? Number(roomToEdit.price) : ""}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="branch">สาขา/ตึก</Label>
              <Select
                name="branchId"
                defaultValue={roomToEdit?.branchId.toString()}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสาขา" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id.toString()}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">สถานะ</Label>
              <Select
                name="status"
                defaultValue={roomToEdit?.status || "VACANT"}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VACANT">ว่าง (Vacant)</SelectItem>
                  <SelectItem value="OCCUPIED">มีผู้เช่า (Occupied)</SelectItem>
                  <SelectItem value="MAINTENANCE">
                    ซ่อมบำรุง (Maintenance)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
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
