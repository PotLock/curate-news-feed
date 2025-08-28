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
          <SidebarInset className="flex flex-col bg-[#FAFAFA] w-full">
            <Header />
            <main className="flex-1 bg-[#FAFAFA] px-4 sm:px-6 lg:px-8">
              <Outlet />
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </SearchProvider>
  );
}
