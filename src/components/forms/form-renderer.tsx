'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormField as FormFieldType } from '@/lib/stores/app-store';
import { toast } from 'sonner';

interface FormRendererProps {
  form: Form;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
}

export function FormRenderer({ form, onSubmit }: FormRendererProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate Zod schema from form fields
  const schema = z.object(
    Object.fromEntries(
      form.fields.map((field) => {
        let validator: z.ZodType = z.string();
        
        switch (field.type) {
          case 'email':
            validator = z.string().email('Invalid email address');
            break;
          case 'number':
            validator = z.coerce.number();
            break;
          case 'date':
            validator = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date');
            break;
          case 'checkbox':
            validator = z.boolean();
            break;
          default:
            validator = z.string();
        }
        
        return [field.name, field.required ? validator : validator.optional()];
      })
    )
  );

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const handleFormSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      toast.success(form.successMsg || 'Form submitted successfully!');
      reset();
    } catch (error) {
      toast.error('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {form.fields.map((field) => (
        <div key={field.id} className="space-y-2">
          <Label htmlFor={field.id} className="text-base">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>

          {field.type === 'text' && (
            <Input
              id={field.id}
              placeholder={field.placeholder}
              {...register(field.name)}
              className={errors[field.name] ? 'border-red-500' : ''}
            />
          )}

          {field.type === 'email' && (
            <Input
              id={field.id}
              type="email"
              placeholder={field.placeholder}
              {...register(field.name)}
              className={errors[field.name] ? 'border-red-500' : ''}
            />
          )}

          {field.type === 'number' && (
            <Input
              id={field.id}
              type="number"
              placeholder={field.placeholder}
              {...register(field.name)}
              className={errors[field.name] ? 'border-red-500' : ''}
            />
          )}

          {field.type === 'date' && (
            <Input
              id={field.id}
              type="date"
              {...register(field.name)}
              className={errors[field.name] ? 'border-red-500' : ''}
            />
          )}

          {field.type === 'textarea' && (
            <Textarea
              id={field.id}
              placeholder={field.placeholder}
              {...register(field.name)}
              className={errors[field.name] ? 'border-red-500' : ''}
              rows={4}
            />
          )}

          {field.type === 'select' && field.options && (
            <Select
              onValueChange={(value) => setValue(field.name, value)}
              value={watch(field.name) as string}
            >
              <SelectTrigger className={errors[field.name] ? 'border-red-500' : ''}>
                <SelectValue placeholder={field.placeholder || 'Select an option'} />
              </SelectTrigger>
              <SelectContent>
                {field.options.map((option, index) => (
                  <SelectItem key={index} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {field.type === 'checkbox' && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id={field.id}
                onCheckedChange={(checked) => setValue(field.name, checked === true)}
              />
              <label
                htmlFor={field.id}
                className="text-sm text-muted-foreground cursor-pointer"
              >
                {field.placeholder || 'Check this box'}
              </label>
            </div>
          )}

          {errors[field.name] && (
            <p className="text-sm text-red-500">
              {errors[field.name]?.message as string}
            </p>
          )}
        </div>
      ))}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Send className="h-4 w-4 mr-2" />
        )}
        {form.submitText || 'Submit'}
      </Button>
    </form>
  );
}

// Need to import useState
import { useState } from 'react';
