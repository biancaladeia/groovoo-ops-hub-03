import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  GitBranch,
  Copy,
  Check,
  Search,
  Upload,
  FileText,
  Image as ImageIcon,
  Video,
  X,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { generateBacklogMarkdown } from '@/lib/utils';
import { Ticket, Platform, TicketCategory } from '@/types';
import { toast } from 'sonner';

// Mock tickets for backlog
const mockBacklogTickets: Ticket[] = [
  {
    id: '1',
    ticketId: 'TKT-M7X2Y-A1B2',
    subject: 'Login fails after password reset on iOS',
    description: 'User reports they cannot access their account after resetting password. Error message shows "Invalid credentials". This happens consistently on iOS 17.2.',
    type: 'User',
    category: 'Login/App access',
    priority: 'High',
    status: 'Open',
    platform: 'iOS',
    createdAt: new Date(),
    updatedAt: new Date(),
    moveToBacklog: true,
    attachments: [],
  },
  {
    id: '2',
    ticketId: 'TKT-N8Y3Z-B2C3',
    subject: 'QR code scanner not working on Android',
    description: 'Check-in app QR scanner fails to recognize valid tickets. Camera permission is granted. Affects Android 13+ devices.',
    type: 'Organizer',
    category: 'Check-in/Organizer App issues',
    priority: 'High',
    status: 'In Progress',
    platform: 'Android',
    createdAt: new Date(),
    updatedAt: new Date(),
    moveToBacklog: true,
    attachments: [],
  },
];

const GitHubQA = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [moveToBacklog, setMoveToBacklog] = useState(false);
  const [platform, setPlatform] = useState<Platform>('Web');
  const [acceptanceCriteria, setAcceptanceCriteria] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [copied, setCopied] = useState(false);
  const [expandedTickets, setExpandedTickets] = useState<string[]>([]);

  const toggleTicketExpand = (ticketId: string) => {
    setExpandedTickets((prev) =>
      prev.includes(ticketId)
        ? prev.filter((id) => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  const generatedMarkdown = selectedTicket
    ? generateBacklogMarkdown({
        ticketId: selectedTicket.ticketId,
        category: selectedTicket.category,
        platform: platform,
        description: selectedTicket.description + (acceptanceCriteria ? `\n\n${acceptanceCriteria}` : ''),
      })
    : '';

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generatedMarkdown);
    setCopied(true);
    toast.success('Markdown copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setAttachments((prev) => [...prev, ...files]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
    if (type.startsWith('video/')) return <Video className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <GitBranch className="w-6 h-6 text-primary" />
          GitHub & QA Integration
        </h2>
        <p className="text-muted-foreground">Generate backlog items and manage bug reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets List */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Backlog Candidates</CardTitle>
            <CardDescription>Tickets marked for development backlog</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-muted/50"
              />
            </div>

            <div className="space-y-3">
              {mockBacklogTickets
                .filter(
                  (t) =>
                    t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    t.ticketId.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((ticket) => (
                  <Collapsible
                    key={ticket.id}
                    open={expandedTickets.includes(ticket.id)}
                    onOpenChange={() => toggleTicketExpand(ticket.id)}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                        selectedTicket?.id === ticket.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-muted/30 hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <code className="text-xs bg-background px-1.5 py-0.5 rounded">
                              {ticket.ticketId}
                            </code>
                            <Badge
                              variant="outline"
                              className={
                                ticket.priority === 'High'
                                  ? 'priority-high'
                                  : ticket.priority === 'Medium'
                                  ? 'priority-medium'
                                  : 'priority-low'
                              }
                            >
                              {ticket.priority}
                            </Badge>
                          </div>
                          <p className="font-medium text-sm">{ticket.subject}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {ticket.category}
                            </Badge>
                            {ticket.platform && (
                              <Badge variant="outline" className="text-xs">
                                {ticket.platform}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {expandedTickets.includes(ticket.id) ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </div>

                      <CollapsibleContent>
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-sm text-muted-foreground">
                            {ticket.description}
                          </p>
                        </div>
                      </CollapsibleContent>
                    </motion.div>
                  </Collapsible>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Markdown Generator */}
        <div className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Backlog Generator</CardTitle>
              <CardDescription>Generate formatted markdown for GitHub issues</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Move to Backlog Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <GitBranch className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">Move to Backlog</p>
                    <p className="text-xs text-muted-foreground">
                      Enable to generate markdown
                    </p>
                  </div>
                </div>
                <Switch checked={moveToBacklog} onCheckedChange={setMoveToBacklog} />
              </div>

              {moveToBacklog && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  {/* Platform Selection */}
                  <div className="space-y-2">
                    <Label>Platform</Label>
                    <Select value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
                      <SelectTrigger className="bg-muted/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="iOS">iOS</SelectItem>
                        <SelectItem value="Android">Android</SelectItem>
                        <SelectItem value="Web">Web</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Additional Acceptance Criteria */}
                  <div className="space-y-2">
                    <Label>Additional Notes</Label>
                    <Textarea
                      placeholder="Add extra context or acceptance criteria..."
                      value={acceptanceCriteria}
                      onChange={(e) => setAcceptanceCriteria(e.target.value)}
                      className="bg-muted/50 min-h-[80px]"
                    />
                  </div>

                  {/* Generated Markdown Preview */}
                  {selectedTicket && (
                    <div className="space-y-2">
                      <Label>Generated Markdown</Label>
                      <div className="relative">
                        <pre className="p-4 rounded-lg bg-background/50 border border-border text-sm overflow-x-auto max-h-[300px] overflow-y-auto">
                          <code>{generatedMarkdown}</code>
                        </pre>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={handleCopyMarkdown}
                        >
                          {copied ? (
                            <Check className="w-4 h-4 mr-1" />
                          ) : (
                            <Copy className="w-4 h-4 mr-1" />
                          )}
                          {copied ? 'Copied!' : 'Copy'}
                        </Button>
                      </div>
                    </div>
                  )}

                  {!selectedTicket && (
                    <div className="text-center py-8 text-muted-foreground">
                      Select a ticket to generate markdown
                    </div>
                  )}
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Bug Report Attachments</CardTitle>
              <CardDescription>Upload images or videos for bug reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload Area */}
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/30 transition-colors">
                <div className="flex flex-col items-center">
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Images, videos (max 10MB)
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                />
              </label>

              {/* Attachments List */}
              {attachments.length > 0 && (
                <div className="space-y-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        {getFileIcon(file.type)}
                        <div>
                          <p className="text-sm font-medium truncate max-w-[200px]">
                            {file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GitHubQA;
