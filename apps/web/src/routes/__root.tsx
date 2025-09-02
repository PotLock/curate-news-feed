import Loader from "@/components/loader";
import { Toaster } from "@/components/ui/sonner";
import type { queryClient, trpc } from "@/utils/trpc";
import {
  HeadContent,
  Outlet,
  createRootRouteWithContext,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import "../index.css";

export interface RouterAppContext {
  trpc: typeof trpc;
  queryClient: typeof queryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  head: () => ({
    meta: [
      {
        title: "CURATE.FUN - Curate News on Socials",
      },
      {
        name: "description",
        content: "Curate news directly on socials and turn feeds into regular content.",
      },
      {
        name: "theme-color",
        content: "#ffffff",
      },
      {
        name: "msapplication-TileColor",
        content: "#ffffff",
      },
      {
        property: "og:title",
        content: "CURATE.FUN - Curate News on Socials",
      },
      {
        property: "og:description", 
        content: "Curate news directly on socials and turn feeds into regular content.",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:url",
        content: "https://curate.fun",
      },
      {
        property: "og:image",
        content: "https://curate.fun/meta.png",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:title",
        content: "CURATE.FUN - Curate News on Socials",
      },
      {
        name: "twitter:description",
        content: "Curate news directly on socials and turn feeds into regular content.",
      },
      {
        name: "twitter:image",
        content: "https://curate.fun/meta.png",
      },
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.ico",
      },
      {
        rel: "icon",
        type: "image/png", 
        sizes: "96x96",
        href: "/favicon-96x96.png",
      },
      {
        rel: "apple-touch-icon",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "manifest",
        href: "/site.webmanifest",
      },
    ],
    scripts: [
      {
        src: "https://unpkg.com/fastintear@latest/dist/umd/browser.global.js",
        type: "text/javascript",
      },
      {
        children: `
      window.near && window.near.config({ networkId: "mainnet" });
      
      if (typeof window.near !== "undefined") {
        console.log("NEAR (via global object 'near') is ready!");
      } else {
        console.error("NEAR global object 'near' not found!");
      }
    `,
        type: "text/javascript",
      },
    ],
  }),
});

function RootComponent() {
  const isFetching = useRouterState({
    select: (s) => s.isLoading,
  });

  return (
    <>
      <HeadContent />
        <div className="grid grid-rows-[auto_1fr] h-svh touch-manipulation">
          {isFetching ? <Loader /> : <Outlet />}
        </div>
        <Toaster richColors />
      <TanStackRouterDevtools position="bottom-left" />
    </>
  );
}
