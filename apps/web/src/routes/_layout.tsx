import Header from "@/components/header";
import FeedSidebar from "@/components/feed-sidebar";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SearchProvider } from "@/contexts/search-context";

export const Route = createFileRoute("/_layout")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SearchProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full" style={{ backgroundColor: '#FAFAFA' }}>
          <FeedSidebar />
          <SidebarInset className="flex flex-col" style={{ backgroundColor: '#FAFAFA' }}>
            <Header />
            <main className="flex-1" style={{ backgroundColor: '#FAFAFA' }}>
              <Outlet />
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </SearchProvider>
  );
}
