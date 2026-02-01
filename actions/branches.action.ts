"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getBranches() {
  return await prisma.branch.findMany({
    orderBy: { id: "asc" },
  });
}

export async function upsertBranch(data: FormData) {
  const id = data.get("id") as string;
  const name = data.get("name") as string;
  const address = data.get("address") as string;
  const waterRate = parseFloat(data.get("waterRate") as string);
  const elecRate = parseFloat(data.get("elecRate") as string);

  if (id) {
    // แก้ไข
    await prisma.branch.update({
      where: { id: parseInt(id) },
      data: { name, address, waterRate, elecRate },
    });
  } else {
    // สร้างใหม่
    await prisma.branch.create({
      data: { name, address, waterRate, elecRate },
    });
  }

  revalidatePath("/dashboard/branches");
}

export async function deleteBranch(id: number) {
  try {
    await prisma.branch.delete({
      where: { id },
    });
    revalidatePath("/dashboard/branches");
  } catch (error) {
    console.error("Delete failed:", error);
    // ใน production ควร return error state กลับไปบอก user ว่าลบไม่ได้ (เช่น เพราะมีห้องพักผูกอยู่)
  }
}
