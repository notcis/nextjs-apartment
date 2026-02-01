import { getBranches, deleteBranch } from "@/actions/branches.action";
import { BranchDialog } from "./_components/branch-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Building2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function BranchesPage() {
  const branches = await getBranches();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            จัดการสาขา (Buildings)
          </h1>
          <p className="text-muted-foreground">
            จัดการข้อมูลตึกและเรทค่าน้ำ-ค่าไฟของแต่ละสถานที่
          </p>
        </div>
        <BranchDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายชื่อสาขาทั้งหมด</CardTitle>
          <CardDescription>มีทั้งหมด {branches.length} สาขา</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>ชื่อสาขา</TableHead>
                <TableHead>ที่อยู่</TableHead>
                <TableHead>ค่าน้ำ (บาท/หน่วย)</TableHead>
                <TableHead>ค่าไฟ (บาท/หน่วย)</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center h-24 text-muted-foreground"
                  >
                    ยังไม่มีข้อมูลสาขา กรุณาเพิ่มสาขาแรก
                  </TableCell>
                </TableRow>
              ) : (
                branches.map((branch) => (
                  <TableRow key={branch.id}>
                    <TableCell>
                      <div className="p-2 bg-primary/10 rounded-md w-fit">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{branch.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {branch.address || "-"}
                    </TableCell>
                    <TableCell>{Number(branch.waterRate).toFixed(2)}</TableCell>
                    <TableCell>{Number(branch.elecRate).toFixed(2)}</TableCell>
                    <TableCell className="text-right flex justify-end gap-2">
                      <BranchDialog
                        branchToEdit={{
                          ...branch,
                          waterRate: Number(branch.waterRate),
                          elecRate: Number(branch.elecRate),
                        }}
                      />

                      <form
                        action={async () => {
                          "use server";
                          await deleteBranch(branch.id);
                        }}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          // ควรใส่ confirm dialog ก่อนลบจริงใน production
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
        </CardContent>
      </Card>
    </div>
  );
}
