import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { debounce } from "@/lib/debounce";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  timeSpent: number;
  estimatedTime: number;
  isRunning: boolean;
  startTime?: Date;
  dueDate: Date;
  category: string;
}

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (task: Partial<Task>) => void;
  task?: Task;
  isEdit?: boolean;
}

export const TaskDialog = React.memo(
  ({ open, onOpenChange, onSubmit, task, isEdit = false }: TaskDialogProps) => {
    const [formData, setFormData] = useState({
      title: "",
      description: "",
      priority: "medium" as "low" | "medium" | "high",
      estimatedTime: 60,
      category: "Development",
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3)
        .toISOString()
        .split("T")[0],
    });

    // Debounced form data setter to prevent rapid updates
    const debouncedSetFormData = useCallback(
      debounce(
        (newData: any) => setFormData((prev) => ({ ...prev, ...newData })),
        100,
      ),
      [],
    );

    // Initialize form data when dialog opens
    useEffect(() => {
      if (open) {
        if (isEdit && task) {
          setFormData({
            title: task.title,
            description: task.description,
            priority: task.priority,
            estimatedTime: task.estimatedTime,
            category: task.category,
            dueDate: task.dueDate.toISOString().split("T")[0],
          });
        } else {
          setFormData({
            title: "",
            description: "",
            priority: "medium",
            estimatedTime: 60,
            category: "Development",
            dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3)
              .toISOString()
              .split("T")[0],
          });
        }
      }
    }, [open, isEdit, task]);

    const handleSubmit = useCallback(() => {
      if (!formData.title.trim()) return;

      onSubmit({
        ...formData,
        dueDate: new Date(formData.dueDate),
        ...(isEdit && task ? { id: task.id } : {}),
      });

      onOpenChange(false);
    }, [formData, onSubmit, onOpenChange, isEdit, task]);

    const handleTitleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, title: e.target.value }));
      },
      [],
    );

    const handleDescriptionChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFormData((prev) => ({ ...prev, description: e.target.value }));
      },
      [],
    );

    const handlePriorityChange = useCallback(
      (value: "low" | "medium" | "high") => {
        setFormData((prev) => ({ ...prev, priority: value }));
      },
      [],
    );

    const handleEstimatedTimeChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
          ...prev,
          estimatedTime: parseInt(e.target.value) || 60,
        }));
      },
      [],
    );

    const handleCategoryChange = useCallback((value: string) => {
      setFormData((prev) => ({ ...prev, category: value }));
    }, []);

    const handleDueDateChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, dueDate: e.target.value }));
      },
      [],
    );

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Edit Task" : "Create New Task"}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update your task details."
                : "Add a new task to your project. Set priority and estimated time."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Task title"
                value={formData.title}
                onChange={handleTitleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Task description"
                value={formData.description}
                onChange={handleDescriptionChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={handlePriorityChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedTime">Estimated Time (minutes)</Label>
                <Input
                  id="estimatedTime"
                  placeholder="60"
                  type="number"
                  value={formData.estimatedTime}
                  onChange={handleEstimatedTimeChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Development">Development</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Documentation">Documentation</SelectItem>
                    <SelectItem value="Review">Review</SelectItem>
                    <SelectItem value="Testing">Testing</SelectItem>
                    <SelectItem value="Research">Research</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleDueDateChange}
                />
              </div>
            </div>

            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={!formData.title.trim()}
            >
              {isEdit ? "Update Task" : "Create Task"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  },
);

TaskDialog.displayName = "TaskDialog";
