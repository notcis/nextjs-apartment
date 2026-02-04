import { Skeleton } from "@/components/ui/skeleton";

const graphHeights = [45, 70, 30, 85, 50, 90, 25, 65, 80, 40, 75, 35];

export default function DashboardLoading() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <Skeleton className="h-9 w-[150px] mb-2" />
          <Skeleton className="h-4 w-[250px]" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-[120px]" />
        </div>
      </div>

      {/* Stats Cards Skeleton (4 ใบ) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border bg-card text-card-foreground shadow p-6"
          >
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            <div className="pt-2">
              <Skeleton className="h-8 w-[60px] mb-1" />
              <Skeleton className="h-3 w-[120px]" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Chart Area Skeleton (กินพื้นที่ 4/7) */}
        <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6">
            <Skeleton className="h-6 w-[150px] mb-4" />
            {/* จำลองแท่งกราฟ */}
            <div className="flex items-end gap-2 h-[300px] w-full pt-4">
              {graphHeights.map((height, i) => (
                <Skeleton
                  key={i}
                  className="w-full"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity / List Skeleton (กินพื้นที่ 3/7) */}
        <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6">
            <Skeleton className="h-6 w-[150px] mb-4" />
            <div className="space-y-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="ml-4 space-y-1">
                    <Skeleton className="h-4 w-[140px]" />
                    <Skeleton className="h-3 w-[100px]" />
                  </div>
                  <div className="ml-auto font-medium">
                    <Skeleton className="h-4 w-[60px]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
