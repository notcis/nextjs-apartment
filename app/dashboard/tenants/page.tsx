import { getTenants, deleteTenant } from "@/actions/tenants.action";
import { TenantDialog } from "./_components/tenant-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trash2, Phone, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function TenantsPage() {
  const tenants = await getTenants();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">รายชื่อผู้เช่า</h1>
          <p className="text-muted-foreground">
            จัดการข้อมูลผู้เช่าและประวัติการติดต่อ
          </p>
        </div>
        <TenantDialog />
      </div>

      <div className="border rounded-lg shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>ชื่อ-นามสกุล</TableHead>
              <TableHead>เลขบัตร ปชช.</TableHead>
              <TableHead>ช่องทางติดต่อ</TableHead>
              <TableHead>สถานะสัญญา</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center h-24 text-muted-foreground"
                >
                  ยังไม่มีข้อมูลผู้เช่า
                </TableCell>
              </TableRow>
            ) : (
              tenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell>
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {tenant.firstName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">
                    {tenant.firstName} {tenant.lastName}
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono">
                    {tenant.idCard}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {tenant.phone}
                      </div>
                      {tenant.lineId && (
                        <div className="flex items-center gap-2 text-green-600">
                          <MessageCircle className="h-3 w-3" />
                          {tenant.lineId}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {tenant._count.contracts > 0 ? (
                      <Badge variant="default" className="bg-green-500">
                        มีสัญญาเช่า
                      </Badge>
                    ) : (
                      <Badge variant="secondary">ไม่มีสัญญา</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <TenantDialog tenantToEdit={tenant} />

                    <form
                      action={async () => {
                        "use server";
                        // ควรมีการแจ้งเตือน (Alert) ก่อนลบจริง
                        const res = await deleteTenant(tenant.id);
                        if (!res.success) {
                          // ใน Server Action แบบ Form ธรรมดาอาจจะ alert ยากหน่อย
                          // ปกติจะใช้ useFormState หรือ toast แต่เพื่อความง่ายจะ log ไว้
                          console.error(res.error);
                        }
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
