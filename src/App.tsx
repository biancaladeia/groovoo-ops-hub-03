import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import DashboardLayout from "./components/layout/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import EventsDashboard from "./pages/EventsDashboard";
import ServiceDesk from "./pages/ServiceDesk";
import GitHubQA from "./pages/GitHubQA";
import AuditLog from "./pages/AuditLog";
import KnowledgeBase from "./pages/KnowledgeBase";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="events" element={<EventsDashboard />} />
            <Route path="service-desk" element={<ServiceDesk />} />
            <Route path="github-qa" element={<GitHubQA />} />
            <Route path="audit" element={<AuditLog />} />
            <Route path="wiki" element={<KnowledgeBase />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
