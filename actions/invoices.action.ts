"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { InvoiceStatus } from "@prisma/client";

export async function getInvoices(
  month: number,
  year: number,
  status?: InvoiceStatus,
) {
  return await prisma.invoice.findMany({
    where: {
      month,
      year,
      status: status ? status : undefined,
    },
    include: {
      contract: {
        include: {
          room: {
            include: {
              branch: true,
            },
          },
          tenant: true,
        },
      },
      items: true,
    },
    orderBy: { contract: { room: { number: "asc" } } },
  });
}

export async function updateInvoiceStatus(id: string, status: InvoiceStatus) {
  await prisma.invoice.update({
    where: { id },
    data: {
      status,
    },
  });
  revalidatePath("/dashboard/invoices");
}

export async function generateInvoices(month: number, year: number) {
  const activeContracts = await prisma.contract.findMany({
    where: { isActive: true },
    include: {
      room: { include: { branch: true } },
    },
  });

  const prevDate = new Date(year, month - 2, 1);
  const prevMonth = prevDate.getMonth() + 1;
  const prevYear = prevDate.getFullYear();

  let generatedCount = 0;

  for (const contract of activeContracts) {
    const existing = await prisma.invoice.findFirst({
      where: {
        contractId: contract.id,
        month,
        year,
      },
    });
    if (existing) continue;

    // 1. แก้ตรงนี้: เปลี่ยน unique_meter_reading -> roomId_month_year
    const currentMeter = await prisma.meterReading.findUnique({
      where: {
        roomId_month_year: {
          roomId: contract.roomId,
          month,
          year,
        },
      },
    });

    if (!currentMeter) continue;

    // 2. แก้ตรงนี้ด้วย: เปลี่ยน unique_meter_reading -> roomId_month_year
    const prevMeter = await prisma.meterReading.findUnique({
      where: {
        roomId_month_year: {
          roomId: contract.roomId,
          month: prevMonth,
          year: prevYear,
        },
      },
    });

    const rentAmount = contract.room.price.toNumber();

    const waterUnit =
      currentMeter.waterReading -
      (prevMeter?.waterReading || currentMeter.waterReading);
    const waterCost = waterUnit * contract.room.branch.waterRate.toNumber();

    const elecUnit =
      currentMeter.elecReading -
      (prevMeter?.elecReading || currentMeter.elecReading);
    const elecCost = elecUnit * contract.room.branch.elecRate.toNumber();

    const totalAmount = rentAmount + waterCost + elecCost;

    await prisma.invoice.create({
      data: {
        contractId: contract.id,
        month,
        year,
        totalAmount,
        dueDate: new Date(year, month - 1, 5),
        status: "PENDING",
        items: {
          create: [
            { description: "ค่าเช่าห้อง (Room Rent)", amount: rentAmount },
            { description: `ค่าน้ำ (${waterUnit} หน่วย)`, amount: waterCost },
            { description: `ค่าไฟ (${elecUnit} หน่วย)`, amount: elecCost },
          ],
        },
      },
    });
    generatedCount++;
  }

  revalidatePath("/dashboard/invoices");
  return { success: true, count: generatedCount };
}

export async function getInvoicesForPrint(
  ids?: string[],
  month?: number,
  year?: number,
) {
  // สร้างเงื่อนไข Where
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const whereCondition: any = {
    status: { not: "CANCELLED" },
  };

  if (ids && ids.length > 0) {
    whereCondition.id = { in: ids };
  } else if (month && year) {
    whereCondition.month = month;
    whereCondition.year = year;
  }

  const invoices = await prisma.invoice.findMany({
    where: whereCondition,
    include: {
      contract: {
        include: {
          room: { include: { branch: true } },
          tenant: true,
        },
      },
      items: true,
    },
    orderBy: { contract: { room: { number: "asc" } } },
  });

  // ดึงเลขมิเตอร์มาแสดงด้วย (ต้อง Query แยกเพราะ Prisma Relation ซับซ้อน)
  const invoicesWithMeters = await Promise.all(
    invoices.map(async (inv) => {
      // ดึงมิเตอร์เดือนปัจจุบัน
      const currentMeter = await prisma.meterReading.findUnique({
        where: {
          roomId_month_year: {
            roomId: inv.contract.roomId,
            month: inv.month,
            year: inv.year,
          },
        },
      });

      // ดึงมิเตอร์เดือนก่อนหน้า
      const prevDate = new Date(inv.year, inv.month - 2, 1);
      const prevMeter = await prisma.meterReading.findUnique({
        where: {
          roomId_month_year: {
            roomId: inv.contract.roomId,
            month: prevDate.getMonth() + 1,
            year: prevDate.getFullYear(),
          },
        },
      });

      return {
        ...inv,
        totalAmount: inv.totalAmount.toNumber(), // แปลง Decimal
        items: inv.items.map((i) => ({ ...i, amount: i.amount.toNumber() })),
        contract: {
          ...inv.contract,
          deposit: inv.contract.deposit.toNumber(),
          room: {
            ...inv.contract.room,
            price: inv.contract.room.price.toNumber(),
            branch: {
              ...inv.contract.room.branch,
              waterRate: inv.contract.room.branch.waterRate.toNumber(),
              elecRate: inv.contract.room.branch.elecRate.toNumber(),
            },
          },
        },
        // แนบข้อมูลมิเตอร์ไปด้วย
        meter: {
          water: {
            prev: prevMeter?.waterReading || 0,
            curr: currentMeter?.waterReading || 0,
            unit:
              (currentMeter?.waterReading || 0) -
              (prevMeter?.waterReading || 0),
          },
          elec: {
            prev: prevMeter?.elecReading || 0,
            curr: currentMeter?.elecReading || 0,
            unit:
              (currentMeter?.elecReading || 0) - (prevMeter?.elecReading || 0),
          },
        },
      };
    }),
  );

  return invoicesWithMeters;
}
