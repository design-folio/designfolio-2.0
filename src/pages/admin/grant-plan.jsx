import Head from "next/head";
import AdminLayout from "@/components/admin/AdminLayout";
import GrantPlanForm from "@/components/admin/GrantPlanForm";
import { withAdminAuth } from "@/lib/adminServerSideProps";

export default function AdminGrantPlan() {
  return (
    <>
      <Head>
        <title>Grant Plan — Designfolio Admin</title>
      </Head>
      <AdminLayout title="Grant Plan">
        <div className="max-w-xl">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">
              Grant Plan
            </h2>
            <p className="text-xs text-[#7A736C] dark:text-[#B5AFA5] mt-0.5">
              Manually grant Pro access to one or more users by email.
            </p>
          </div>
          <GrantPlanForm />
        </div>
      </AdminLayout>
    </>
  );
}

export const getServerSideProps = withAdminAuth();
