import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageSquare, Phone, Search, User } from 'lucide-react';
import { toast } from 'sonner';
import { hotelApi } from '../../api';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useAuth } from '../../components/AuthContext';
import type { FeedbackMessage, FeedbackStatus } from '../../types';

const statusStyles: Record<FeedbackStatus, string> = {
  new: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  read: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  resolved: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
};

export function AdminFeedback() {
  const { isAdmin } = useAuth();
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | FeedbackStatus>('all');

  const loadMessages = () => {
    hotelApi.getFeedbackMessages()
      .then((data) => setMessages(data.messages))
      .catch(() => setMessages([]));
  };

  useEffect(() => {
    if (isAdmin) {
      loadMessages();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl mb-3">Admin access required</h2>
          <Link to="/login">Sign in with the admin account</Link>
        </div>
      </div>
    );
  }

  const filteredMessages = messages.filter((message) => {
    const text = `${message.name} ${message.email} ${message.phone} ${message.subject} ${message.message}`.toLowerCase();
    const matchesSearch = text.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || message.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = async (id: string, status: FeedbackStatus) => {
    try {
      await hotelApi.updateFeedbackStatus(id, status);
      toast.success('Feedback status updated');
      loadMessages();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update feedback');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="px-4 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl mb-2">Feedback</h1>
          <p className="text-lg text-muted-foreground">Review inquiries submitted from the contact page</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="flex flex-col md:flex-row gap-4 mb-8"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search feedback..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {(['all', 'new', 'read', 'resolved'] as const).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {status === 'all' ? 'All' : status[0].toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </motion.div>

        <div className="space-y-4">
          {filteredMessages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.6 }}
              className="rounded-3xl border border-slate-100 bg-white p-6 md:p-8 shadow-sm"
            >
              <div className="flex flex-col lg:flex-row gap-8 justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusStyles[message.status]}`}>
                      {message.status}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
                      {message.subject}
                    </span>
                  </div>
                  <p className="text-2xl font-light text-slate-950 mb-5">{message.message}</p>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Guest</p>
                        <p className="font-medium">{message.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Email</p>
                        <p className="font-medium truncate max-w-[180px]">{message.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Phone</p>
                        <p className="font-medium">{message.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Submitted</p>
                        <p className="font-medium">{new Date(message.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-slate-50/60 p-5 lg:w-56">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
                    Manage
                  </p>
                  {message.status !== 'read' ? (
                    <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(message.id, 'read')}>
                      Mark Read
                    </Button>
                  ) : null}
                  {message.status !== 'resolved' ? (
                    <Button variant="outline" size="sm" className="text-emerald-600 border-emerald-100 bg-white hover:bg-emerald-50" onClick={() => handleStatusUpdate(message.id, 'resolved')}>
                      Resolve
                    </Button>
                  ) : null}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredMessages.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">No feedback found</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
