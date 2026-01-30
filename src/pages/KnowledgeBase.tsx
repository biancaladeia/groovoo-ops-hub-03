import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  BookOpen,
  Copy,
  Check,
  Plus,
  Tag,
  MessageSquare,
  Folder,
  FileText,
  Loader2,
  Pencil,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { KnowledgeArticle } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ArticleDialog, ArticleDialogMode } from '@/components/knowledge-base/ArticleDialog';

const KnowledgeBase = () => {
  const { isAdmin } = useAuth();
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Articles');
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<ArticleDialogMode>('create');
  const [editingArticle, setEditingArticle] = useState<KnowledgeArticle | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast.error('Failed to load articles');
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    { name: 'All Articles', count: articles.length },
    ...Array.from(new Set(articles.map((a) => a.category))).map((cat) => ({
      name: cat,
      count: articles.filter((a) => a.category === cat).length,
    })),
  ];

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory =
      selectedCategory === 'All Articles' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCopyResponse = (article: KnowledgeArticle) => {
    navigator.clipboard.writeText(article.content);
    setCopiedId(article.id);
    toast.success('Response copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openCreateDialog = () => {
    setEditingArticle(null);
    setDialogMode('create');
    setDialogOpen(true);
  };

  const openEditDialog = (article: KnowledgeArticle) => {
    setEditingArticle(article);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const openViewDialog = (article: KnowledgeArticle) => {
    setEditingArticle(article);
    setDialogMode('view');
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            Knowledge Base
          </h2>
          <p className="text-sm text-muted-foreground">Branding voice responses and documentation</p>
        </div>
        {isAdmin && (
          <Button 
            className="bg-groovoo-gradient hover:opacity-90 glow-primary text-white"
            onClick={openCreateDialog}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Article
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Sidebar */}
        <Card className="clean-card lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Folder className="w-4 h-4" />
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="space-y-1">
              {categories.map((category) => (
                <Button
                  key={category.name}
                  variant="ghost"
                  className={`w-full justify-between h-9 text-sm ${
                    selectedCategory === category.name
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setSelectedCategory(category.name)}
                >
                  <span className="truncate">{category.name}</span>
                  <Badge variant="secondary" className="bg-muted ml-2 text-xs">
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
              className="pl-10 bg-background"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* Articles List */}
            <Card className="clean-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  Articles ({filteredArticles.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <ScrollArea className="h-[400px] md:h-[500px] pr-2">
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
            <Card className="clean-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Response Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedArticle ? (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
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
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(selectedArticle)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <Separator />
                    <ScrollArea className="h-[280px] md:h-[350px]">
                      <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans leading-relaxed">
                        {selectedArticle.content}
                      </pre>
                    </ScrollArea>
                    <Separator />
                    <Button
                      className="w-full bg-groovoo-gradient hover:opacity-90 text-white"
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
                    <p className="text-sm">Select an article to preview</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {articles.length === 0 && !isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No articles found. {isAdmin && 'Create your first article to get started.'}</p>
        </div>
      )}

      {/* Article Dialog */}
      <ArticleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        article={editingArticle}
        onSuccess={fetchArticles}
      />
    </div>
  );
};

export default KnowledgeBase;
