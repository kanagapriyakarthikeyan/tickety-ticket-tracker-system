import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTicketComments, addTicketComment, getTicketAttachments, getCommentAttachments } from '@/api/tickets';
import { apiRequest } from '@/api/client';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export default function CustomerTicketDetails() {
  const { customerId, ticketId } = useParams<{ customerId?: string; ticketId?: string }>();
  const [tickets, setTickets] = useState<any[]>([]);
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [ticketComments, setTicketComments] = useState<Record<string, any[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});
  const [addingComment, setAddingComment] = useState<Record<string, boolean>>({});
  const [attachments, setAttachments] = useState<Record<string, any[]>>({});
  const [commentFiles, setCommentFiles] = useState<Record<string, File | null>>({});
  const [commentAttachments, setCommentAttachments] = useState<Record<string, any[]>>({});
  const { toast } = useToast();
  const navigate = useNavigate();
  const [imageModal, setImageModal] = useState<{ open: boolean; src: string; alt: string }>({ open: false, src: '', alt: '' });
  const BACKEND_URL = 'http://localhost:4000';

  useEffect(() => {
    if (ticketId) {
      fetchComments(ticketId);
      fetchAttachments(ticketId);
    } else if (customerId) {
      fetchTickets();
    }
  }, [customerId, ticketId]);

  const fetchTickets = async () => {
    try {
      const data = await apiRequest(`/customers/${customerId}/tickets`);
      setTickets(data);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const fetchComments = async (id: string) => {
    setLoadingComments(prev => ({ ...prev, [id]: true }));
    try {
      const data = await getTicketComments(id);
      setTicketComments(prev => ({ ...prev, [id]: data }));
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoadingComments(prev => ({ ...prev, [id]: false }));
    }
  };

  const fetchAttachments = async (id: string) => {
    try {
      const data = await getTicketAttachments(id);
      setAttachments(prev => ({ ...prev, [id]: data }));
    } catch (err: any) {
      toast({ title: 'Error', description: 'Failed to fetch attachments', variant: 'destructive' });
    }
  };

  const fetchCommentAttachments = async (commentId: string) => {
    try {
      const data = await getCommentAttachments(commentId);
      setCommentAttachments(prev => ({ ...prev, [commentId]: data }));
    } catch (err: any) {
      // Optionally toast error
    }
  };

  const handleExpand = (id: string) => {
    if (expandedTicketId === id) {
      setExpandedTicketId(null);
    } else {
      setExpandedTicketId(id);
      if (!ticketComments[id]) {
        fetchComments(id);
      }
      if (!attachments[id]) {
        fetchAttachments(id);
      }
    }
  };

  const handleAddComment = async (ticketId: string) => {
    const text = commentInputs[ticketId]?.trim();
    if (!text) return;
    setAddingComment(prev => ({ ...prev, [ticketId]: true }));
    try {
      const comment = await addTicketComment(ticketId, text);
      // Upload file if selected
      const file = commentFiles[ticketId];
      if (file && comment && comment.id) {
        const formDataObj = new FormData();
        formDataObj.append('file', file);
        const token = localStorage.getItem('token');
        await fetch(`/api/comments/${comment.id}/attachments`, {
          method: 'POST',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          body: formDataObj,
        });
      }
      setCommentInputs(prev => ({ ...prev, [ticketId]: '' }));
      setCommentFiles(prev => ({ ...prev, [ticketId]: null }));
      fetchComments(ticketId);
      toast({ title: 'Comment added' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setAddingComment(prev => ({ ...prev, [ticketId]: false }));
    }
  };

  if (ticketId) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Details</CardTitle>
              <CardDescription>Ticket ID: {ticketId}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* You can fetch and display more ticket details here if needed */}
              <h3 className="font-semibold mb-2">Comments</h3>
                {ticketComments[ticketId]?.length === 0 ? (
                <div>No comments yet.</div>
              ) : (
                  <div className="space-y-2 mb-2">
                    {ticketComments[ticketId]?.map(comment => {
                      useEffect(() => {
                        if (!commentAttachments[comment.id]) {
                          fetchCommentAttachments(comment.id);
                        }
                        // eslint-disable-next-line
                      }, []);
                      return (
                        <div key={comment.id} className="p-2 border rounded mb-2">
                          <span className="font-medium">{comment.author || comment.full_name}:</span> {comment.content}
                          {commentAttachments[comment.id] && commentAttachments[comment.id].length > 0 && (
                            <div className="mt-1">
                              <div className="text-xs font-medium">Attachments:</div>
                              <ul className="list-disc pl-5">
                                {commentAttachments[comment.id].map(att => (
                                  <li key={att.id}>
                                    <a href={`/uploads/${att.filename}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs">
                                      {att.originalname}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                {attachments[ticketId] && attachments[ticketId].length > 0 && (
                  <div className="mb-4">
                    <div className="font-medium mb-1">Attachments:</div>
                    <ul className="list-disc pl-5">
                      {attachments[ticketId].map(att => (
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
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handleAddComment(ticketId);
                  }}
                  className="flex flex-col gap-2 mt-2"
                >
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 border rounded px-2 py-1 text-sm"
                  placeholder="Add a comment..."
                      value={commentInputs[ticketId] || ''}
                      onChange={e => setCommentInputs(prev => ({ ...prev, [ticketId]: e.target.value }))}
                      disabled={addingComment[ticketId]}
                  required
                />
                    <Button type="submit" size="sm" disabled={addingComment[ticketId] || !(commentInputs[ticketId] || '').trim()}>
                      {addingComment[ticketId] ? 'Adding...' : 'Add'}
                </Button>
                  </div>
                  <input
                    type="file"
                    className="text-xs"
                    onChange={e => setCommentFiles(prev => ({ ...prev, [ticketId]: e.target.files?.[0] || null }))}
                    accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
                    disabled={addingComment[ticketId]}
                  />
              </form>
              <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
                Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
  }

  // If only customerId is present, show ticket history
  if (customerId) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-2xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ticket History</CardTitle>
                <CardDescription>All tickets for this customer</CardDescription>
              </CardHeader>
              <CardContent>
                {tickets.length === 0 ? (
                  <div>No tickets found for this customer.</div>
                ) : (
                  <div className="space-y-4">
                    {tickets.map(ticket => (
                      <div key={ticket.id} className="border rounded p-3 bg-white">
                        <div className="font-semibold">{ticket.title}</div>
                        <div className="text-sm text-muted-foreground">Status: {ticket.status}</div>
                        <div className="text-xs text-gray-500">Created: {new Date(ticket.created_at).toLocaleString()}</div>
                        <div className="text-sm mt-2">{ticket.description}</div>
                        {attachments[ticket.id] && attachments[ticket.id].length > 0 && (
                          <div className="mb-2">
                            <div className="font-medium text-xs">Attachments:</div>
                            <ul className="list-disc pl-5">
                              {attachments[ticket.id].map(att => (
                                <li key={att.id}>
                                  <a href={`/uploads/${att.filename}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs">
                                    {att.originalname}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => handleExpand(ticket.id)}
                        >
                          {expandedTicketId === ticket.id ? 'Hide Comments' : 'View Comments'}
                        </Button>
                        {expandedTicketId === ticket.id && (
                          <div className="mt-3 border-t pt-3">
                            {loadingComments[ticket.id] ? (
                              <div>Loading comments...</div>
                            ) : (
                              <>
                                <div className="mb-2 font-medium">Comments</div>
                                {ticketComments[ticket.id]?.length === 0 ? (
                                  <div className="text-sm text-muted-foreground mb-2">No comments on this ticket.</div>
                                ) : (
                                  <div className="space-y-2 mb-2">
                                    {ticketComments[ticket.id]?.map(comment => {
                                      useEffect(() => {
                                        if (!commentAttachments[comment.id]) {
                                          fetchCommentAttachments(comment.id);
                                        }
                                        // eslint-disable-next-line
                                      }, []);
                                      return (
                                        <div key={comment.id} className="p-2 border rounded mb-2">
                                          <span className="font-medium">{comment.author || comment.full_name}:</span> {comment.content}
                                          {commentAttachments[comment.id] && commentAttachments[comment.id].length > 0 && (
                                            <div className="mt-1">
                                              <div className="text-xs font-medium">Attachments:</div>
                                              <ul className="list-disc pl-5">
                                                {commentAttachments[comment.id].map(att => (
                                                  <li key={att.id}>
                                                    <a href={`/uploads/${att.filename}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs">
                                                      {att.originalname}
                                                    </a>
                                                  </li>
                                                ))}
                                              </ul>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                                <form
                                  onSubmit={e => {
                                    e.preventDefault();
                                    handleAddComment(ticket.id);
                                  }}
                                  className="flex flex-col gap-2 mt-2"
                                >
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      className="flex-1 border rounded px-2 py-1 text-sm"
                                      placeholder="Add a comment..."
                                      value={commentInputs[ticket.id] || ''}
                                      onChange={e => setCommentInputs(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                                      disabled={addingComment[ticket.id]}
                                      required
                                    />
                                    <Button type="submit" size="sm" disabled={addingComment[ticket.id] || !(commentInputs[ticket.id] || '').trim()}>
                                      {addingComment[ticket.id] ? 'Adding...' : 'Add'}
                                    </Button>
                                  </div>
                                  <input
                                    type="file"
                                    className="text-xs"
                                    onChange={e => setCommentFiles(prev => ({ ...prev, [ticket.id]: e.target.files?.[0] || null }))}
                                    accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
                                    disabled={addingComment[ticket.id]}
                                  />
                                </form>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
                  Back
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return null;
} 