"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ดึงข้อมูลห้องพร้อมเลขมิเตอร์ (เก่า/ใหม่)
export async function getMeterData(
  branchId: number | undefined,
  month: number,
  year: number,
) {
  // คำนวณเดือนก่อนหน้า
  const prevDate = new Date(year, month - 2, 1); // month - 2 เพราะ JS month เริ่ม 0 และเราต้องการเดือนก่อนหน้า
  const prevMonth = prevDate.getMonth() + 1;
  const prevYear = prevDate.getFullYear();

  // ดึงห้องพักทั้งหมดในสาขา (หรือทั้งหมดถ้าไม่ระบุ)
  const rooms = await prisma.room.findMany({
    where: {
      branchId: branchId,
      // ปกติเราจดมิเตอร์เฉพาะห้องที่มีคนอยู่ หรือห้องที่เพิ่งย้ายออก
      // แต่เพื่อความง่าย ดึงมาทุกห้องก่อนก็ได้
    },
    include: {
      branch: true,
      // ดึงมิเตอร์เดือนที่เลือก (Current)
      meters: {
        where: {
          month: month,
          year: year,
        },
      },
    },
    orderBy: { number: "asc" },
  });

  // ดึงมิเตอร์เดือนก่อนหน้าแยกออกมา (Previous)
  // (ต้องแยก query เพราะ Prisma relation where ซ้อนกันหลายชั้นอาจจะงง)
  const prevReadings = await prisma.meterReading.findMany({
    where: {
      month: prevMonth,
      year: prevYear,
      roomId: { in: rooms.map((r) => r.id) },
    },
  });

  // Map ข้อมูลมารวมกัน
  return rooms.map((room) => {
    const currentMeter = room.meters[0]; // อาจจะเป็น undefined ถ้ายังไม่จด
    const prevMeter = prevReadings.find((p) => p.roomId === room.id);

    return {
      roomId: room.id,
      roomNumber: room.number,
      branchName: room.branch.name,
      // ค่ามิเตอร์น้ำ
      prevWater: prevMeter?.waterReading || 0,
      currentWater: currentMeter?.waterReading || undefined, // undefined = ยังไม่จด
      // ค่ามิเตอร์ไฟ
      prevElec: prevMeter?.elecReading || 0,
      currentElec: currentMeter?.elecReading || undefined,
    };
  });
}

// ดึงรายชื่อสาขา
export async function getBranches() {
  return await prisma.branch.findMany({ orderBy: { id: "asc" } });
}

// Type สำหรับข้อมูลที่จะบันทึก
type MeterInput = {
  roomId: number;
  waterReading: number;
  elecReading: number;
};

// บันทึกข้อมูลทีละหลายรายการ (Bulk Upsert)
export async function saveMeterReadings(
  data: MeterInput[],
  month: number,
  year: number,
) {
  // ใช้ Transaction หรือ Promise.all เพื่อบันทึกรวดเดียว
  await prisma.$transaction(
    data.map((item) =>
      prisma.meterReading.upsert({
        where: {
          roomId_month_year: {
            roomId: item.roomId,
            month: month,
            year: year,
          },
        },
        update: {
          waterReading: item.waterReading,
          elecReading: item.elecReading,
        },
        create: {
          roomId: item.roomId,
          month: month,
          year: year,
          waterReading: item.waterReading,
          elecReading: item.elecReading,
        },
      }),
    ),
  );

  revalidatePath("/dashboard/utilities");
  return { success: true };
}
