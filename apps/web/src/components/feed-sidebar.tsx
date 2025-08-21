import { useQuery } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import { useTRPC } from "@/utils/trpc";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import logoImg from "@/assets/Light/Logo.png";

export default function FeedSidebar() {
  const trpc = useTRPC();
  const router = useRouterState();

  // Extract feedId from current location
  const currentFeedId = router.location.pathname.split("/")[1];

  const queryOptions = trpc.getFeeds.queryOptions();
  const { data: feedsData, isLoading, error } = useQuery(queryOptions);

  return (
    <Sidebar style={{ backgroundColor: "#FAFAFA" }}>
      <SidebarHeader
        className="p-2 h-[69px] flex items-center justify-center"
        style={{ backgroundColor: "#FAFAFA" }}
      >
        <img src={logoImg} alt="Curate.fun Logo" className="h-8 w-auto" />
      </SidebarHeader>

      <SidebarContent
        className="px-4 pt-2 relative overflow-y-auto max-h-[calc(100vh-69px)] custom-scrollbar"
        style={{ backgroundColor: "#FAFAFA" }}
      >
        <SidebarGroup style={{ backgroundColor: "#FAFAFA" }}>
          <SidebarGroupContent style={{ backgroundColor: "#FAFAFA" }}>
            <SidebarMenu className="gap-2.5">
              {isLoading && (
                <>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <SidebarMenuItem key={i}>
                      <SidebarMenuSkeleton />
                    </SidebarMenuItem>
                  ))}
                </>
              )}

              {error && (
                <SidebarMenuItem>
                  <SidebarMenuButton className="py-2 px-3 font-geist text-sm text-neutral-900 font-medium leading-6">
                    <span className="text-red-500 text-sm">
                      Error loading feeds
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {feedsData?.items?.map((feed: any) => {
                const isActive = currentFeedId === feed.id;

                return (
                  <SidebarMenuItem key={feed.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      style={isActive ? { backgroundColor: "#e5e5e5" } : {}}
                      className={cn(
                        "py-2 px-3 font-geist text-sm text-neutral-900 min-h-[40px] rounded-md font-medium leading-6 hover:bg-[#e5e5e5] active:bg-[#e5e5e5] focus:bg-[#e5e5e5]",
                        isActive && "bg-[#e5e5e5]"
                      )}
                    >
                      <Link to="/$feedId" params={{ feedId: feed.id! }}>
                        <span>{feed.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              {!isLoading && !error && !feedsData?.items?.length && (
                <SidebarMenuItem>
                  <SidebarMenuButton className="py-2 px-3 font-geist text-sm text-neutral-900 font-medium leading-6">
                    <span className="text-muted-foreground text-sm">
                      No feeds available
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
