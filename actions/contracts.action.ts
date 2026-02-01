"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. แก้ไข getContracts
export async function getContracts() {
  const contracts = await prisma.contract.findMany({
    include: {
      tenant: true,
      room: {
        include: { branch: true },
      },
    },
    orderBy: { isActive: "desc" },
  });

  // แปลง Decimal ทั้งหมดให้เป็น Number
  return contracts.map((c) => ({
    ...c,
    deposit: c.deposit.toNumber(),
    room: {
      ...c.room,
      price: c.room.price.toNumber(),
      branch: {
        ...c.room.branch,
        // เพิ่ม 2 บรรทัดนี้เพื่อแปลงค่าใน Branch
        waterRate: c.room.branch.waterRate.toNumber(),
        elecRate: c.room.branch.elecRate.toNumber(),
      },
    },
  }));
}

// 2. แก้ไข getFormOptions
export async function getFormOptions() {
  const tenants = await prisma.tenant.findMany({
    orderBy: { firstName: "asc" },
  });

  const vacantRooms = await prisma.room.findMany({
    where: { status: "VACANT" },
    include: { branch: true },
    orderBy: { number: "asc" },
  });

  // แปลง Decimal ของ Room และ Branch ที่ซ้อนอยู่
  const formattedRooms = vacantRooms.map((r) => ({
    ...r,
    price: r.price.toNumber(),
    branch: {
      ...r.branch,
      // เพิ่ม 2 บรรทัดนี้เช่นกัน
      waterRate: r.branch.waterRate.toNumber(),
      elecRate: r.branch.elecRate.toNumber(),
    },
  }));

  return { tenants, vacantRooms: formattedRooms };
}

// ... ส่วน createContract, updateContract, terminateContract ปล่อยไว้เหมือนเดิม ...
// (แต่เช็ค import ข้างบนด้วยนะครับว่าครบไหม)
export async function createContract(data: FormData) {
  // ... code เดิม ...
  const tenantId = parseInt(data.get("tenantId") as string);
  const roomId = parseInt(data.get("roomId") as string);
  const startDate = new Date(data.get("startDate") as string);
  const endDateStr = data.get("endDate") as string;
  const deposit = parseFloat(data.get("deposit") as string);

  const endDate = endDateStr ? new Date(endDateStr) : null;

  await prisma.$transaction([
    prisma.contract.create({
      data: {
        tenantId,
        roomId,
        startDate,
        endDate,
        deposit,
        isActive: true,
      },
    }),
    prisma.room.update({
      where: { id: roomId },
      data: { status: "OCCUPIED" },
    }),
  ]);

  revalidatePath("/dashboard/contracts");
  revalidatePath("/dashboard/rooms");
}

export async function updateContract(data: FormData) {
  const id = data.get("id") as string;
  const startDate = new Date(data.get("startDate") as string);
  const endDateStr = data.get("endDate") as string;
  const deposit = parseFloat(data.get("deposit") as string);

  const endDate = endDateStr ? new Date(endDateStr) : null;

  await prisma.contract.update({
    where: { id },
    data: {
      startDate,
      endDate,
      deposit,
    },
  });

  revalidatePath("/dashboard/contracts");
}

export async function terminateContract(contractId: string, roomId: number) {
  await prisma.$transaction([
    prisma.contract.update({
      where: { id: contractId },
      data: { isActive: false, endDate: new Date() },
    }),
    prisma.room.update({
      where: { id: roomId },
      data: { status: "VACANT" },
    }),
  ]);

  revalidatePath("/dashboard/contracts");
  revalidatePath("/dashboard/rooms");
}
