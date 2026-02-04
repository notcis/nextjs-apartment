export const dynamic = "force-dynamic";
import { getMeterData, getBranches } from "@/actions/utilities.action";
import { MeterTable } from "./_components/meter-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { redirect } from "next/navigation";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 4 }, (_, i) => currentYear - 2 + i);
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

export default async function UtilitiesPage({
  searchParams,
}: {
  // 1. แก้ Type ให้เป็น Promise
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // 2. Await searchParams ก่อนใช้งาน
  const sp = await searchParams;

  // 3. เปลี่ยนจาก searchParams เป็น sp (ตัวแปรที่ await แล้ว)
  const today = new Date();
  const month =
    typeof sp.month === "string" ? parseInt(sp.month) : today.getMonth() + 1;
  const year =
    typeof sp.year === "string" ? parseInt(sp.year) : today.getFullYear();
  const branchId =
    typeof sp.branchId === "string" && sp.branchId !== "all"
      ? parseInt(sp.branchId)
      : undefined;

  const [meterData, branches] = await Promise.all([
    getMeterData(branchId, month, year),
    getBranches(),
  ]);

  async function applyFilter(formData: FormData) {
    "use server";
    const m = formData.get("month");
    const y = formData.get("year");
    const b = formData.get("branchId");
    redirect(`/dashboard/utilities?month=${m}&year=${y}&branchId=${b}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            จดมิเตอร์ (Meter Reading)
          </h1>
          <p className="text-muted-foreground">
            บันทึกเลขมิเตอร์น้ำ/ไฟ ประจำเดือน {months[month - 1]} {year + 543}
          </p>
        </div>

        <form
          action={applyFilter}
          className="flex flex-wrap gap-2 items-end p-4 bg-white rounded-lg border shadow-sm"
        >
          {/* ... ส่วน Form เหมือนเดิมทุกอย่าง ... */}
          <div className="flex flex-col gap-1.5 w-32">
            <span className="text-xs font-medium text-muted-foreground">
              เดือน
            </span>
            <Select name="month" defaultValue={month.toString()}>
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

          <div className="flex flex-col gap-1.5 w-24">
            <span className="text-xs font-medium text-muted-foreground">
              ปี
            </span>
            <Select name="year" defaultValue={year.toString()}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y + 543}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5 w-40">
            <span className="text-xs font-medium text-muted-foreground">
              สาขา
            </span>
            <Select
              name="branchId"
              defaultValue={branchId ? branchId.toString() : "all"}
            >
              <SelectTrigger>
                <SelectValue placeholder="ทุกสาขา" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกสาขา</SelectItem>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.id.toString()}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" variant="secondary">
            <Filter className="h-4 w-4 mr-2" /> ค้นหา
          </Button>
        </form>
      </div>

      <MeterTable initialData={meterData} month={month} year={year} />
    </div>
  );
}
