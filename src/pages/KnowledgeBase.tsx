import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  BookOpen,
  Copy,
  Check,
  Plus,
  Tag,
  MessageSquare,
  ChevronRight,
  Folder,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { WikiArticle } from '@/types';
import { toast } from 'sonner';

// Mock data - Branding Voice responses
const mockArticles: WikiArticle[] = [
  {
    id: '1',
    title: 'Refund Request - Standard Response',
    category: 'Refunds',
    content: `Hello [Customer Name],

Thank you for reaching out to us regarding your refund request.

We understand that plans can change, and we're here to help! According to our refund policy, you are eligible for a full refund for event cancellations and partial refunds for other circumstances based on the timing of your request.

We have processed your refund for [Event Name] in the amount of [Amount]. Please allow 5-10 business days for the refund to appear on your original payment method.

If you have any questions or need further assistance, please don't hesitate to reach out.

Best regards,
The Groovoo Support Team`,
    tags: ['refund', 'customer-service', 'standard'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Login Issues - Password Reset',
    category: 'Technical Support',
    content: `Hi [Customer Name],

Thank you for contacting Groovoo Support!

I'm sorry to hear you're having trouble accessing your account. Let's get this sorted out for you.

I've sent a password reset link to your registered email address. Please check your inbox (and spam folder, just in case) and click the link to create a new password.

If you don't receive the email within a few minutes, please let me know and we can try alternative methods to help you regain access.

We're here to help!

Warm regards,
The Groovoo Support Team`,
    tags: ['login', 'password', 'technical'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    title: 'Duplicate Charge Investigation',
    category: 'Billing',
    content: `Hello [Customer Name],

Thank you for bringing this to our attention. I completely understand how concerning duplicate charges can be.

I've immediately escalated your case to our billing team for investigation. Here's what we're doing:

1. Reviewing your transaction history for Order #[Order Number]
2. Verifying the payment gateway records
3. Confirming the actual charges processed

We take billing accuracy very seriously. You can expect an update from us within 24-48 hours with a full resolution.

If a duplicate charge is confirmed, we will process a refund immediately and provide transaction confirmation.

Thank you for your patience and understanding.

Best regards,
The Groovoo Support Team`,
    tags: ['billing', 'duplicate', 'investigation'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    title: 'Missing Ticket - App Sync Issue',
    category: 'Technical Support',
    content: `Hi [Customer Name],

Thanks for reaching out! I'm sorry your ticket isn't showing up in the app — that's definitely frustrating.

Good news: we've confirmed your purchase is successful! Here are a few quick fixes:

1. Log out and log back into the Groovoo app
2. Pull down on the My Tickets screen to refresh
3. Make sure you're using the same email address: [Email]

If it still doesn't appear after trying these steps, please reply to this message and I'll send you a direct link to your ticket.

Your event is coming up and we want to make sure you're ready!

Cheers,
The Groovoo Support Team`,
    tags: ['tickets', 'app', 'sync'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    title: 'Payout Inquiry - Organizer',
    category: 'Organizer Support',
    content: `Hello [Organizer Name],

Thank you for reaching out about your payout for [Event Name].

I've reviewed your account and here are the details:

• Event Date: [Date]
• Payout Processing Date: [Date + 3 business days]
• Expected Payout Amount: [Amount]
• Payment Method: [Method on file]

Payouts are typically processed within 3 business days after your event concludes. If your event has passed this window and you haven't received your funds, please confirm your banking details are up to date in your organizer dashboard.

If everything looks correct and you're still waiting, let me know and I'll investigate further with our finance team.

We appreciate your partnership!

Best,
The Groovoo Support Team`,
    tags: ['organizer', 'payout', 'finance'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '6',
    title: 'Event Cancellation Notice',
    category: 'Events',
    content: `Dear [Customer Name],

We regret to inform you that [Event Name] scheduled for [Date] has been cancelled by the event organizer.

We understand this is disappointing news, and we want to make this as smooth as possible for you.

Your refund of [Amount] has been automatically initiated and will be credited to your original payment method within 5-10 business days.

No action is required on your part.

If you have any questions or would like assistance finding similar events in your area, we're here to help!

Thank you for your understanding.

Sincerely,
The Groovoo Support Team`,
    tags: ['cancellation', 'refund', 'notification'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const categories = [
  { name: 'All Articles', count: mockArticles.length },
  { name: 'Refunds', count: mockArticles.filter((a) => a.category === 'Refunds').length },
  { name: 'Technical Support', count: mockArticles.filter((a) => a.category === 'Technical Support').length },
  { name: 'Billing', count: mockArticles.filter((a) => a.category === 'Billing').length },
  { name: 'Organizer Support', count: mockArticles.filter((a) => a.category === 'Organizer Support').length },
  { name: 'Events', count: mockArticles.filter((a) => a.category === 'Events').length },
];

const KnowledgeBase = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Articles');
  const [selectedArticle, setSelectedArticle] = useState<WikiArticle | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredArticles = mockArticles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory =
      selectedCategory === 'All Articles' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCopyResponse = (article: WikiArticle) => {
    navigator.clipboard.writeText(article.content);
    setCopiedId(article.id);
    toast.success('Response copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            Knowledge Base
          </h2>
          <p className="text-muted-foreground">Branding voice responses and documentation</p>
        </div>
        <Button className="bg-groovoo-gradient hover:opacity-90 shadow-glow">
          <Plus className="w-4 h-4 mr-2" />
          New Article
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card className="glass-card lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Folder className="w-5 h-5" />
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="space-y-1">
              {categories.map((category) => (
                <Button
                  key={category.name}
                  variant="ghost"
                  className={`w-full justify-between h-10 ${
                    selectedCategory === category.name
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setSelectedCategory(category.name)}
                >
                  <span className="truncate">{category.name}</span>
                  <Badge variant="secondary" className="bg-muted ml-2">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search articles, tags, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* Articles List */}
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  Articles ({filteredArticles.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <ScrollArea className="h-[500px] pr-2">
                  <div className="space-y-2">
                    {filteredArticles.map((article, index) => (
                      <motion.div
                        key={article.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedArticle?.id === article.id
                            ? 'bg-primary/10 border border-primary/30'
                            : 'bg-muted/30 hover:bg-muted/50 border border-transparent'
                        }`}
                        onClick={() => setSelectedArticle(article)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                              <p className="font-medium text-sm truncate">
                                {article.title}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs mb-2">
                              {article.category}
                            </Badge>
                            <div className="flex flex-wrap gap-1">
                              {article.tags.slice(0, 3).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="text-xs bg-muted"
                                >
                                  <Tag className="w-2 h-2 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyResponse(article);
                            }}
                          >
                            {copiedId === article.id ? (
                              <Check className="w-4 h-4 text-success" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Article Preview */}
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Response Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedArticle ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        {selectedArticle.title}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="outline">{selectedArticle.category}</Badge>
                        {selectedArticle.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Separator />
                    <ScrollArea className="h-[350px]">
                      <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans leading-relaxed">
                        {selectedArticle.content}
                      </pre>
                    </ScrollArea>
                    <Separator />
                    <Button
                      className="w-full bg-groovoo-gradient hover:opacity-90"
                      onClick={() => handleCopyResponse(selectedArticle)}
                    >
                      {copiedId === selectedArticle.id ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Response
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-16 text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>Select an article to preview the response</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;
