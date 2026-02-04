"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  currentYear: number;
  currentMonth: number;
};

export function YearSelector({ currentYear, currentMonth }: Props) {
  const router = useRouter();

  // ฟังก์ชันเปลี่ยนหน้าเมื่อเลือกปีใหม่
  const handleYearChange = (year: string) => {
    router.push(`/dashboard/reports?year=${year}&month=${currentMonth}`);
  };

  const currentYearInt = new Date().getFullYear();

  return (
    <Select
      defaultValue={currentYear.toString()}
      onValueChange={handleYearChange} // ✅ ใช้ได้แล้วเพราะเป็น Client Component
    >
      <SelectTrigger className="w-[120px]">
        <SelectValue placeholder="เลือกปี" />
      </SelectTrigger>
      <SelectContent>
        {[0, 1, 2, 3].map((offset) => {
          const y = currentYearInt - offset;
          return (
            <SelectItem key={y} value={y.toString()}>
              {y + 543}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
