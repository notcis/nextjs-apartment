import { getRooms, getBranches, deleteRoom } from "@/actions/rooms.action";
import { RoomDialog } from "./_components/room-dialog";
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
import { Trash2 } from "lucide-react";

// Helper สำหรับเลือกสี Badge ตามสถานะ
const getStatusBadge = (status: string) => {
  switch (status) {
    case "VACANT":
      return (
        <Badge
          variant="secondary"
          className="bg-green-100 text-green-800 hover:bg-green-100"
        >
          ว่าง
        </Badge>
      );
    case "OCCUPIED":
      return (
        <Badge
          variant="secondary"
          className="bg-blue-100 text-blue-800 hover:bg-blue-100"
        >
          มีผู้เช่า
        </Badge>
      );
    case "MAINTENANCE":
      return <Badge variant="destructive">ซ่อมบำรุง</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default async function RoomsPage() {
  const roomsData = await getRooms();
  const branchesData = await getBranches();

  // 1. แปลงข้อมูล Branch: แปลง Decimal -> Number ก่อนส่งให้ Client Component
  const branches = branchesData.map((b) => ({
    ...b,
    waterRate: b.waterRate.toNumber(), // แปลงตรงนี้
    elecRate: b.elecRate.toNumber(), // แปลงตรงนี้
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">จัดการห้องพัก</h1>
          <p className="text-muted-foreground">
            รายการห้องพักทั้งหมดและสถานะปัจจุบัน
          </p>
        </div>

        {/* ส่ง branches ที่แปลงค่าแล้วเข้าไป */}
        <RoomDialog branches={branches} />
      </div>

      <div className="border rounded-lg shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>เลขห้อง</TableHead>
              <TableHead>ชั้น</TableHead>
              <TableHead>ราคาเช่า</TableHead>
              <TableHead>สาขา</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roomsData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center h-24 text-muted-foreground"
                >
                  ยังไม่มีข้อมูลห้องพัก กรุณาเพิ่มห้องแรก
                </TableCell>
              </TableRow>
            ) : (
              roomsData.map((room) => (
                <TableRow key={room.id}>
                  <TableCell className="font-medium">{room.number}</TableCell>
                  <TableCell>{room.floor}</TableCell>
                  {/* การแสดงผลตรงนี้ไม่ Error เพราะ Server Component จัดการ string ได้เลย */}
                  <TableCell>
                    {Number(room.price).toLocaleString()} บาท
                  </TableCell>
                  <TableCell>{room.branch.name}</TableCell>
                  <TableCell>{getStatusBadge(room.status)}</TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    {/* 2. แปลงข้อมูล RoomToEdit: ต้องระวังห้าม Spread (...room) เพราะจะติด object ของ Branch ที่มี Decimal มาด้วย */}
                    <RoomDialog
                      branches={branches}
                      roomToEdit={{
                        id: room.id,
                        number: room.number,
                        floor: room.floor,
                        price: room.price.toNumber(), // แปลง Decimal -> Number
                        status: room.status,
                        branchId: room.branchId,
                        // ไม่ต้องส่ง branch object เข้าไป เพราะ Dialog ไม่ได้ใช้
                      }}
                    />

                    <form
                      action={async () => {
                        "use server";
                        await deleteRoom(room.id);
                      }}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
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
