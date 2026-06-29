import Head from "next/head";
import AdminLayout from "@/components/admin/AdminLayout";
import UsersTable from "@/components/admin/UsersTable";
import { withAdminAuth } from "@/lib/adminServerSideProps";

export default function AdminUsers() {
  return (
    <>
      <Head>
        <title>Users — Designfolio Admin</title>
      </Head>
      <AdminLayout title="Users">
        <div className="max-w-6xl">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">
              All Users
            </h2>
            <p className="mt-0.5 text-xs text-[#7A736C] dark:text-[#B5AFA5]">
              Search, filter, and manage Designfolio users.
            </p>
          </div>
          <UsersTable />
        </div>
      </AdminLayout>
    </>
  );
}

export const getServerSideProps = withAdminAuth();
