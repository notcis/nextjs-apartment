import { getInvoices, updateInvoiceStatus } from "@/actions/invoices.action";
import { GenerateDialog } from "./_components/generate-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Filter,
  MoreHorizontal,
  Printer,
  CheckCircle,
  Ban,
} from "lucide-react";
import { redirect } from "next/navigation";

import Link from "next/link";

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

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const today = new Date();
  const month =
    typeof sp.month === "string" ? parseInt(sp.month) : today.getMonth() + 1;
  const year =
    typeof sp.year === "string" ? parseInt(sp.year) : today.getFullYear();
  const statusFilter =
    typeof sp.status === "string" && sp.status !== "ALL"
      ? sp.status
      : undefined;

  // @ts-expect-error: Status type compatibility issue workaround for Quick Start
  const invoices = await getInvoices(month, year, statusFilter);

  async function applyFilter(formData: FormData) {
    "use server";
    const m = formData.get("month");
    const y = formData.get("year");
    const s = formData.get("status");
    redirect(`/dashboard/invoices?month=${m}&year=${y}&status=${s}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Link
          href={`/print/invoices?month=${month}&year=${year}`}
          target="_blank"
        >
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" /> พิมพ์บิลทั้งหมด (
            {invoices.length})
          </Button>
        </Link>
        <GenerateDialog />
      </div>

      {/* Filter Bar */}
      <form
        action={applyFilter}
        className="flex flex-wrap gap-2 items-end p-4 bg-white rounded-lg border shadow-sm"
      >
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
          <span className="text-xs font-medium text-muted-foreground">ปี</span>
          <Select name="year" defaultValue={year.toString()}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[0, 1, 2].map((offset) => {
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

        <div className="flex flex-col gap-1.5 w-32">
          <span className="text-xs font-medium text-muted-foreground">
            สถานะ
          </span>
          <Select name="status" defaultValue={statusFilter || "ALL"}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">ทั้งหมด</SelectItem>
              <SelectItem value="PENDING">รอชำระ</SelectItem>
              <SelectItem value="PAID">ชำระแล้ว</SelectItem>
              <SelectItem value="OVERDUE">เกินกำหนด</SelectItem>
              <SelectItem value="CANCELLED">ยกเลิก</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" variant="secondary">
          <Filter className="h-4 w-4 mr-2" /> ค้นหา
        </Button>
      </form>

      {/* Invoices Table */}
      <div className="border rounded-lg shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>เลขที่บิล</TableHead>
              <TableHead>ห้อง</TableHead>
              <TableHead>ผู้เช่า</TableHead>
              <TableHead>ยอดรวม</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center h-24 text-muted-foreground"
                >
                  ยังไม่มีรายการบิลในเดือนนี้
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono text-xs">
                    {inv.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell className="font-medium">
                    ห้อง {inv.contract.room.number}
                    <div className="text-xs text-muted-foreground">
                      {inv.contract.room.branch.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    {inv.contract.tenant.firstName}{" "}
                    {inv.contract.tenant.lastName}
                  </TableCell>
                  <TableCell className="font-bold text-lg">
                    ฿{inv.totalAmount.toNumber().toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {inv.status === "PENDING" && (
                      <Badge
                        variant="outline"
                        className="bg-yellow-50 text-yellow-700 border-yellow-200"
                      >
                        รอชำระ
                      </Badge>
                    )}
                    {inv.status === "PAID" && (
                      <Badge className="bg-green-500">ชำระแล้ว</Badge>
                    )}
                    {inv.status === "OVERDUE" && (
                      <Badge variant="destructive">เกินกำหนด</Badge>
                    )}
                    {inv.status === "CANCELLED" && (
                      <Badge variant="secondary">ยกเลิก</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/print/invoices?ids=${inv.id}`}
                            target="_blank"
                            className="cursor-pointer"
                          >
                            <Printer className="h-4 w-4" /> พิมพ์ใบแจ้งหนี้
                          </Link>
                        </DropdownMenuItem>

                        {inv.status === "PENDING" && (
                          <form
                            action={async () => {
                              "use server";
                              await updateInvoiceStatus(inv.id, "PAID");
                            }}
                          >
                            <button
                              type="submit"
                              className="w-full flex items-center px-2 py-1.5 text-sm text-green-700 hover:bg-green-50 rounded-sm"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />{" "}
                              แจ้งชำระเงิน
                            </button>
                          </form>
                        )}

                        {inv.status !== "CANCELLED" && (
                          <form
                            action={async () => {
                              "use server";
                              await updateInvoiceStatus(inv.id, "CANCELLED");
                            }}
                          >
                            <button
                              type="submit"
                              className="w-full flex items-center px-2 py-1.5 text-sm text-red-700 hover:bg-red-50 rounded-sm"
                            >
                              <Ban className="mr-2 h-4 w-4" /> ยกเลิกบิล
                            </button>
                          </form>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
