import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Clock } from "lucide-react";

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
  userId: string;
  completionRemarks?: string;
}

interface CompleteTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (remarks: string) => void;
  task: Task | null;
}

export const CompleteTaskDialog = React.memo(
  ({ open, onOpenChange, onConfirm, task }: CompleteTaskDialogProps) => {
    const [remarks, setRemarks] = useState("");

    const handleConfirm = useCallback(() => {
      onConfirm(remarks);
      setRemarks("");
      onOpenChange(false);
    }, [remarks, onConfirm, onOpenChange]);

    const handleCancel = useCallback(() => {
      setRemarks("");
      onOpenChange(false);
    }, [onOpenChange]);

    const formatTime = useCallback((minutes: number) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    }, []);

    if (!task) return null;

    const isOvertime = task.timeSpent > task.estimatedTime;
    const timeDifference = Math.abs(task.timeSpent - task.estimatedTime);

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>Complete Task</span>
            </DialogTitle>
            <DialogDescription>
              Mark <strong>"{task.title}"</strong> as completed and add your
              completion remarks.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Task Summary */}
            <div className="rounded-lg border p-4 bg-muted/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Task Summary</span>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Category:</span>
                  <span className="font-medium">{task.category}</span>
                </div>
                <div className="flex justify-between">
                  <span>Priority:</span>
                  <span
                    className={`font-medium capitalize ${
                      task.priority === "high"
                        ? "text-red-600"
                        : task.priority === "medium"
                          ? "text-yellow-600"
                          : "text-green-600"
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Due Date:</span>
                  <span className="font-medium">
                    {task.dueDate.toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Time Summary */}
            <div className="rounded-lg border p-4 bg-muted/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Time Tracking</span>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Time Spent:</span>
                  <span className="font-medium">
                    {formatTime(task.timeSpent)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated:</span>
                  <span className="font-medium">
                    {formatTime(task.estimatedTime)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>Efficiency:</span>
                  <span
                    className={`font-medium ${isOvertime ? "text-orange-600" : "text-green-600"}`}
                  >
                    {task.estimatedTime > 0
                      ? `${Math.round((task.estimatedTime / task.timeSpent) * 100)}%`
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span
                    className={`font-medium ${isOvertime ? "text-orange-600" : "text-green-600"}`}
                  >
                    {isOvertime
                      ? `${formatTime(timeDifference)} overtime`
                      : `${formatTime(timeDifference)} under budget`}
                  </span>
                </div>
              </div>
            </div>

            {/* Completion Remarks */}
            <div className="space-y-2">
              <Label htmlFor="remarks">Completion Remarks (Optional)</Label>
              <Textarea
                id="remarks"
                placeholder="Add any notes about the task completion, challenges faced, lessons learned, or outcomes achieved..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                These remarks will be saved with the completed task for future
                reference.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
);

CompleteTaskDialog.displayName = "CompleteTaskDialog";
