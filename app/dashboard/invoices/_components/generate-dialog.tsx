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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { generateInvoices } from "@/actions/invoices.action";
import { Loader2, Zap } from "lucide-react";

const months = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

export function GenerateDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [year, setYear] = useState(new Date().getFullYear().toString());

  const handleGenerate = async () => {
    setIsLoading(true);
    const res = await generateInvoices(parseInt(month), parseInt(year));
    setIsLoading(false);
    setOpen(false);

    if (res.success) {
      alert(`สร้างบิลสำเร็จ ${res.count} รายการ`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Zap className="mr-2 h-4 w-4" /> สร้างบิลประจำเดือน
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>สร้างบิลอัตโนมัติ</DialogTitle>
          <DialogDescription>
            ระบบจะคำนวณค่าเช่า + ค่าน้ำไฟ จากสัญญาและมิเตอร์ล่าสุด
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label>เดือน</Label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((m, idx) => (
                  <SelectItem key={idx} value={(idx + 1).toString()}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>ปี</Label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[0, 1].map((offset) => {
                  const y = new Date().getFullYear() - offset;
                  return (
                    <SelectItem key={y} value={y.toString()}>
                      {y + 543}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-yellow-50 p-3 rounded-md text-xs text-yellow-800 mb-4">
          ⚠️ หมายเหตุ:
          ระบบจะสร้างบิลเฉพาะห้องที่จดมิเตอร์ของเดือนที่เลือกแล้วเท่านั้น
          หากยังไม่จดมิเตอร์ กรุณาไปที่เมนู จดมิเตอร์ ก่อน
        </div>

        <DialogFooter>
          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            ยืนยันการสร้างบิล
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
