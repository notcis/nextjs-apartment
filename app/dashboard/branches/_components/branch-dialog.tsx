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
import { upsertBranch } from "@/actions/branches.action";
import { Loader2, Plus, Pencil, MapPin, Zap, Droplets } from "lucide-react";

// Define type ให้ตรงกับ Prisma Model แต่แปลง Decimal เป็น number/string
type BranchData = {
  id: number;
  name: string;
  address: string | null;
  waterRate: number;
  elecRate: number;
};

export function BranchDialog({ branchToEdit }: { branchToEdit?: BranchData }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    if (branchToEdit) {
      formData.append("id", branchToEdit.id.toString());
    }

    await upsertBranch(formData);

    setIsLoading(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {branchToEdit ? (
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="mr-2 h-4 w-4" /> เพิ่มสาขา
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {branchToEdit ? "แก้ไขข้อมูลสาขา" : "เพิ่มสาขาใหม่"}
          </DialogTitle>
          <DialogDescription>
            กำหนดชื่อตึก ที่อยู่ และเรทค่าน้ำ-ค่าไฟมาตรฐานสำหรับสาขานี้
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">ชื่อสาขา / ชื่อตึก</Label>
            <Input
              id="name"
              name="name"
              placeholder="เช่น หอพักสุขใจ 1"
              defaultValue={branchToEdit?.name}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">ที่อยู่ (ถ้ามี)</Label>
            <div className="relative">
              <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="address"
                name="address"
                className="pl-9"
                placeholder="บ้านเลขที่, ถนน, ซอย..."
                defaultValue={branchToEdit?.address || ""}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="waterRate" className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-500" /> ค่าน้ำ
                (บาท/หน่วย)
              </Label>
              <Input
                id="waterRate"
                name="waterRate"
                type="number"
                step="0.01"
                placeholder="18.00"
                defaultValue={branchToEdit?.waterRate}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="elecRate" className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" /> ค่าไฟ (บาท/หน่วย)
              </Label>
              <Input
                id="elecRate"
                name="elecRate"
                type="number"
                step="0.01"
                placeholder="7.00"
                defaultValue={branchToEdit?.elecRate}
                required
              />
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
