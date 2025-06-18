
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppSidebar } from "@/components/Layout/Sidebar";
import { Header } from "@/components/Layout/Header";
import Dashboard from "./pages/Dashboard";
import AllTickets from "./pages/AllTickets";
import Customers from "./pages/Customers";
import Settings from "./pages/Settings";
import CreateTicket from "./pages/CreateTicket";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <SidebarProvider>
                  <div className="min-h-screen flex w-full bg-gray-50">
                    <AppSidebar />
                    <div className="flex-1 flex flex-col">
                      <Header />
                      <main className="flex-1 p-6">
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/tickets" element={<AllTickets />} />
                          <Route path="/customers" element={<Customers />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route path="/create-ticket" element={<CreateTicket />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </main>
                    </div>
                  </div>
                </SidebarProvider>
              </ProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
