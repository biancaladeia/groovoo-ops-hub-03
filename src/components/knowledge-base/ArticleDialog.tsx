import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Copy, Check, Tag, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { KnowledgeArticle } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const CATEGORIES = [
  'Getting Started',
  'Account & Billing',
  'Events',
  'Tickets',
  'Refunds',
  'Technical Support',
  'Organizers',
  'Policies',
  'Other',
];

const articleFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  category: z.string().min(1, 'Category is required'),
  content: z.string().min(1, 'Content is required').max(10000, 'Content too long'),
  tags: z.array(z.string()).default([]),
});

type ArticleFormValues = z.infer<typeof articleFormSchema>;

export type ArticleDialogMode = 'create' | 'edit' | 'view';

interface ArticleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: ArticleDialogMode;
  article?: KnowledgeArticle | null;
  onSuccess: () => void;
}

export const ArticleDialog = ({
  open,
  onOpenChange,
  mode,
  article,
  onSuccess,
}: ArticleDialogProps) => {
  const { isAdmin, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newTag, setNewTag] = useState('');
  const isViewOnly = mode === 'view' || !isAdmin;

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: '',
      category: '',
      content: '',
      tags: [],
    },
  });

  const tags = form.watch('tags');

  // Reset form when article changes or dialog opens
  useEffect(() => {
    if (open) {
      if (article && (mode === 'edit' || mode === 'view')) {
        form.reset({
          title: article.title,
          category: article.category,
          content: article.content,
          tags: article.tags || [],
        });
      } else {
        form.reset({
          title: '',
          category: '',
          content: '',
          tags: [],
        });
      }
      setCopied(false);
    }
  }, [open, article, mode, form]);

  const addTag = () => {
    const trimmedTag = newTag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      form.setValue('tags', [...tags, trimmedTag]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    form.setValue('tags', tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleCopyContent = () => {
    const content = form.getValues('content');
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success('Content copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const onSubmit = async (values: ArticleFormValues) => {
    if (isViewOnly) return;
    setIsSubmitting(true);

    try {
      const articleData = {
        title: values.title.trim(),
        category: values.category,
        content: values.content.trim(),
        tags: values.tags,
      };

      if (mode === 'edit' && article) {
        const { error } = await supabase
          .from('knowledge_base')
          .update(articleData)
          .eq('id', article.id);

        if (error) throw error;
        toast.success('Article updated successfully');
      } else {
        const { error } = await supabase
          .from('knowledge_base')
          .insert({
            ...articleData,
            created_by: user?.id,
          });

        if (error) throw error;
        toast.success('Article created successfully');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving article:', error);
      toast.error('Failed to save article');
    } finally {
      setIsSubmitting(false);
    }
  };

  const dialogTitle = mode === 'create' ? 'New Article' : mode === 'edit' ? 'Edit Article' : 'View Article';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {mode === 'create' && 'Create a new knowledge base article.'}
            {mode === 'edit' && 'Update the article content.'}
            {mode === 'view' && 'View article details.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isViewOnly} placeholder="Article title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isViewOnly}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tags */}
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <div className="space-y-2">
                {!isViewOnly && (
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Add a tag..."
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" onClick={addTag}>
                      <Tag className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        {!isViewOnly && (
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </FormItem>

            {/* Content */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Response Template *</FormLabel>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyContent}
                      className="h-8"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-1 text-success" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <FormControl>
                    <Textarea
                      {...field}
                      disabled={isViewOnly}
                      placeholder="Write your response template here..."
                      rows={12}
                      className="resize-none font-mono text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isViewOnly && (
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-groovoo-gradient hover:opacity-90 text-white"
                >
                  {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update Article' : 'Create Article'}
                </Button>
              </DialogFooter>
            )}

            {isViewOnly && (
              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCopyContent}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-success" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Content
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ArticleDialog;
