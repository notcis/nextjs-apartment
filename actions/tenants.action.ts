"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getTenants() {
  return await prisma.tenant.findMany({
    orderBy: { id: "desc" }, // ผู้เช่าใหม่สุดขึ้นก่อน
    include: {
      _count: {
        select: {
          contracts: {
            where: { isActive: true },
          },
        },
        // นับจำนวนสัญญาที่มี (เพื่อดูว่าใครยังเช่าอยู่)
      },
    },
  });
}

export async function upsertTenant(data: FormData) {
  const id = data.get("id") as string;
  const firstName = data.get("firstName") as string;
  const lastName = data.get("lastName") as string;
  const idCard = data.get("idCard") as string;
  const phone = data.get("phone") as string;
  const lineId = data.get("lineId") as string;

  try {
    if (id) {
      // แก้ไข
      await prisma.tenant.update({
        where: { id: parseInt(id) },
        data: { firstName, lastName, idCard, phone, lineId },
      });
    } else {
      // สร้างใหม่
      await prisma.tenant.create({
        data: { firstName, lastName, idCard, phone, lineId },
      });
    }

    revalidatePath("/dashboard/tenants");
    return { success: true };
  } catch (error) {
    console.error("Upsert tenant failed:", error);
    return {
      success: false,
      error: "ไม่สามารถบันทึกข้อมูลได้ (เลขบัตรประชาชนอาจซ้ำ)",
    };
  }
}

export async function deleteTenant(id: number) {
  try {
    await prisma.tenant.delete({
      where: { id },
    });
    revalidatePath("/dashboard/tenants");
    return { success: true };
  } catch (error) {
    console.error("Delete tenant failed:", error);
    // กรณีลบไม่ได้เพราะติด Relation (เช่น มีสัญญาเช่าค้างอยู่)
    return {
      success: false,
      error: "ไม่สามารถลบผู้เช่าที่มีสัญญาเช่าค้างอยู่ได้",
    };
  }
}
