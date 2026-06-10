import { useQuery } from "@tanstack/react-query";
import Head from "next/head";
import AdminLayout from "@/components/admin/AdminLayout";
import StatsWindow from "@/components/admin/StatsWindow";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import GrowthChart from "@/components/admin/GrowthChart";
import { Skeleton } from "@/components/ui/skeleton";
import { _getAdminStats } from "@/network/admin";
import { withAdminAuth } from "@/lib/adminServerSideProps";

function StatsSkeleton({ count = 2 }) {
  return (
    <div className={`grid gap-3 ${count === 5 ? "grid-cols-2 lg:grid-cols-5" : "grid-cols-2"}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-[#2A2520] rounded-2xl border border-[#E5D7C4] dark:border-white/10 p-5">
          <Skeleton className="h-3 w-24 mb-3" />
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

export default function AdminStats() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => _getAdminStats().then((r) => r.data),
    staleTime: 60_000,
  });

  return (
    <>
      <Head>
        <title>Stats — Designfolio Admin</title>
      </Head>
      <AdminLayout title="Stats">
        <div className="max-w-5xl space-y-8">
          {isError ? (
            <p className="text-sm text-red-500">Failed to load stats.</p>
          ) : (
            <>
              {/* Overview */}
              <section>
                <h2 className="text-sm font-semibold text-[#1A1A1A] dark:text-[#F0EDE7] mb-4">Overview</h2>
                <div className="h-px bg-[#E5D7C4] dark:bg-white/10 mb-4" />
                <div className="bg-white dark:bg-[#2A2520] rounded-2xl border border-[#E5D7C4] dark:border-white/10 p-5">
                  {isLoading ? <StatsSkeleton count={5} /> : <StatsWindow data={data?.overall} isOverall compact />}
                </div>
              </section>

              {/* Recent ranges (compact tabs) */}
              <section>
                <h2 className="text-sm font-semibold text-[#1A1A1A] dark:text-[#F0EDE7] mb-4">Recent</h2>
                <div className="h-px bg-[#E5D7C4] dark:bg-white/10 mb-4" />
                <div className="bg-white dark:bg-[#2A2520] rounded-2xl border border-[#E5D7C4] dark:border-white/10 p-5">
                  {isLoading ? (
                    <StatsSkeleton />
                  ) : (
                    <Tabs defaultValue="today">
                      <TabsList>
                        <TabsTrigger value="today">Today</TabsTrigger>
                        <TabsTrigger value="7days">7 Days</TabsTrigger>
                        <TabsTrigger value="30days">30 Days</TabsTrigger>
                      </TabsList>
                      <TabsContent value="today">
                        <StatsWindow data={data?.today} compact />
                      </TabsContent>
                      <TabsContent value="7days">
                        <StatsWindow data={data?.last7Days} compact />
                      </TabsContent>
                      <TabsContent value="30days">
                        <StatsWindow data={data?.last30Days} compact />
                      </TabsContent>
                    </Tabs>
                  )}
                </div>
              </section>

              {/* Growth chart */}
              <section>
                <div className="h-px bg-[#E5D7C4] dark:bg-white/10 mb-6" />
                <div className="bg-white dark:bg-[#2A2520] rounded-2xl border border-[#E5D7C4] dark:border-white/10 p-5">
                  {isLoading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : (
                    <GrowthChart timeSeries={data?.timeSeries} />
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </AdminLayout>
    </>
  );
}

export const getServerSideProps = withAdminAuth();
