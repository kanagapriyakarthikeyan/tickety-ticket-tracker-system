import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import  ProtectedRoute  from "@/components/ProtectedRoute";
import { AppSidebar } from "@/components/Layout/Sidebar";
import Header from "@/components/Layout/Header";
import { AssigneeRegistration } from "@/components/auth/AssigneeRegistration";
import Dashboard from "./pages/Dashboard";
import AllTickets from "./pages/AllTickets";
import Customers from "./pages/Customers";
import Assignees from "./pages/Assignees";
import Settings from "./pages/Settings";
import CreateTicket from "./pages/CreateTicket";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import CustomerLogin from "./pages/CustomerLogin";
import AssigneeRegister from "./pages/AssigneeRegister";
import AssigneeLogin from "./pages/AssigneeLogin";
import AssigneeTickets from "./pages/AssigneeTickets";
import Profile from "./pages/Profile";
import CustomerTicketDetails from './pages/CustomerTicketDetails';
import ResetPassword from './pages/ResetPassword';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/auth" replace />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/customer-login" element={<CustomerLogin />} />
            <Route path="/assignee-login" element={<AssigneeLogin />} />
            <Route path="/assignee-register" element={<AssigneeRegister />} />
            <Route path="/assignee/tickets" element={<AssigneeTickets />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <SidebarProvider>
                  <div className="min-h-screen flex w-full bg-gray-50">
                    <AppSidebar />
                    <div className="flex-1 flex flex-col">
                      <Header />
                      <main className="flex-1 p-6">
                        <Routes>
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/tickets" element={<AllTickets />} />
                          <Route path="/customers" element={<Customers />} />
                          <Route path="/customers/:customerId/history" element={<CustomerTicketDetails />} />
                          <Route path="/assignees" element={<Assignees />} />
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
