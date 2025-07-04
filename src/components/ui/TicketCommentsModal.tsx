import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './dialog';
import { Button } from './button';
import { Card } from './card';
import { Input } from './input';
import { Textarea } from './textarea';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/api/tickets';

export function TicketCommentsModal({ ticketId, open, onClose, isAssignee = false }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (open) {
      setLoading(true);
      apiRequest(`/tickets/${ticketId}/comments`).then(setComments).finally(() => setLoading(false));
    }
  }, [open, ticketId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      await apiRequest(`/tickets/${ticketId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: newComment }),
      });
      setNewComment('');
      // Refresh comments
      const updated = await apiRequest(`/tickets/${ticketId}/comments`);
      setComments(updated);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {loading ? (
            <div className="text-center text-muted-foreground">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="text-center text-muted-foreground">No comments yet.</div>
          ) : (
            comments.map((c) => (
              <Card key={c.id} className="p-3 mb-2">
                <div className="text-sm mb-1">
                  <span className="font-semibold">{c.author}</span>
                  <span className="ml-2 text-xs text-muted-foreground">({c.authorType})</span>
                  <span className="ml-2 text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</span>
                </div>
                <div className="text-gray-800 dark:text-gray-100 text-sm">{c.content}</div>
              </Card>
            ))
          )}
        </div>
        {user && (
          <form onSubmit={handleAddComment} className="mt-4 space-y-2">
            <Textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              rows={3}
              disabled={submitting}
            />
            <DialogFooter>
              <Button type="submit" disabled={submitting || !newComment.trim()}>
                {submitting ? 'Adding...' : 'Add Comment'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
} 