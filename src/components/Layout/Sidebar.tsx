import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Ticket, Users, Settings, UserCheck } from 'lucide-react';

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "All Tickets",
    url: "/tickets",
    icon: Ticket,
  },
  {
    title: "Customers",
    url: "/customers",
    icon: Users,
  },
  {
    title: "Assignees",
    url: "/assignees",
    icon: UserCheck,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="w-56 min-h-screen bg-white border-r flex flex-col">
      {/* Logo and subtitle */}
      <div className="pl-4 pr-4 pt-4 pb-2">
        <h2 className="text-xl font-bold text-primary">TicketFlow</h2>
        <p className="text-sm text-muted-foreground">Ticket Management System</p>
      </div>
      {/* Navigation label */}
      <div className="text-xs text-muted-foreground pl-4 pb-2">Navigation</div>
      {/* Menu */}
      <nav className="flex-1">
        <ul className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <li key={item.title}>
                <Link
                  to={item.url}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                    ${isActive ? 'border border-blue-500 bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-100 text-gray-800'}`}
                >
                  <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
