import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { apiRequest, getTicketAttachments } from '@/api/tickets'; // Use apiRequest directly for /tickets
import { TicketCommentsModal } from '@/components/ui/TicketCommentsModal';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const BACKEND_URL = 'http://localhost:4000';

export default function AllTickets() {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const location = useLocation();
  const [commentTicketId, setCommentTicketId] = useState(null);
  const [attachments, setAttachments] = useState<Record<string, any[]>>({});
  const [imageModal, setImageModal] = useState<{ open: boolean; src: string; alt: string }>({ open: false, src: '', alt: '' });

  useEffect(() => {
    apiRequest('/tickets').then((data) => {
      console.log('Fetched tickets from API:', data); // Debug log
      setTickets(data);
      setFilteredTickets(data);
      // Fetch attachments for all tickets
      const fetchAllAttachments = async () => {
        const obj: Record<string, any[]> = {};
        for (const t of data) {
          try {
            obj[t.id] = await getTicketAttachments(t.id);
          } catch {
            obj[t.id] = [];
          }
        }
        setAttachments(obj);
      };
      fetchAllAttachments();
    });
  }, [location]);

  useEffect(() => {
    let filtered = tickets.filter((ticket) => {
      const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ticket.customerName && ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
    setFilteredTickets(filtered);
  }, [tickets, searchTerm, statusFilter, priorityFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">All Tickets</h1>
          <p className="text-muted-foreground">Manage and track all support tickets</p>
        </div>
        <Link to="/create-ticket">
          <Button>Create New Ticket</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tickets ({filteredTickets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTickets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {tickets.length === 0 
                  ? "No tickets found. Create your first ticket to get started!" 
                  : "No tickets match your current filters."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTickets.map((ticket) => {
                const ticketAttachments = attachments[ticket.id] || [];
                const firstImage = ticketAttachments.find(att => att.mimetype && att.mimetype.startsWith('image/'));
                return (
                <div key={ticket.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    {/* Image thumbnail at the top of the card */}
                    {firstImage && (
                      <div className="mb-3">
                        <button
                          type="button"
                          onClick={() => setImageModal({ open: true, src: `${BACKEND_URL}/uploads/${firstImage.filename}`, alt: firstImage.originalname })}
                          className="focus:outline-none"
                        >
                          <img
                            src={`${BACKEND_URL}/uploads/${firstImage.filename}`}
                            alt={firstImage.originalname}
                            className="max-h-32 w-full object-cover rounded shadow hover:opacity-80 transition"
                          />
                        </button>
                      </div>
                    )}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{ticket.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Ticket #{ticket.id} • Customer: {ticket.customerName} ({ticket.customerEmail})
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm mb-4 text-gray-600">{ticket.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-muted-foreground">
                      Created: {new Date(ticket.createdAt).toLocaleString()}
                      {ticket.category && ` • Category: ${ticket.category}`}
                    </div>
                    </div>
                    <div className="flex justify-end mt-2">
                      <Button size="sm" variant="outline" onClick={() => setCommentTicketId(ticket.id)}>
                        Comments
                          </Button>
                      </div>
                  </div>
                );
              })}
            </div>
          )}
          {/* Image Preview Modal */}
          <Dialog open={imageModal.open} onOpenChange={open => setImageModal(m => ({ ...m, open }))}>
            <DialogContent className="flex flex-col items-center justify-center max-w-xl">
              <img src={imageModal.src} alt={imageModal.alt} className="max-h-[70vh] max-w-full rounded shadow" />
              <div className="mt-2 text-center text-sm text-muted-foreground">{imageModal.alt}</div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Comment Modal */}
      <TicketCommentsModal
        ticketId={commentTicketId}
        open={!!commentTicketId}
        onClose={() => setCommentTicketId(null)}
      />
    </div>
  );
}
