import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Square, Clock } from "lucide-react";
import { rafThrottle } from "@/lib/debounce";

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

interface TimerDisplayProps {
  tasks: Task[];
  onToggleTimer: (taskId: string) => void;
  onStopTimer: (taskId: string) => void;
  className?: string;
}

export const TimerDisplay = React.memo(
  ({
    tasks,
    onToggleTimer,
    onStopTimer,
    className = "",
  }: TimerDisplayProps) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    // Throttle the time updates to prevent excessive re-renders
    const throttledSetCurrentTime = useCallback(
      rafThrottle(() => setCurrentTime(new Date())),
      [],
    );

    useEffect(() => {
      const timer = setInterval(() => {
        throttledSetCurrentTime();
      }, 1000);
      return () => clearInterval(timer);
    }, [throttledSetCurrentTime]);

    const runningTask = useMemo(
      () => tasks.find((task) => task.isRunning),
      [tasks],
    );

    const formatTime = useCallback((minutes: number) => {
      const totalSeconds = Math.floor(minutes * 60);
      const hours = Math.floor(totalSeconds / 3600);
      const mins = Math.floor((totalSeconds % 3600) / 60);
      const secs = totalSeconds % 60;

      if (hours > 0) {
        return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
      }
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    }, []);

    const formatDetailedTime = useCallback((minutes: number) => {
      const totalSeconds = Math.floor(minutes * 60);
      const hours = Math.floor(totalSeconds / 3600);
      const mins = Math.floor((totalSeconds % 3600) / 60);
      const secs = totalSeconds % 60;

      if (hours > 0) {
        return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
      }
      return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }, []);

    const getElapsedTime = useCallback(
      (task: Task) => {
        if (!task.isRunning || !task.startTime) {
          return task.timeSpent;
        }

        // Calculate current session time
        const runningTimeMs = currentTime.getTime() - task.startTime.getTime();
        const runningTimeMinutes = runningTimeMs / 1000 / 60;

        // Return accumulated time + current session time
        return task.timeSpent + runningTimeMinutes;
      },
      [currentTime],
    );

    const getPriorityColor = useCallback((priority: string) => {
      switch (priority) {
        case "high":
          return "bg-red-500/10 text-red-500 border-red-500/20";
        case "medium":
          return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
        case "low":
          return "bg-green-500/10 text-green-500 border-green-500/20";
        default:
          return "bg-gray-500/10 text-gray-500 border-gray-500/20";
      }
    }, []);

    const handleToggleTimer = useCallback(() => {
      if (runningTask) {
        onToggleTimer(runningTask.id);
      }
    }, [runningTask, onToggleTimer]);

    const handleStopTimer = useCallback(() => {
      if (runningTask) {
        onStopTimer(runningTask.id);
      }
    }, [runningTask, onStopTimer]);

    // Memoize the time display to prevent unnecessary recalculations
    const timeDisplay = useMemo(() => {
      if (!runningTask) return null;
      return formatTime(getElapsedTime(runningTask));
    }, [runningTask, getElapsedTime, formatTime]);

    const targetTimeDisplay = useMemo(() => {
      if (!runningTask) return null;
      return formatTime(runningTask.estimatedTime);
    }, [runningTask, formatTime]);

    if (!runningTask) {
      return (
        <Card className={`border-dashed ${className}`}>
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No active timer</p>
            <p className="text-xs text-muted-foreground">
              Start a task to begin tracking time
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className={`border-primary/50 bg-primary/5 ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-base">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Active Timer</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-medium truncate flex-1">
                {runningTask.title}
              </h3>
              <Badge
                variant="outline"
                className={getPriorityColor(runningTask.priority)}
              >
                {runningTask.priority}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {runningTask.description}
            </p>
          </div>

          <div className="text-center">
            <div className="text-3xl font-mono font-bold text-primary mb-1">
              {runningTask
                ? formatDetailedTime(getElapsedTime(runningTask))
                : timeDisplay}
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Target: {targetTimeDisplay}</div>
              {runningTask && runningTask.timeSpent > 0 && (
                <div className="text-blue-600">
                  Previously: {formatTime(runningTask.timeSpent)} • Resuming
                  timer
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleTimer}
              className="flex-1"
            >
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleStopTimer}
              className="flex-1"
            >
              <Square className="h-4 w-4 mr-2" />
              Stop
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  },
);

TimerDisplay.displayName = "TimerDisplay";
