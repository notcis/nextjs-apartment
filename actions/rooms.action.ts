"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { RoomStatus } from "@prisma/client";

// ดึงข้อมูลห้องพักทั้งหมด
export async function getRooms() {
  return await prisma.room.findMany({
    include: {
      branch: true, // ดึงชื่อสาขามาด้วย
    },
    orderBy: {
      number: "asc", // เรียงตามเลขห้อง
    },
  });
}

// ดึงข้อมูลสาขา (สำหรับใส่ใน Dropdown)
export async function getBranches() {
  return await prisma.branch.findMany();
}

// สร้างหรือแก้ไขห้องพัก
export async function upsertRoom(data: FormData) {
  const id = data.get("id") as string;
  const number = data.get("number") as string;
  const floor = parseInt(data.get("floor") as string);
  const price = parseFloat(data.get("price") as string);
  const status = data.get("status") as RoomStatus;
  const branchId = parseInt(data.get("branchId") as string);

  if (id) {
    // กรณีแก้ไข (Edit)
    await prisma.room.update({
      where: { id: parseInt(id) },
      data: { number, floor, price, status, branchId },
    });
  } else {
    // กรณีสร้างใหม่ (Create)
    await prisma.room.create({
      data: { number, floor, price, status, branchId },
    });
  }

  revalidatePath("/dashboard/rooms"); // สั่งให้หน้าเว็บโหลดข้อมูลใหม่
}

// ลบห้องพัก
export async function deleteRoom(id: number) {
  await prisma.room.delete({
    where: { id },
  });
  revalidatePath("/dashboard/rooms");
}
