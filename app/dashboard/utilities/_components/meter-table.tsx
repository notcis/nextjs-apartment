"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { saveMeterReadings } from "@/actions/utilities.action";
import { Loader2, Save, RotateCcw } from "lucide-react";
import { toast } from "sonner"; // ถ้าไม่ได้ลง sonner ให้ใช้ alert แทน

type MeterData = {
  roomId: number;
  roomNumber: string;
  branchName: string;
  prevWater: number;
  currentWater?: number;
  prevElec: number;
  currentElec?: number;
};

export function MeterTable({
  initialData,
  month,
  year,
}: {
  initialData: MeterData[];
  month: number;
  year: number;
}) {
  // State เก็บค่าที่ User กำลังพิมพ์
  const [readings, setReadings] = useState<MeterData[]>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Update state เมื่อ props เปลี่ยน (เช่น เปลี่ยนเดือน/สาขา)
  useEffect(() => {
    setReadings(initialData);
    setHasChanges(false);
  }, [initialData]);

  const handleInputChange = (
    index: number,
    field: "currentWater" | "currentElec",
    value: string,
  ) => {
    const newValue = value === "" ? undefined : parseInt(value);

    const newReadings = [...readings];
    newReadings[index] = {
      ...newReadings[index],
      [field]: newValue,
    };

    setReadings(newReadings);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);

    // กรองเอาเฉพาะแถวที่มีการกรอกครบทั้งน้ำและไฟ
    const validData = readings
      .filter(
        (r) => r.currentWater !== undefined && r.currentElec !== undefined,
      )
      .map((r) => ({
        roomId: r.roomId,
        waterReading: r.currentWater as number,
        elecReading: r.currentElec as number,
      }));

    if (validData.length === 0) {
      toast.error("กรุณากรอกข้อมูลอย่างน้อย 1 ห้อง");
      setIsSaving(false);
      return;
    }

    try {
      await saveMeterReadings(validData, month, year);
      toast.success("บันทึกข้อมูลเรียบร้อย");
      setHasChanges(false);
    } catch (error) {
      console.error(error);
      toast.error("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Sticky Header สำหรับปุ่ม Save เวลา Scroll ยาวๆ */}
      <div className="sticky top-[70px] z-30 flex justify-end pb-2">
        {hasChanges && (
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="shadow-lg animate-in fade-in zoom-in"
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            บันทึกการเปลี่ยนแปลง
          </Button>
        )}
      </div>

      <Card className="overflow-hidden border rounded-lg shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[100px]">ห้อง</TableHead>
              <TableHead className="w-[150px]">สาขา</TableHead>

              {/* กลุ่มไฟ */}
              <TableHead className="text-center bg-yellow-50/50 text-yellow-700 border-l border-yellow-100">
                ไฟ (เก่า)
              </TableHead>
              <TableHead className="text-center bg-yellow-50/50 text-yellow-900 border-r border-yellow-100 font-bold">
                ไฟ (ใหม่)
              </TableHead>

              {/* กลุ่มน้ำ */}
              <TableHead className="text-center bg-blue-50/50 text-blue-700 border-l border-blue-100">
                น้ำ (เก่า)
              </TableHead>
              <TableHead className="text-center bg-blue-50/50 text-blue-900 border-r border-blue-100 font-bold">
                น้ำ (ใหม่)
              </TableHead>

              <TableHead className="text-center w-[120px]">สถานะ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {readings.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center h-24 text-muted-foreground"
                >
                  ไม่พบข้อมูลห้องพัก
                </TableCell>
              </TableRow>
            ) : (
              readings.map((item, index) => {
                // Check Error Logic
                const isWaterError =
                  item.currentWater !== undefined &&
                  item.currentWater < item.prevWater;
                const isElecError =
                  item.currentElec !== undefined &&
                  item.currentElec < item.prevElec;
                const isFilled =
                  item.currentWater !== undefined &&
                  item.currentElec !== undefined;

                return (
                  <TableRow key={item.roomId} className="hover:bg-zinc-50">
                    <TableCell className="font-medium text-lg">
                      {item.roomNumber}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {item.branchName}
                    </TableCell>

                    {/* ไฟ */}
                    <TableCell className="text-center text-muted-foreground border-l">
                      {item.prevElec}
                    </TableCell>
                    <TableCell className="border-r p-2">
                      <Input
                        type="number"
                        value={item.currentElec ?? ""}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "currentElec",
                            e.target.value,
                          )
                        }
                        className={`text-center font-bold ${isElecError ? "border-red-500 bg-red-50 text-red-700" : ""}`}
                        placeholder={item.prevElec.toString()}
                      />
                    </TableCell>

                    {/* น้ำ */}
                    <TableCell className="text-center text-muted-foreground border-l">
                      {item.prevWater}
                    </TableCell>
                    <TableCell className="border-r p-2">
                      <Input
                        type="number"
                        value={item.currentWater ?? ""}
                        onChange={(e) =>
                          handleInputChange(
                            index,
                            "currentWater",
                            e.target.value,
                          )
                        }
                        className={`text-center font-bold ${isWaterError ? "border-red-500 bg-red-50 text-red-700" : ""}`}
                        placeholder={item.prevWater.toString()}
                      />
                    </TableCell>

                    {/* Status Check */}
                    <TableCell className="text-center">
                      {isWaterError || isElecError ? (
                        <span className="text-xs text-red-600 font-bold">
                          ตัวเลขผิดปกติ
                        </span>
                      ) : isFilled ? (
                        <span className="text-xs text-green-600 font-bold flex items-center justify-center gap-1">
                          พร้อมบันทึก
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
