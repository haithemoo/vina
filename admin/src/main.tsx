import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { trpc } from "./lib/trpc";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient();

// En dev, si l'admin tourne sur un autre port (ex. 5174), définir VITE_API_URL=http://localhost:10000 dans admin/.env
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) return `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/api/trpc`;
  if (typeof window !== "undefined") return `${window.location.origin}/api/trpc`;
  return "/api/trpc";
};

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: getApiUrl(),
      transformer: superjson,
      fetch(input, init) {
        return fetch(input, { ...(init ?? {}), credentials: "include" });
      },
    }),
  ],
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </trpc.Provider>
  </React.StrictMode>
);
