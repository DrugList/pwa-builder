'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IconSelector } from './icon-selector';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name is too long'),
  description: z.string().max(200, 'Description is too long').optional(),
  appType: z.enum(['data', 'form', 'website', 'embed']),
  icon: z.string(),
  iconType: z.enum(['default', 'uploaded', 'emoji']),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateAppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormValues) => Promise<void>;
  editData?: FormValues | null;
}

export function CreateAppDialog({ open, onOpenChange, onSubmit, editData }: CreateAppDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: editData || {
      name: '',
      description: '',
      appType: 'data',
      icon: '/icons/default-app.svg',
      iconType: 'default',
    },
  });

  const handleSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      form.reset();
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editData ? 'Edit App' : 'Create New App'}</DialogTitle>
          <DialogDescription>
            {editData
              ? 'Update your app settings and configuration.'
              : 'Choose a name, type, and icon for your new app.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>App Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Awesome App" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what your app does..."
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="appType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>App Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select app type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="data">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Data App</span>
                          <span className="text-xs text-muted-foreground">- Display data from spreadsheets</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="form">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Form</span>
                          <span className="text-xs text-muted-foreground">- Collect responses to database</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="website">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Website</span>
                          <span className="text-xs text-muted-foreground">- Information display pages</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="embed">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Embed</span>
                          <span className="text-xs text-muted-foreground">- Embed external links</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the type that best fits your use case.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>App Icon</FormLabel>
                  <FormControl>
                    <IconSelector
                      value={field.value}
                      onChange={(icon, iconType) => {
                        field.onChange(icon);
                        form.setValue('iconType', iconType);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editData ? 'Save Changes' : 'Create App'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
