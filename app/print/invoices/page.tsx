"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react"; // 1. เพิ่ม Suspense
import { getInvoicesForPrint } from "@/actions/invoices.action";
import { Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

// Helper function
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const chunkArray = (arr: any[], size: number) => {
  return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size),
  );
};

// 2. แยก Logic การทำงานหลักมาไว้ใน Component ใหม่ (เช่น PrintContent)
function PrintContent() {
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
    };
    fetchData();
  }, [searchParams]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );

  const pages = chunkArray(invoices, 2);

  return (
    <div className="bg-gray-100 min-h-screen p-8 print:p-0 print:bg-white">
      <div className="max-w-[210mm] mx-auto mb-4 flex justify-end print:hidden">
        <Button onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" /> สั่งพิมพ์
        </Button>
      </div>

      {pages.map((pageGroup, pageIndex) => (
        <div
          key={pageIndex}
          className="bg-white mx-auto shadow-lg print:shadow-none mb-8 print:mb-0"
          style={{
            width: "210mm",
            height: "296mm",
            pageBreakAfter: "always",
            position: "relative",
          }}
        >
          {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            pageGroup.map((inv: any, index: number) => (
              <div
                key={inv.id}
                className="flex flex-col"
                style={{
                  height: "148mm",
                  padding: "10mm 15mm",
                  boxSizing: "border-box",
                  borderBottom:
                    index === 0 && pageGroup.length > 1
                      ? "1px dashed #999"
                      : "none",
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h2 className="text-lg font-bold">
                      {inv.contract.room.branch.name}
                    </h2>
                    <p className="text-xs text-gray-500 w-64 leading-tight">
                      {inv.contract.room.branch.address || "ที่อยู่สาขา..."}
                    </p>
                  </div>
                  <div className="text-right">
                    <h1 className="text-xl font-bold text-gray-800">
                      ใบแจ้งหนี้
                    </h1>
                    <p className="text-xs">
                      เลขที่: {inv.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs">
                      วันที่:{" "}
                      {new Date(inv.issuedDate).toLocaleDateString("th-TH")}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between bg-gray-50 border rounded p-2 mb-2 text-xs print:border-gray-300">
                  <div>
                    <span className="font-bold">ผู้เช่า:</span>{" "}
                    {inv.contract.tenant.firstName}{" "}
                    {inv.contract.tenant.lastName}
                  </div>
                  <div>
                    <span className="font-bold text-sm">
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

                <div className="flex-1">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b-2 border-gray-800">
                        <th className="text-left py-1">รายการ</th>
                        <th className="text-center py-1">มิเตอร์เก่า</th>
                        <th className="text-center py-1">มิเตอร์ใหม่</th>
                        <th className="text-center py-1">หน่วย</th>
                        <th className="text-right py-1">ราคา/หน่วย</th>
                        <th className="text-right py-1">รวม (บาท)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="py-1">ค่าเช่าห้องพัก</td>
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

                      <tr>
                        <td className="py-1">ค่าน้ำ</td>
                        <td className="text-center text-gray-500">
                          {inv.meter.water.prev}
                        </td>
                        <td className="text-center font-bold">
                          {inv.meter.water.curr}
                        </td>
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

                      <tr>
                        <td className="py-1">ค่าไฟ</td>
                        <td className="text-center text-gray-500">
                          {inv.meter.elec.prev}
                        </td>
                        <td className="text-center font-bold">
                          {inv.meter.elec.curr}
                        </td>
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
                          <tr key={i}>
                            <td className="py-1" colSpan={5}>
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

                <div className="mt-2 flex justify-between items-end">
                  <div className="text-[10px] text-gray-600 w-2/3">
                    <p className="font-bold text-black mb-0.5">
                      ช่องทางการชำระเงิน:
                    </p>
                    <p>• กสิกรไทย: xxx-x-xxxxx-x (หอพัก Awi)</p>
                    <p>• พร้อมเพย์: 08x-xxx-xxxx</p>
                    <p className="mt-1 font-semibold">
                      *กรุณาชำระเงินภายในวันที่ 5 ของทุกเดือน
                    </p>
                  </div>
                  <div className="w-1/3 text-right">
                    <div className="flex justify-between items-center bg-gray-100 p-1 px-2 rounded mb-4 print:bg-transparent print:border print:border-black">
                      <span className="text-xs font-bold">ยอดสุทธิ:</span>
                      <span className="font-bold text-lg">
                        {inv.totalAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="relative text-center">
                      <div className="border-b border-gray-400 w-full mb-1"></div>
                      <span className="text-[10px]">ผู้รับเงิน</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      ))}

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}

// 3. Main Page จะทำหน้าที่แค่ห่อ Suspense
export default function PrintInvoicesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="animate-spin" />
        </div>
      }
    >
      <PrintContent />
    </Suspense>
  );
}
