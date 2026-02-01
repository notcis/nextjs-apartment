import {
  getContracts,
  getFormOptions,
  terminateContract,
} from "@/actions/contracts.action";
import { ContractDialog } from "./_components/contract-dialog";
import { ContractDetailsDialog } from "./_components/contract-details-dialog"; // <--- Import ใหม่
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
import { LogOut } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default async function ContractsPage() {
  const contracts = await getContracts();
  const options = await getFormOptions();

  return (
    <div className="space-y-6">
      {/* ... ส่วน Header เหมือนเดิม ... */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            สัญญาเช่า (Contracts)
          </h1>
          <p className="text-muted-foreground">
            จัดการสัญญาเช่า การย้ายเข้า (Check-in) และย้ายออก (Check-out)
          </p>
        </div>
        <ContractDialog
          tenants={options.tenants}
          vacantRooms={options.vacantRooms}
        />
      </div>

      <div className="border rounded-lg shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>สถานะ</TableHead>
              <TableHead>เลขห้อง</TableHead>
              <TableHead>ผู้เช่า</TableHead>
              <TableHead>ระยะเวลาสัญญา</TableHead>
              <TableHead>เงินประกัน</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center h-24 text-muted-foreground"
                >
                  ยังไม่มีข้อมูลสัญญาเช่า
                </TableCell>
              </TableRow>
            ) : (
              contracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell>
                    {contract.isActive ? (
                      <Badge className="bg-green-500 hover:bg-green-600">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Ended</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      ห้อง {contract.room.number}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {contract.room.branch.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    {contract.tenant.firstName} {contract.tenant.lastName}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span>
                        เริ่ม:{" "}
                        {format(contract.startDate, "dd MMM yyyy", {
                          locale: th,
                        })}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        สิ้นสุด:{" "}
                        {contract.endDate
                          ? format(contract.endDate, "dd MMM yyyy", {
                              locale: th,
                            })
                          : "ไม่กำหนด"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>฿{contract.deposit.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {/* 1. ปุ่มดูรายละเอียด (ใส่ตรงนี้) */}
                      <ContractDetailsDialog contract={contract} />

                      {/* 2. ปุ่มแก้ไข (เพิ่มใหม่ตรงนี้) */}
                      <ContractDialog
                        tenants={options.tenants}
                        vacantRooms={options.vacantRooms}
                        contractToEdit={{
                          id: contract.id,
                          tenantId: contract.tenantId,
                          roomId: contract.roomId,
                          startDate: contract.startDate,
                          endDate: contract.endDate,
                          deposit: contract.deposit,
                        }}
                      />

                      {/* 2. ปุ่มแจ้งออก (Logic เดิม) */}
                      {contract.isActive && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <LogOut className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                ยืนยันการแจ้งย้ายออก?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                การดำเนินการนี้จะเปลี่ยนสถานะสัญญาเป็น สิ้นสุด
                                และสถานะห้องพักจะกลับมา ว่าง ทันที
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                              <form
                                action={async () => {
                                  "use server";
                                  await terminateContract(
                                    contract.id,
                                    contract.roomId,
                                  );
                                }}
                              >
                                <AlertDialogAction
                                  type="submit"
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  ยืนยันแจ้งออก
                                </AlertDialogAction>
                              </form>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
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
