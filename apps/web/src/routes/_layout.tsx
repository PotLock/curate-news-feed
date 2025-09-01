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
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen flex w-full bg-[#FAFAFA]">
          <FeedSidebar />
          <SidebarInset className="flex flex-col bg-[#FAFAFA] w-full max-w-[100vw] md:max-w-[calc(100vw-var(--sidebar-width))]">
            <Header />
            <main className="flex-1 bg-[#FAFAFA] px-2 sm:px-4 lg:px-0">
              <Outlet />
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </SearchProvider>
  );
}
