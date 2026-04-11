import { createClient } from "@/lib/supabase/server";
import { getSupabaseBrowserCredentials } from "@/lib/env";
import { redirect } from "next/navigation";
import { DashboardTopBar } from "@/components/dashboard/dashboard-top-bar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  const user = data.user;
  const userEmail = user.email || '';
  const userName = user.email?.split('@')[0] || 'User';
  const userAvatar = user.user_metadata?.avatar_url || null;
  const supabaseBrowser = getSupabaseBrowserCredentials();

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-surface">
      <DashboardTopBar
        userName={userName}
        userEmail={userEmail}
        userAvatar={userAvatar}
        supabaseBrowser={supabaseBrowser}
      />

      <div className="flex-1 overflow-hidden bg-surface">
        {children}
      </div>
    </div>
  );
}
