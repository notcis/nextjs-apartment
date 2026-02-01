"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getInvoicesForPrint } from "@/actions/invoices.action";
import { Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

// Helper function: จัดกลุ่ม array ทีละ 2 (สำหรับ 2 ใบต่อ 1 หน้า A4)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const chunkArray = (arr: any[], size: number) => {
  return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size),
  );
};

export default function PrintInvoicesPage() {
  const searchParams = useSearchParams();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const month = searchParams.get("month");
      const year = searchParams.get("year");
      const ids = searchParams.get("ids")?.split(",");

      const data = await getInvoicesForPrint(
        ids,
        month ? parseInt(month) : undefined,
        year ? parseInt(year) : undefined,
      );
      setInvoices(data);
      setLoading(false);

      // สั่งพิมพ์อัตโนมัติเมื่อโหลดเสร็จ (Optional)
      // setTimeout(() => window.print(), 500)
    };
    fetchData();
  }, [searchParams]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );

  // จับคู่ทีละ 2 ใบ เพื่อใส่ใน A4 1 แผ่น
  const pages = chunkArray(invoices, 2);

  return (
    <div className="bg-gray-100 min-h-screen p-8 print:p-0 print:bg-white">
      {/* ปุ่มสั่งพิมพ์ (จะซ่อนเมื่อกด Print) */}
      <div className="max-w-[210mm] mx-auto mb-4 flex justify-end print:hidden">
        <Button onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" /> สั่งพิมพ์
        </Button>
      </div>

      {pages.map((pageGroup, pageIndex) => (
        <div
          key={pageIndex}
          className="bg-white mx-auto shadow-lg print:shadow-none mb-8 print:mb-0 relative"
          style={{
            width: "210mm",
            height: "296mm", // A4 Height
            padding: "10mm",
            pageBreakAfter: "always",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            pageGroup.map((inv: any, index: number) => (
              <div
                key={inv.id}
                className="flex-1 flex flex-col"
                style={{
                  borderBottom:
                    index === 0 && pageGroup.length > 1
                      ? "1px dashed #ccc"
                      : "none",
                  marginBottom:
                    index === 0 && pageGroup.length > 1 ? "5mm" : "0",
                  paddingBottom:
                    index === 0 && pageGroup.length > 1 ? "5mm" : "0",
                }}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold">
                      {inv.contract.room.branch.name}
                    </h2>
                    <p className="text-sm text-gray-600 w-64">
                      {inv.contract.room.branch.address || "ที่อยู่สาขา..."}
                    </p>
                  </div>
                  <div className="text-right">
                    <h1 className="text-2xl font-bold text-gray-800">
                      ใบแจ้งหนี้
                    </h1>
                    <p className="text-sm">
                      เลขที่: {inv.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-sm">
                      วันที่:{" "}
                      {new Date(inv.issuedDate).toLocaleDateString("th-TH")}
                    </p>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="border rounded p-3 mb-4 flex justify-between bg-gray-50 print:bg-transparent">
                  <div>
                    <span className="font-bold">ผู้เช่า:</span>{" "}
                    {inv.contract.tenant.firstName}{" "}
                    {inv.contract.tenant.lastName}
                  </div>
                  <div>
                    <span className="font-bold text-lg">
                      ห้อง: {inv.contract.room.number}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold">ประจำเดือน:</span>{" "}
                    {new Date(inv.year, inv.month - 1).toLocaleDateString(
                      "th-TH",
                      { month: "long", year: "numeric" },
                    )}
                  </div>
                </div>

                {/* Table */}
                <div className="flex-1">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-800">
                        <th className="text-left py-2">รายการ (Description)</th>
                        <th className="text-center py-2">ครั้งก่อน</th>
                        <th className="text-center py-2">ครั้งนี้</th>
                        <th className="text-center py-2">หน่วย</th>
                        <th className="text-right py-2">หน่วยละ</th>
                        <th className="text-right py-2">จำนวนเงิน</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* ค่าเช่า */}
                      <tr className="border-b border-gray-200">
                        <td className="py-2">ค่าเช่าห้องพัก (Room Rent)</td>
                        <td className="text-center">-</td>
                        <td className="text-center">-</td>
                        <td className="text-center">1</td>
                        <td className="text-right">
                          {inv.contract.room.price.toLocaleString()}
                        </td>
                        <td className="text-right font-medium">
                          {inv.contract.room.price.toLocaleString()}
                        </td>
                      </tr>

                      {/* ค่าน้ำ */}
                      <tr className="border-b border-gray-200">
                        <td className="py-2">ค่าน้ำประปา (Water)</td>
                        <td className="text-center">{inv.meter.water.prev}</td>
                        <td className="text-center">{inv.meter.water.curr}</td>
                        <td className="text-center">{inv.meter.water.unit}</td>
                        <td className="text-right">
                          {inv.contract.room.branch.waterRate.toLocaleString()}
                        </td>
                        <td className="text-right font-medium">
                          {(
                            inv.meter.water.unit *
                            inv.contract.room.branch.waterRate
                          ).toLocaleString()}
                        </td>
                      </tr>

                      {/* ค่าไฟ */}
                      <tr className="border-b border-gray-200">
                        <td className="py-2">ค่าไฟฟ้า (Electricity)</td>
                        <td className="text-center">{inv.meter.elec.prev}</td>
                        <td className="text-center">{inv.meter.elec.curr}</td>
                        <td className="text-center">{inv.meter.elec.unit}</td>
                        <td className="text-right">
                          {inv.contract.room.branch.elecRate.toLocaleString()}
                        </td>
                        <td className="text-right font-medium">
                          {(
                            inv.meter.elec.unit *
                            inv.contract.room.branch.elecRate
                          ).toLocaleString()}
                        </td>
                      </tr>

                      {/* รายการอื่นๆ (ถ้ามี) */}
                      {inv.items
                        .filter(
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          (i: any) =>
                            !i.description.includes("ค่าเช่า") &&
                            !i.description.includes("ค่าน้ำ") &&
                            !i.description.includes("ค่าไฟ"),
                        )
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        .map((item: any, i: number) => (
                          <tr key={i} className="border-b border-gray-200">
                            <td className="py-2" colSpan={5}>
                              {item.description}
                            </td>
                            <td className="text-right font-medium">
                              {item.amount.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Total & Footer */}
                <div className="mt-4 flex justify-between items-end">
                  <div className="text-sm w-2/3">
                    <p className="font-bold mb-1">ช่องทางการชำระเงิน:</p>
                    <p>ธนาคารกสิกรไทย เลขที่บัญชี: xxx-x-xxxxx-x</p>
                    <p>ชื่อบัญชี: หอพัก Awi Apartment</p>
                    <p className="mt-2 text-xs text-gray-500">
                      *กรุณาชำระเงินภายในวันที่ 5 ของทุกเดือน
                    </p>
                  </div>
                  <div className="w-1/3 text-right">
                    <div className="flex justify-between mb-2">
                      <span>รวมเป็นเงิน:</span>
                      <span className="font-bold text-xl">
                        {inv.totalAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-8 border-t border-gray-400 pt-2 text-center text-sm">
                      ( .......................................................
                      )
                      <br />
                      ผู้รับเงิน / เจ้าหน้าที่
                    </div>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      ))}

      {/* CSS สำหรับซ่อน Element อื่นๆ เมื่อพิมพ์ */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            background: white;
          }
        }
      `}</style>
    </div>
  );
}
