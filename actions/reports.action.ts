"use server";

import prisma from "@/lib/prisma";

// ดึงข้อมูลรายรับรายเดือนในปีที่เลือก
export async function getMonthlyRevenue(year: number) {
  // ดึงบิลทั้งหมดในปีที่เลือก ที่จ่ายแล้ว
  const invoices = await prisma.invoice.findMany({
    where: {
      year: year,
      status: "PAID",
    },
  });

  // สร้าง Array 12 เดือนเริ่มต้นเป็น 0
  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    name: new Date(0, i).toLocaleDateString("th-TH", { month: "short" }),
    total: 0,
  }));

  // รวมเงินใส่ตามเดือน
  invoices.forEach((inv) => {
    const monthIndex = inv.month - 1;
    if (monthIndex >= 0 && monthIndex < 12) {
      monthlyData[monthIndex].total += inv.totalAmount.toNumber();
    }
  });

  return monthlyData;
}

// ดึงสัดส่วนห้องพัก (ว่าง vs ไม่ว่าง)
export async function getRoomOccupancy() {
  const stats = await prisma.room.groupBy({
    by: ["status"],
    _count: {
      id: true,
    },
  });

  // แปลงข้อมูลให้กราฟ Pie Chart
  return [
    {
      name: "ว่าง",
      value: stats.find((s) => s.status === "VACANT")?._count.id || 0,
      fill: "#22c55e",
    }, // สีเขียว
    {
      name: "มีผู้เช่า",
      value: stats.find((s) => s.status === "OCCUPIED")?._count.id || 0,
      fill: "#3b82f6",
    }, // สีฟ้า
    {
      name: "ซ่อมบำรุง",
      value: stats.find((s) => s.status === "MAINTENANCE")?._count.id || 0,
      fill: "#ef4444",
    }, // สีแดง
  ].filter((item) => item.value > 0);
}

// ดึงสถานะการจ่ายเงินของเดือนปัจจุบัน
export async function getInvoiceStatusStats(month: number, year: number) {
  const stats = await prisma.invoice.groupBy({
    by: ["status"],
    where: { month, year },
    _count: { id: true },
    _sum: { totalAmount: true },
  });

  return [
    {
      name: "จ่ายแล้ว",
      count: stats.find((s) => s.status === "PAID")?._count.id || 0,
      amount:
        stats.find((s) => s.status === "PAID")?._sum.totalAmount?.toNumber() ||
        0,
      fill: "#22c55e",
    },
    {
      name: "รอชำระ",
      count: stats.find((s) => s.status === "PENDING")?._count.id || 0,
      amount:
        stats
          .find((s) => s.status === "PENDING")
          ?._sum.totalAmount?.toNumber() || 0,
      fill: "#eab308",
    },
    {
      name: "เกินกำหนด",
      count: stats.find((s) => s.status === "OVERDUE")?._count.id || 0,
      amount:
        stats
          .find((s) => s.status === "OVERDUE")
          ?._sum.totalAmount?.toNumber() || 0,
      fill: "#ef4444",
    },
  ];
}
