export const dynamic = "force-dynamic";
import {
  getMonthlyRevenue,
  getRoomOccupancy,
  getInvoiceStatusStats,
} from "@/actions/reports.action";
import { RevenueChart, StatusPieChart } from "./_components/charts";
import { YearSelector } from "./_components/year-selector"; // <--- Import Component ใหม่
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Banknote, Users, AlertCircle } from "lucide-react";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const today = new Date();
  const year =
    typeof sp.year === "string" ? parseInt(sp.year) : today.getFullYear();
  const month =
    typeof sp.month === "string" ? parseInt(sp.month) : today.getMonth() + 1;

  const [revenueData, occupancyData, invoiceStats] = await Promise.all([
    getMonthlyRevenue(year),
    getRoomOccupancy(),
    getInvoiceStatusStats(month, year),
  ]);

  const totalIncome = revenueData.reduce((acc, curr) => acc + curr.total, 0);
  const totalPending =
    invoiceStats.find((s) => s.name === "รอชำระ")?.amount || 0;
  const totalOverdue =
    invoiceStats.find((s) => s.name === "เกินกำหนด")?.amount || 0;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          รายงานสรุป (Reports)
        </h2>
        <div className="flex items-center space-x-2">
          {/* ✅ ใช้ Client Component แทน Form เดิม */}
          <YearSelector currentYear={year} currentMonth={month} />
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        {/* ... ส่วน TabsContent และ Cards เหมือนเดิมทุกอย่าง ... */}
        <TabsList>
          <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
          <TabsTrigger value="analytics" disabled>
            วิเคราะห์เชิงลึก
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  รายรับรวมทั้งปี {year + 543}
                </CardTitle>
                <Banknote className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ฿{totalIncome.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  เฉพาะบิลที่จ่ายแล้ว (PAID)
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  รอชำระ (เดือนนี้)
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  ฿{totalPending.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  จากบิลสถานะ Pending
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  ค้างชำระ / เกินกำหนด
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  ฿{totalOverdue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  ต้องติดตามทวงถาม
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  อัตราการเข้าพัก
                </CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(() => {
                    const occupied =
                      occupancyData.find((d) => d.name === "มีผู้เช่า")
                        ?.value || 0;
                    const total = occupancyData.reduce(
                      (a, b) => a + b.value,
                      0,
                    );
                    return total > 0
                      ? `${((occupied / total) * 100).toFixed(1)}%`
                      : "0%";
                  })()}
                </div>
                <p className="text-xs text-muted-foreground">
                  เทียบกับห้องทั้งหมด
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>รายรับรายเดือน</CardTitle>
                <CardDescription>
                  แสดงยอดเงินที่ได้รับจริงในปี {year + 543}
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <RevenueChart data={revenueData} />
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>สถานะห้องพักปัจจุบัน</CardTitle>
                <CardDescription>สัดส่วนห้องว่าง vs มีผู้เช่า</CardDescription>
              </CardHeader>
              <CardContent>
                <StatusPieChart data={occupancyData} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
