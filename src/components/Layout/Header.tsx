
import React from 'react';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Bell, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function Header() {
  const { signOut, user } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      });
    }
  };

  return (
    <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex h-16 items-center px-4 gap-4">
        <SidebarTrigger />
        <div className="flex-1" />
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            Welcome, {user?.email}
          </span>
          <Button variant="outline" size="sm">
            <Bell className="w-4 h-4" />
          </Button>
          <Link to="/create-ticket">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              Create Ticket
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
