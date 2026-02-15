'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Plus, Type, Hash, Mail, Calendar, ListChecks, CheckSquare, AlignLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField as FormFieldType } from '@/lib/stores/app-store';
import { cn } from '@/lib/utils';

const fieldTypes = [
  { value: 'text', label: 'Text', icon: Type },
  { value: 'number', label: 'Number', icon: Hash },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'date', label: 'Date', icon: Calendar },
  { value: 'select', label: 'Select', icon: ListChecks },
  { value: 'checkbox', label: 'Checkbox', icon: CheckSquare },
  { value: 'textarea', label: 'Text Area', icon: AlignLeft },
] as const;

interface SortableFieldProps {
  field: FormFieldType;
  onUpdate: (id: string, updates: Partial<FormFieldType>) => void;
  onDelete: (id: string) => void;
}

function SortableField({ field, onUpdate, onDelete }: SortableFieldProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-card border rounded-lg p-4 space-y-3',
        isDragging && 'shadow-lg z-50 opacity-90'
      )}
    >
      <div className="flex items-center gap-2">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab hover:bg-muted p-1 rounded"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>

        <Select
          value={field.type}
          onValueChange={(value) => onUpdate(field.id, { type: value as FormFieldType['type'] })}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fieldTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                <div className="flex items-center gap-2">
                  <type.icon className="h-4 w-4" />
                  {type.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Field label"
          value={field.label}
          onChange={(e) => onUpdate(field.id, { label: e.target.value })}
          className="flex-1"
        />

        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Required</Label>
          <Switch
            checked={field.required}
            onCheckedChange={(checked) => onUpdate(field.id, { required: checked })}
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(field.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Placeholder</Label>
          <Input
            placeholder="Enter placeholder..."
            value={field.placeholder || ''}
            onChange={(e) => onUpdate(field.id, { placeholder: e.target.value })}
          />
        </div>

        {field.type === 'select' && (
          <div className="space-y-1">
            <Label className="text-xs">Options (comma separated)</Label>
            <Input
              placeholder="Option 1, Option 2, Option 3"
              value={field.options?.join(', ') || ''}
              onChange={(e) =>
                onUpdate(field.id, {
                  options: e.target.value.split(',').map((o) => o.trim()).filter(Boolean),
                })
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}

interface FormBuilderProps {
  fields: FormFieldType[];
  onChange: (fields: FormFieldType[]) => void;
}

export function FormBuilder({ fields, onChange }: FormBuilderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === String(active.id));
      const newIndex = fields.findIndex((f) => f.id === String(over.id));
      onChange(arrayMove(fields, oldIndex, newIndex));
    }
  };

  const addField = () => {
    const newField: FormFieldType = {
      id: `field-${Date.now()}`,
      name: `field_${fields.length + 1}`,
      label: `Field ${fields.length + 1}`,
      type: 'text',
      required: false,
    };
    onChange([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<FormFieldType>) => {
    onChange(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const deleteField = (id: string) => {
    onChange(fields.filter((f) => f.id !== id));
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Form Fields</CardTitle>
          <Button size="sm" onClick={addField}>
            <Plus className="h-4 w-4 mr-1" />
            Add Field
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {fields.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No fields yet. Click &quot;Add Field&quot; to start building your form.</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={fields.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              {fields.map((field) => (
                <SortableField
                  key={field.id}
                  field={field}
                  onUpdate={updateField}
                  onDelete={deleteField}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </CardContent>
    </Card>
  );
}
