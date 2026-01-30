import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, X, FileIcon } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Ticket, TicketType, TicketPriority, Platform, B2C_CATEGORIES, B2B_CATEGORIES } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { generateTicketId } from '@/lib/utils';

const PLATFORMS: Platform[] = ['iOS', 'Android', 'Web'];
const PRIORITIES: TicketPriority[] = ['High', 'Medium', 'Low'];

const ticketFormSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject too long'),
  ticket_type: z.enum(['B2C', 'B2B']),
  category: z.string().min(1, 'Category is required'),
  priority: z.enum(['High', 'Medium', 'Low']),
  platform: z.enum(['iOS', 'Android', 'Web']).nullable().optional(),
  description: z.string().max(2000, 'Description too long').optional(),
});

type TicketFormValues = z.infer<typeof ticketFormSchema>;

export type TicketDialogMode = 'create' | 'edit' | 'view';

interface TicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: TicketDialogMode;
  ticket?: Ticket | null;
  onSuccess: () => void;
}

export const TicketDialog = ({
  open,
  onOpenChange,
  mode,
  ticket,
  onSuccess,
}: TicketDialogProps) => {
  const { isAdmin, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const isViewOnly = mode === 'view' || !isAdmin;

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      subject: '',
      ticket_type: 'B2C',
      category: '',
      priority: 'Medium',
      platform: null,
      description: '',
    },
  });

  const watchedType = form.watch('ticket_type');
  const categories = watchedType === 'B2C' ? B2C_CATEGORIES : B2B_CATEGORIES;

  // Reset category when type changes
  useEffect(() => {
    if (mode === 'create') {
      form.setValue('category', '');
    }
  }, [watchedType, mode, form]);

  // Reset form when ticket changes or dialog opens
  useEffect(() => {
    if (open) {
      if (ticket && (mode === 'edit' || mode === 'view')) {
        form.reset({
          subject: ticket.subject,
          ticket_type: ticket.ticket_type,
          category: ticket.category,
          priority: ticket.priority,
          platform: ticket.platform,
          description: ticket.description || '',
        });
      } else {
        form.reset({
          subject: '',
          ticket_type: 'B2C',
          category: '',
          priority: 'Medium',
          platform: null,
          description: '',
        });
        setAttachedFiles([]);
      }
    }
  }, [open, ticket, mode, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isValid = file.size <= 10 * 1024 * 1024; // 10MB limit
      if (!isValid) {
        toast.error(`File ${file.name} exceeds 10MB limit`);
      }
      return isValid;
    });
    setAttachedFiles(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: TicketFormValues) => {
    if (isViewOnly) return;
    setIsSubmitting(true);

    try {
      const ticketData = {
        subject: values.subject.trim(),
        ticket_type: values.ticket_type,
        category: values.category,
        priority: values.priority,
        platform: values.platform || null,
        description: values.description?.trim() || null,
      };

      if (mode === 'edit' && ticket) {
        const { error } = await supabase
          .from('tickets')
          .update(ticketData)
          .eq('id', ticket.id);

        if (error) throw error;
        toast.success('Ticket updated successfully');
      } else {
        const ticketNumber = generateTicketId();
        const { error } = await supabase
          .from('tickets')
          .insert({
            ...ticketData,
            ticket_number: ticketNumber,
            created_by: user?.id,
            status: 'Open',
          });

        if (error) throw error;
        toast.success(`Ticket ${ticketNumber} created successfully`);
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving ticket:', error);
      toast.error('Failed to save ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const dialogTitle = mode === 'create' ? 'New Ticket' : mode === 'edit' ? 'Edit Ticket' : 'View Ticket';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {mode === 'create' && 'Create a new support ticket.'}
            {mode === 'edit' && 'Update the ticket information.'}
            {mode === 'view' && `Ticket: ${ticket?.ticket_number || ''}`}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Subject */}
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject *</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isViewOnly} placeholder="Brief description of the issue" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Type */}
              <FormField
                control={form.control}
                name="ticket_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isViewOnly}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="B2C">User (B2C)</SelectItem>
                        <SelectItem value="B2B">Organizer (B2B)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category - Dynamic based on Type */}
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
                        {categories.map((category) => (
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Priority */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isViewOnly}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PRIORITIES.map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {priority}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Platform */}
              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ''}
                      disabled={isViewOnly}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {PLATFORMS.map((platform) => (
                          <SelectItem key={platform} value={platform}>
                            {platform}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      disabled={isViewOnly}
                      placeholder="Provide detailed information about the issue..."
                      rows={4}
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File Attachments - Only in create mode */}
            {mode === 'create' && (
              <div className="space-y-2">
                <FormLabel>Attachments</FormLabel>
                <div className="border-2 border-dashed border-border rounded-lg p-4">
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*,.pdf,.doc,.docx,.txt"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Upload className="w-8 h-8 mb-2" />
                    <span className="text-sm">Click to upload files</span>
                    <span className="text-xs">Max 5 files, 10MB each</span>
                  </label>
                </div>

                {attachedFiles.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {attachedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-muted rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <FileIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeFile(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

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
                  {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update Ticket' : 'Create Ticket'}
                </Button>
              </DialogFooter>
            )}

            {isViewOnly && (
              <DialogFooter>
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

export default TicketDialog;
