import { useQuery } from "@tanstack/react-query";
import Head from "next/head";
import AdminLayout from "@/components/admin/AdminLayout";
import StatsWindow from "@/components/admin/StatsWindow";
import RevenuePanel from "@/components/admin/RevenuePanel";
import SubscriptionBreakdown from "@/components/admin/SubscriptionBreakdown";
import StatsCard from "@/components/admin/StatsCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import GrowthChart from "@/components/admin/GrowthChart";
import { Skeleton } from "@/components/ui/skeleton";
import { _getAdminStats } from "@/network/admin";
import { withAdminAuth } from "@/lib/adminServerSideProps";
import { UserPlus, TrendingDown, ArrowRightCircle } from "lucide-react";

function SectionHeader({ children }) {
  return (
    <div className="mb-4">
      <h2 className="font-manrope text-xs font-semibold tracking-widest text-[#7A736C] uppercase dark:text-[#B5AFA5]">
        {children}
      </h2>
      <div className="mt-2 h-px bg-[#E5D7C4] dark:bg-white/[0.07]" />
    </div>
  );
}

function CardSkeleton({ className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-[#E5D7C4] bg-white p-5 dark:border-white/10 dark:bg-[#2A2520] ${className}`}
    >
      <Skeleton className="mb-3 h-3 w-20" />
      <Skeleton className="h-8 w-24" />
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
        <div className="max-w-5xl space-y-10">
          {isError ? (
            <p className="text-sm text-red-500">Failed to load stats.</p>
          ) : (
            <>
              {/* ── Overview ───────────────────────────────────────────── */}
              <section>
                <SectionHeader>Overview</SectionHeader>
                {isLoading ? (
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <CardSkeleton key={i} />
                      ))}
                    </div>
                    <CardSkeleton className="py-5" />
                  </div>
                ) : (
                  <StatsWindow data={data?.overall} isOverall />
                )}
              </section>

              {/* ── Revenue & Growth ────────────────────────────────────── */}
              <section>
                <SectionHeader>Revenue &amp; Growth</SectionHeader>
                {isLoading ? (
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="space-y-3 rounded-2xl border border-[#E5D7C4] bg-white p-5 dark:border-white/10 dark:bg-[#2A2520]">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <CardSkeleton />
                      <div className="grid grid-cols-2 gap-3">
                        <CardSkeleton />
                        <CardSkeleton />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <RevenuePanel overall={data?.overall} />

                    <div className="flex flex-col gap-3">
                      <StatsCard
                        label="New Pro Users"
                        value={data?.growth?.newProUsers30d ?? 0}
                        icon={UserPlus}
                        index={0}
                        subText="converted in last 30 days"
                      />
                      <div className="grid flex-1 grid-cols-2 gap-3">
                        <StatsCard
                          label="Churn Rate"
                          value={data?.growth?.churnRate ?? 0}
                          suffix="%"
                          icon={TrendingDown}
                          index={1}
                          info="Subscriptions that expired in the last 30 days ÷ (active + expired in 30d)"
                        />
                        <StatsCard
                          label="Trial → Paid"
                          value={data?.growth?.trialToPaidConversion ?? 0}
                          suffix="%"
                          icon={ArrowRightCircle}
                          index={2}
                          info="New pro users (30d) ÷ New signups (30d) — how many new users converted to paid"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* ── Subscriptions + Recent ──────────────────────────────── */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch">
                <section className="flex flex-col">
                  <SectionHeader>Subscriptions</SectionHeader>
                  {isLoading ? (
                    <div className="flex-1 space-y-4 rounded-2xl border border-[#E5D7C4] bg-white p-5 dark:border-white/10 dark:bg-[#2A2520]">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-1.5 w-full rounded-full" />
                      <div className="flex flex-wrap gap-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <Skeleton key={i} className="h-7 w-24 rounded-full" />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <SubscriptionBreakdown subscriptions={data?.subscriptions} className="flex-1" />
                  )}
                </section>

                <section className="flex flex-col">
                  <SectionHeader>Recent</SectionHeader>
                  <div className="flex flex-1 flex-col rounded-2xl border border-[#E5D7C4] bg-white p-5 dark:border-white/10 dark:bg-[#2A2520]">
                    {isLoading ? (
                      <div className="grid grid-cols-2 gap-3">
                        <CardSkeleton />
                        <CardSkeleton />
                      </div>
                    ) : (
                      <Tabs defaultValue="today" className="flex flex-1 flex-col">
                        <TabsList className="w-fit">
                          <TabsTrigger value="today">Today</TabsTrigger>
                          <TabsTrigger value="7days">7 Days</TabsTrigger>
                          <TabsTrigger value="30days">30 Days</TabsTrigger>
                        </TabsList>
                        <TabsContent value="today" className="mt-4 flex-1">
                          <StatsWindow
                            data={data?.today}
                            prevData={data?.yesterday}
                            deltaLabel="vs yesterday"
                          />
                        </TabsContent>
                        <TabsContent value="7days" className="mt-4 flex-1">
                          <StatsWindow
                            data={data?.last7Days}
                            prevData={data?.prev7Days}
                            deltaLabel="vs prev 7d"
                          />
                        </TabsContent>
                        <TabsContent value="30days" className="mt-4 flex-1">
                          <StatsWindow
                            data={data?.last30Days}
                            prevData={data?.prev30Days}
                            deltaLabel="vs prev 30d"
                          />
                        </TabsContent>
                      </Tabs>
                    )}
                  </div>
                </section>
              </div>

              {/* ── Growth Chart ────────────────────────────────────────── */}
              <section>
                <SectionHeader>Trends</SectionHeader>
                <div className="rounded-2xl border border-[#E5D7C4] bg-white p-5 dark:border-white/10 dark:bg-[#2A2520]">
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
