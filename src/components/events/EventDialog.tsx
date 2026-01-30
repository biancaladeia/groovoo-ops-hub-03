import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn, calculatePayoutDate, formatDate, formatCurrency } from '@/lib/utils';
import { Event, Gateway, EventStatus } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const GATEWAYS: Gateway[] = [
  'Groovoo Square',
  'Groovoo Stripe',
  'Split Stripe',
  'Organizer Square',
  'Organizer Stripe',
];

const STATUSES: EventStatus[] = ['Available', 'Expired', 'Unavailable', 'Finished'];

const eventFormSchema = z.object({
  event_name: z.string().min(1, 'Event name is required').max(200, 'Event name too long'),
  gateway: z.enum(['Groovoo Square', 'Groovoo Stripe', 'Split Stripe', 'Organizer Square', 'Organizer Stripe']),
  event_date: z.date({ required_error: 'Event date is required' }),
  status: z.enum(['Available', 'Expired', 'Unavailable', 'Finished']),
  gross_sale: z.coerce.number().min(0, 'Must be positive'),
  service_fee: z.coerce.number().min(0, 'Must be positive'),
  gateway_fee: z.coerce.number().min(0, 'Must be positive'),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

export type EventDialogMode = 'create' | 'edit' | 'view';

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: EventDialogMode;
  event?: Event | null;
  onSuccess: () => void;
}

export const EventDialog = ({
  open,
  onOpenChange,
  mode,
  event,
  onSuccess,
}: EventDialogProps) => {
  const { isAdmin, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isViewOnly = mode === 'view' || !isAdmin;

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      event_name: '',
      gateway: 'Groovoo Square',
      event_date: new Date(),
      status: 'Available',
      gross_sale: 0,
      service_fee: 0,
      gateway_fee: 0,
    },
  });

  // Watch values for real-time calculations
  const watchedValues = form.watch(['gross_sale', 'service_fee', 'gateway_fee', 'event_date']);
  const grossSale = Number(watchedValues[0]) || 0;
  const serviceFee = Number(watchedValues[1]) || 0;
  const gatewayFee = Number(watchedValues[2]) || 0;
  const eventDate = watchedValues[3];

  // Calculated fields
  const netSale = useMemo(() => grossSale - serviceFee - gatewayFee, [grossSale, serviceFee, gatewayFee]);
  const totalPayout = useMemo(() => netSale, [netSale]);
  const payoutDate = useMemo(() => eventDate ? calculatePayoutDate(eventDate) : null, [eventDate]);

  // Reset form when event changes or dialog opens
  useEffect(() => {
    if (open) {
      if (event && (mode === 'edit' || mode === 'view')) {
        form.reset({
          event_name: event.event_name,
          gateway: event.gateway,
          event_date: new Date(event.event_date),
          status: event.status,
          gross_sale: Number(event.gross_sale),
          service_fee: Number(event.service_fee),
          gateway_fee: Number(event.gateway_fee),
        });
      } else {
        form.reset({
          event_name: '',
          gateway: 'Groovoo Square',
          event_date: new Date(),
          status: 'Available',
          gross_sale: 0,
          service_fee: 0,
          gateway_fee: 0,
        });
      }
    }
  }, [open, event, mode, form]);

  const onSubmit = async (values: EventFormValues) => {
    if (isViewOnly) return;
    setIsSubmitting(true);

    try {
      const eventData = {
        event_name: values.event_name.trim(),
        gateway: values.gateway,
        event_date: format(values.event_date, 'yyyy-MM-dd'),
        payout_date: format(payoutDate!, 'yyyy-MM-dd'),
        status: values.status,
        gross_sale: values.gross_sale,
        service_fee: values.service_fee,
        gateway_fee: values.gateway_fee,
        net_sale: netSale,
        total_payout: totalPayout,
      };

      if (mode === 'edit' && event) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', event.id);

        if (error) throw error;
        toast.success('Event updated successfully');
      } else {
        const { error } = await supabase
          .from('events')
          .insert({
            ...eventData,
            created_by: user?.id,
          });

        if (error) throw error;
        toast.success('Event created successfully');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const dialogTitle = mode === 'create' ? 'Add Event' : mode === 'edit' ? 'Edit Event' : 'View Event';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {mode === 'create' && 'Fill in the details to create a new event.'}
            {mode === 'edit' && 'Update the event information below.'}
            {mode === 'view' && 'View event details.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Event Name */}
            <FormField
              control={form.control}
              name="event_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Name *</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isViewOnly} placeholder="Enter event name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Gateway */}
              <FormField
                control={form.control}
                name="gateway"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gateway *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isViewOnly}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gateway" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {GATEWAYS.map((gateway) => (
                          <SelectItem key={gateway} value={gateway}>
                            {gateway}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isViewOnly}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
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
              {/* Event Date */}
              <FormField
                control={form.control}
                name="event_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Event Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            disabled={isViewOnly}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className={cn('p-3 pointer-events-auto')}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Payout Date (Auto-calculated) */}
              <FormItem className="flex flex-col">
                <FormLabel>Payout Date (Auto)</FormLabel>
                <Input
                  value={payoutDate ? formatDate(payoutDate) : '—'}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">3 business days after event</p>
              </FormItem>
            </div>

            {/* Financial Fields */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="gross_sale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gross Sale</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        disabled={isViewOnly}
                        placeholder="0.00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="service_fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Fee</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        disabled={isViewOnly}
                        placeholder="0.00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gateway_fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gateway Fee</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        disabled={isViewOnly}
                        placeholder="0.00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Net Sale (Calculated) */}
              <FormItem>
                <FormLabel>Net Sale</FormLabel>
                <Input value={formatCurrency(netSale)} disabled className="bg-muted font-medium" />
              </FormItem>
            </div>

            {/* Total Payout */}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Total Payout</span>
                <span className="text-xl font-bold text-primary">{formatCurrency(totalPayout)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Gross Sale - Service Fee - Gateway Fee
              </p>
            </div>

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
                  {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update Event' : 'Create Event'}
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

export default EventDialog;
