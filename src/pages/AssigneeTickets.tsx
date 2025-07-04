import { useEffect, useState, useRef } from 'react';
import { getAssigneeTickets, resolveTicket, getTicketAttachments } from '@/api/tickets';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useNavigate } from 'react-router-dom';
import { TicketCommentsModal } from '@/components/ui/TicketCommentsModal';
import { Select } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const BACKEND_URL = 'http://localhost:4000';

async function fetchAssigneeInfo() {
  const token = localStorage.getItem('token');
  const res = await fetch('/api/assignee/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch assignee info');
  return res.json();
}

const STATUS_OPTIONS = [
  'Open',
  'In Progress',
  'Waiting for Customer',
  'Resolved',
  'Closed',
];

function AssigneeTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [assignee, setAssignee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [commentTicketId, setCommentTicketId] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    password: '',
    contactNumber: '',
    address: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const initialLoad = useRef(true);
  const [attachments, setAttachments] = useState<Record<string, any[]>>({});
  const [imageModal, setImageModal] = useState<{ open: boolean; src: string; alt: string }>({ open: false, src: '', alt: '' });

  useEffect(() => {
    async function fetchData() {
      try {
        const [assigneeInfo, ticketsData] = await Promise.all([
          fetchAssigneeInfo(),
          getAssigneeTickets()
        ]);
        setAssignee(assigneeInfo);
        setTickets(ticketsData);
        setProfileForm({
          fullName: assigneeInfo.fullName || assigneeInfo.name || '',
          email: assigneeInfo.email || '',
          password: '',
          contactNumber: assigneeInfo.contactNumber || assigneeInfo.contact || '',
          address: assigneeInfo.address || '',
        });
        // Fetch attachments for each ticket
        const attachmentsObj: Record<string, any[]> = {};
        for (const ticket of ticketsData) {
          try {
            attachmentsObj[ticket.id] = await getTicketAttachments(ticket.id);
          } catch {
            attachmentsObj[ticket.id] = [];
          }
        }
        setAttachments(attachmentsObj);
      } catch (err: any) {
        toast({ title: 'Error', description: err.message, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!assignee) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">Failed to load assignee info.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 relative">
        {/* Profile Avatar Icon */}
        <div className="absolute right-0 -top-14">
          <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
            <DialogTrigger asChild>
              <button title="Edit Profile">
                <Avatar>
                  <AvatarFallback>{(assignee.fullName || assignee.name || '?').slice(0,2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setProfileLoading(true);
                  try {
                    await fetch('/api/assignee/update', {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                      },
                      body: JSON.stringify({
                        fullName: profileForm.fullName,
                        email: profileForm.email,
                        password: profileForm.password,
                        contactNumber: profileForm.contactNumber,
                        address: profileForm.address,
                      }),
                    });
                    setAssignee((prev: any) => ({
                      ...prev,
                      fullName: profileForm.fullName,
                      email: profileForm.email,
                      contactNumber: profileForm.contactNumber,
                      address: profileForm.address,
                    }));
                    toast({ title: 'Profile updated', description: 'Your profile has been updated successfully.' });
                    setProfileForm((prev) => ({ ...prev, password: '' }));
                    setProfileOpen(false);
                  } catch (err: any) {
                    toast({ title: 'Error', description: err.message, variant: 'destructive' });
                  } finally {
                    setProfileLoading(false);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block mb-1 font-medium">Full Name</label>
                  <Input
                    name="fullName"
                    value={profileForm.fullName}
                    onChange={e => setProfileForm(f => ({ ...f, fullName: e.target.value }))}
                    required
                    disabled={profileLoading}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Email</label>
                  <Input
                    name="email"
                    type="email"
                    value={profileForm.email}
                    onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))}
                    required
                    disabled={profileLoading}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Contact Number</label>
                  <Input
                    name="contactNumber"
                    value={profileForm.contactNumber}
                    onChange={e => setProfileForm(f => ({ ...f, contactNumber: e.target.value }))}
                    disabled={profileLoading}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Address</label>
                  <Input
                    name="address"
                    value={profileForm.address}
                    onChange={e => setProfileForm(f => ({ ...f, address: e.target.value }))}
                    disabled={profileLoading}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">New Password</label>
                  <Input
                    name="password"
                    type="password"
                    value={profileForm.password}
                    onChange={e => setProfileForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Leave blank to keep current password"
                    minLength={8}
                    disabled={profileLoading}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full" disabled={profileLoading}>
                    {profileLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <Card>
          <CardContent className="py-6">
            <div className="font-bold text-xl mb-1">Assignee: {assignee.fullName || assignee.name}</div>
            <div className="text-sm text-muted-foreground mb-1">Email: {assignee.email}</div>
            <div className="text-sm text-muted-foreground mb-1">Contact: {assignee.contactNumber || assignee.contact}</div>
            <div className="text-sm text-muted-foreground">Address: {assignee.address}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-6">
            <div className="font-bold text-xl mb-2">Assigned Tickets</div>
            {tickets.length === 0 ? (
              <div>No tickets assigned to you yet.</div>
            ) : (
              <ul className="space-y-2">
                {tickets.map(ticket => {
                  const ticketAttachments = attachments[ticket.id] || [];
                  const firstImage = ticketAttachments.find(att => att.mimetype && att.mimetype.startsWith('image/'));
                  const otherAttachments = ticketAttachments.filter(att => !firstImage || att.id !== firstImage.id);
                  const isIncomplete = !ticket.title || !ticket.description;
                  return (
                    <li key={ticket.id} className="border rounded p-2">
                      {/* Image thumbnail at the top of the card */}
                      {firstImage && (
                        <div className="mb-2">
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
                      <div className="font-semibold">{ticket.title || 'No title'}</div>
                      <div className="text-sm text-muted-foreground">{ticket.description || 'No description available'}</div>
                      {isIncomplete && (
                        <div className="text-xs text-red-500">Some ticket details are missing.</div>
                      )}
                      {/* Attachments for this ticket (skip first image) */}
                      {otherAttachments.length > 0 && (
                        <div className="mb-2 mt-2">
                          <div className="font-medium mb-1 text-xs">Attachments:</div>
                          <ul className="list-disc pl-5">
                            {otherAttachments.map(att => (
                              <li key={att.id} className="mb-2">
                                {att.mimetype && att.mimetype.startsWith('image/') ? (
                                  <button
                                    type="button"
                                    onClick={() => setImageModal({ open: true, src: `${BACKEND_URL}/uploads/${att.filename}`, alt: att.originalname })}
                                    className="focus:outline-none"
                                  >
                                    <img
                                      src={`${BACKEND_URL}/uploads/${att.filename}`}
                                      alt={att.originalname}
                                      className="max-h-32 my-2 border rounded shadow hover:opacity-80 transition"
                                    />
                                  </button>
                                ) : (
                                  <a
                                    href={`${BACKEND_URL}/uploads/${att.filename}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline"
                                  >
                                    {att.originalname}
                                  </a>
                                )}
                              </li>
                            ))}
                          </ul>
                          {/* Image Preview Modal */}
                          <Dialog open={imageModal.open} onOpenChange={open => setImageModal(m => ({ ...m, open }))}>
                            <DialogContent className="flex flex-col items-center justify-center max-w-xl">
                              <img src={imageModal.src} alt={imageModal.alt} className="max-h-[70vh] max-w-full rounded shadow" />
                              <div className="mt-2 text-center text-sm text-muted-foreground">{imageModal.alt}</div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs">Status:</span>
                        <select
                          className="border rounded px-2 py-1 text-xs"
                          value={ticket.status}
                          onChange={async (e) => {
                            const newStatus = e.target.value;
                            try {
                              const token = localStorage.getItem('token');
                              await fetch(`/api/tickets/${ticket.id}/status`, {
                                method: 'PATCH',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${token}`,
                                },
                                body: JSON.stringify({ status: newStatus }),
                              });
                              setTickets(tickets => tickets.map(t => t.id === ticket.id ? { ...t, status: newStatus } : t));
                              toast({ title: 'Status updated', description: `Ticket status changed to ${newStatus}.` });
                            } catch (err) {
                              toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
                            }
                          }}
                        >
                          {STATUS_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                        <Button size="sm" variant="outline" onClick={() => setCommentTicketId(ticket.id)}>
                          Comments
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
        <div className="flex justify-center">
          <Button className="mt-2" onClick={() => navigate('/auth')}>Back to Auth</Button>
        </div>
      </div>
      {/* Comment Modal */}
      <TicketCommentsModal
        ticketId={commentTicketId}
        open={!!commentTicketId}
        onClose={() => setCommentTicketId(null)}
        isAssignee={true}
      />
    </div>
  );
}

export default function ProtectedAssigneeTickets() {
  return (
    <ProtectedRoute>
      <AssigneeTicketsPage />
    </ProtectedRoute>
  );
} 