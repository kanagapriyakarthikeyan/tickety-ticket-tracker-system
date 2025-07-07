import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ticket, Calendar, Users, TrendingUp, Clock } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { apiRequest } from '@/api/tickets';
import { Button } from '@/components/ui/button';
import { getTicketsByMonth, getTicketsByPriority, getAverageResponseTime } from '@/api/dashboard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, Label } from 'recharts';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const [summary, setSummary] = useState({
    totalTickets: 0,
    openTickets: 0,
    totalCustomers: 0,
    resolvedToday: 0,
  });
  const [recentTickets, setRecentTickets] = useState([]);
  const [ticketsByMonth, setTicketsByMonth] = useState([]);
  const [ticketsByPriority, setTicketsByPriority] = useState([]);
  const [avgResponseTime, setAvgResponseTime] = useState([]);
  const location = useLocation();

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const tickets = await apiRequest('/tickets');
        
        // Calculate summary statistics
        const totalTickets = tickets.length;
        const openTickets = tickets.filter(ticket => ticket.status === 'Open').length;
        const uniqueCustomers = new Set(tickets.map(ticket => ticket.customerEmail)).size;
        
        // Calculate resolved today (tickets resolved today)
        const today = new Date().toDateString();
        const resolvedToday = tickets.filter(ticket => {
          if (ticket.status === 'Resolved' && ticket.resolvedAt) {
            return new Date(ticket.resolvedAt).toDateString() === today;
          }
          return false;
        }).length;

        setSummary({
          totalTickets,
          openTickets,
          totalCustomers: uniqueCustomers,
          resolvedToday,
        });

        // Get recent tickets (last 5, sorted by creation date)
        const sortedTickets = tickets.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRecentTickets(sortedTickets.slice(0, 5));

        // Fetch chart data
        getTicketsByMonth().then(setTicketsByMonth);
        getTicketsByPriority().then(setTicketsByPriority);
        getAverageResponseTime().then(setAvgResponseTime);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    }

    fetchDashboardData();
  }, [location]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your ticket management system</p>
        </div>
        <Link to="/create-ticket">
          <Button>Create New Ticket</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalTickets}</div>
            <p className="text-xs text-muted-foreground">All time tickets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summary.openTickets}</div>
            <p className="text-xs text-muted-foreground">Awaiting resolution</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.resolvedToday}</div>
            <p className="text-xs text-muted-foreground">Tickets resolved</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tickets by Month</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ticketsByMonth.map(m => ({ month: m.month ? m.month.substring(0, 3) : '', count: parseInt(m.count) }))}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" animationDuration={1200} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tickets by Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart width={250} height={250}>
                <Pie
                  data={ticketsByPriority.map(p => ({ priority: p.priority, count: parseInt(p.count) }))}
                  dataKey="count"
                  nameKey="priority"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  label
                  isAnimationActive={true}
                  animationBegin={0}
                  animationDuration={1500}
                  animationEasing="ease-out"
                >
                  {ticketsByPriority.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={["#22c55e", "#facc15", "#f97316", "#ef4444"][index % 4]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Average Response Time (Hours)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={avgResponseTime}>
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#a78bfa" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day">
                  <Label value="Day of Week" offset={-5} position="insideBottom" />
                </XAxis>
                <YAxis>
                  <Label value="Avg Hours" angle={-90} position="insideLeft" />
                </YAxis>
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="avgHours"
                  stroke="url(#colorUv)"
                  strokeWidth={3}
                  dot={{ r: 4, stroke: "#6366f1", strokeWidth: 2, fill: "#fff" }}
                  activeDot={{ r: 6, fill: "#6366f1" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentTickets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No tickets found. Create your first ticket to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTickets.map((ticket) => (
                <div key={ticket.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{ticket.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Ticket #{ticket.id} • Customer: {ticket.customerName} ({ticket.customerEmail})
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        ticket.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                        ticket.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                        ticket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {ticket.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        ticket.status === 'Open' ? 'bg-blue-100 text-blue-800' :
                        ticket.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                        ticket.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{ticket.description}</p>
                  <div className="text-xs text-muted-foreground">
                    Created: {new Date(ticket.createdAt).toLocaleString()}
                    {ticket.category && ` • Category: ${ticket.category}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
