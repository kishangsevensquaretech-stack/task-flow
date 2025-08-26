import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeSelector } from "@/components/ThemeSelector";
import { TimerDisplay } from "@/components/TimerDisplay";
import { TaskDialog } from "@/components/TaskDialog";
import { SimpleAvatar } from "@/components/EnhancedAvatar";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  Plus,
  Play,
  Pause,
  CheckCircle2,
  Circle,
  Target,
  TrendingUp,
  Bell,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  User,
  Settings,
  LogOut,
  List,
  Grid3X3,
  Columns,
  ChevronDown,
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  timeSpent: number; // in minutes
  estimatedTime: number; // in minutes
  isRunning: boolean;
  startTime?: Date;
  dueDate: Date;
  category: string;
  userId: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
}

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [editTaskOpen, setEditTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTab, setSelectedTab] = useState("all");
  const [dashboardPage, setDashboardPage] = useState(1);
  const [dashboardItemsPerPage] = useState(6);
  const [viewType, setViewType] = useState<"list" | "board" | "kanban">("list");
  const [customItemsPerPage, setCustomItemsPerPage] = useState(4);
  const navigate = useNavigate();

  // Create sample tasks for demo purposes
  const createSampleTasks = (userId: string): Task[] => [
    {
      id: `${userId}_1`,
      title: "Design landing page wireframes",
      description:
        "Create wireframes for the new product landing page with focus on conversion optimization.",
      status: "in-progress",
      priority: "high",
      timeSpent: 95,
      estimatedTime: 180,
      isRunning: false,
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2), // 2 days from now
      category: "Design",
      userId: userId,
    },
    {
      id: `${userId}_2`,
      title: "Implement user authentication",
      description:
        "Set up secure user authentication system with JWT tokens and password hashing.",
      status: "todo",
      priority: "high",
      timeSpent: 0,
      estimatedTime: 240,
      isRunning: false,
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // 3 days from now
      category: "Development",
      userId: userId,
    },
    {
      id: `${userId}_3`,
      title: "Write project documentation",
      description:
        "Create comprehensive documentation for the API endpoints and component library.",
      status: "completed",
      priority: "medium",
      timeSpent: 120,
      estimatedTime: 120,
      isRunning: false,
      dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      category: "Documentation",
      userId: userId,
    },
    {
      id: `${userId}_4`,
      title: "Code review for feature branch",
      description:
        "Review the new feature implementation and provide feedback to the development team.",
      status: "todo",
      priority: "medium",
      timeSpent: 30,
      estimatedTime: 60,
      isRunning: false,
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day from now
      category: "Review",
      userId: userId,
    },
  ];

  // Load demo data
  const loadDemoData = () => {
    if (!user) return;

    const demoTasks = createSampleTasks(user.id);
    setTasks(demoTasks);
    localStorage.setItem(`tasks_${user.id}`, JSON.stringify(demoTasks));
  };

  // Load user and their specific tasks
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      // Load tasks from localStorage - each user has their own tasks
      const savedTasks = localStorage.getItem(`tasks_${parsedUser.id}`);
      if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
          ...task,
          dueDate: new Date(task.dueDate),
          startTime: task.startTime ? new Date(task.startTime) : undefined,
        }));
        setTasks(parsedTasks);
      } else {
        // New users start with empty task list
        setTasks([]);
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    if (user && tasks.length > 0) {
      localStorage.setItem(`tasks_${user.id}`, JSON.stringify(tasks));
    }
  }, [tasks, user]);

  // Timer for updating current time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getRunningTaskTime = (task: Task) => {
    if (!task.isRunning || !task.startTime) return task.timeSpent;
    const runningTime = Math.floor(
      (currentTime.getTime() - task.startTime.getTime()) / 1000 / 60,
    );
    return task.timeSpent + runningTime;
  };

  const formatTime = (minutes: number) => {
    const totalMinutes = Math.floor(minutes);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours}h ${mins}m`;
  };

  const toggleTimer = (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          if (task.isRunning) {
            // Stop timer
            const runningTime = Math.floor(
              (currentTime.getTime() - (task.startTime?.getTime() || 0)) /
                1000 /
                60,
            );
            return {
              ...task,
              isRunning: false,
              timeSpent: task.timeSpent + runningTime,
              startTime: undefined,
            };
          } else {
            // Start timer (stop all other timers first)
            return {
              ...task,
              isRunning: true,
              startTime: currentTime,
            };
          }
        }
        // Stop all other timers
        return { ...task, isRunning: false, startTime: undefined };
      }),
    );
  };

  const stopTimer = (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId && task.isRunning) {
          const runningTime = Math.floor(
            (currentTime.getTime() - (task.startTime?.getTime() || 0)) /
              1000 /
              60,
          );
          return {
            ...task,
            isRunning: false,
            timeSpent: task.timeSpent + runningTime,
            startTime: undefined,
          };
        }
        return task;
      }),
    );
  };

  const createTask = (taskData: Partial<Task>) => {
    if (!user) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: taskData.title || "",
      description: taskData.description || "",
      status: "todo",
      priority: taskData.priority || "medium",
      timeSpent: 0,
      estimatedTime: taskData.estimatedTime || 60,
      isRunning: false,
      dueDate: taskData.dueDate || new Date(),
      category: taskData.category || "Development",
      userId: user.id,
    };

    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  const updateTask = (taskData: Partial<Task>) => {
    if (!editingTask) return;

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === editingTask.id
          ? {
              ...task,
              title: taskData.title || task.title,
              description: taskData.description || task.description,
              priority: taskData.priority || task.priority,
              estimatedTime: taskData.estimatedTime || task.estimatedTime,
              category: taskData.category || task.category,
              dueDate: taskData.dueDate || task.dueDate,
            }
          : task,
      ),
    );

    setEditingTask(null);
  };

  const editTask = (task: Task) => {
    setEditingTask(task);
    setEditTaskOpen(true);
  };

  const deleteTask = (taskId: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  const toggleTaskStatus = (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          const newStatus =
            task.status === "completed"
              ? "todo"
              : task.status === "todo"
                ? "in-progress"
                : "completed";
          return {
            ...task,
            status: newStatus,
            isRunning: false,
            startTime: undefined,
          };
        }
        return task;
      }),
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    if (user) {
      localStorage.removeItem(`tasks_${user.id}`);
    }
    navigate("/login");
  };

  // Filter and search tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab = selectedTab === "all" || task.status === selectedTab;

    return matchesSearch && matchesTab;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTasks.length / customItemsPerPage);
  const startIndex = (currentPage - 1) * customItemsPerPage;
  const paginatedTasks = filteredTasks.slice(
    startIndex,
    startIndex + customItemsPerPage,
  );

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTab]);

  // Reset dashboard page to first when tasks change significantly
  useEffect(() => {
    setDashboardPage(1);
  }, [tasks.length]);

  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const totalTasks = tasks.length;
  const totalTimeSpent = tasks.reduce(
    (acc, task) => acc + getRunningTaskTime(task),
    0,
  );
  const todayTasks = tasks.filter((t) => {
    const today = new Date();
    const taskDate = new Date(t.dueDate);
    return taskDate.toDateString() === today.toDateString();
  }).length;

  const getPriorityColor = (priority: string) => {
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
  };

  const getStatusIcon = (status: string, isRunning: boolean) => {
    if (status === "completed")
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (isRunning) return <Play className="h-4 w-4 text-blue-500" />;
    return <Circle className="h-4 w-4 text-muted-foreground" />;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <Target className="h-5 w-5 text-primary-foreground" />
                </div>
                <h1 className="text-xl font-bold">TaskFlow</h1>
              </div>
              <nav className="hidden md:flex space-x-6">
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`text-sm font-medium transition-colors ${
                    activeTab === "dashboard"
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab("tasks")}
                  className={`text-sm font-medium transition-colors ${
                    activeTab === "tasks"
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Tasks
                </button>
                <button
                  onClick={() => setActiveTab("analytics")}
                  className={`text-sm font-medium transition-colors ${
                    activeTab === "analytics"
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Analytics
                </button>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  className="pl-9 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <ThemeSelector />
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full p-0"
                  >
                    <SimpleAvatar user={user} size="sm" showTooltip={true} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Tasks
                  </CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalTasks}</div>
                  <p className="text-xs text-muted-foreground">
                    {completedTasks} completed
                  </p>
                  <Progress
                    value={(completedTasks / totalTasks) * 100}
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Time Tracked
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatTime(totalTimeSpent)}
                  </div>
                  <p className="text-xs text-muted-foreground">This week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Due Today
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{todayTasks}</div>
                  <p className="text-xs text-muted-foreground">
                    Tasks scheduled
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Productivity
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">85%</div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last week
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Active Timer and Tasks */}
            <div className="grid lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Active Tasks</CardTitle>
                      <CardDescription>
                        All your tasks - running tasks appear first
                      </CardDescription>
                    </div>
                    <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          New Task
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(() => {
                      // Sort tasks: running tasks first, then by priority and status
                      const activeTasks = tasks
                        .filter((t) => t.status !== "completed")
                        .sort((a, b) => {
                          // Running tasks always come first
                          if (a.isRunning && !b.isRunning) return -1;
                          if (!a.isRunning && b.isRunning) return 1;

                          // If both or neither are running, sort by priority
                          const priorityOrder = { high: 3, medium: 2, low: 1 };
                          return (
                            priorityOrder[b.priority] -
                            priorityOrder[a.priority]
                          );
                        });

                      // Pagination for dashboard
                      const totalDashboardPages = Math.ceil(
                        activeTasks.length / dashboardItemsPerPage,
                      );
                      const startIdx =
                        (dashboardPage - 1) * dashboardItemsPerPage;
                      const paginatedDashboardTasks = activeTasks.slice(
                        startIdx,
                        startIdx + dashboardItemsPerPage,
                      );

                      return (
                        <>
                          {paginatedDashboardTasks.map((task) => (
                            <div
                              key={task.id}
                              className={`flex items-center space-x-4 p-4 rounded-lg border transition-colors ${task.isRunning ? "border-primary/50 bg-primary/5" : "border-border/50 hover:border-border"}`}
                            >
                              <button onClick={() => toggleTaskStatus(task.id)}>
                                {getStatusIcon(task.status, task.isRunning)}
                              </button>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                  <h3 className="font-medium truncate">
                                    {task.title}
                                  </h3>
                                  <Badge
                                    variant="outline"
                                    className={getPriorityColor(task.priority)}
                                  >
                                    {task.priority}
                                  </Badge>
                                  {task.isRunning && (
                                    <Badge
                                      variant="default"
                                      className="bg-green-500"
                                    >
                                      <div className="h-2 w-2 bg-white rounded-full animate-pulse mr-1"></div>
                                      Running
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground truncate">
                                  {task.description}
                                </p>
                                <div className="flex items-center space-x-4 mt-2">
                                  <span className="text-xs text-muted-foreground">
                                    {formatTime(getRunningTaskTime(task))} /{" "}
                                    {formatTime(task.estimatedTime)}
                                  </span>
                                  <Progress
                                    value={
                                      (getRunningTaskTime(task) /
                                        task.estimatedTime) *
                                      100
                                    }
                                    className="w-24 h-1"
                                  />
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleTimer(task.id)}
                                >
                                  {task.isRunning ? (
                                    <Pause className="h-4 w-4" />
                                  ) : (
                                    <Play className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => editTask(task)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}

                          {/* Dashboard Pagination */}
                          {totalDashboardPages > 1 && (
                            <div className="flex items-center justify-between pt-4 border-t">
                              <div className="text-sm text-muted-foreground">
                                Showing {startIdx + 1} to{" "}
                                {Math.min(
                                  startIdx + dashboardItemsPerPage,
                                  activeTasks.length,
                                )}{" "}
                                of {activeTasks.length} active tasks
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setDashboardPage(dashboardPage - 1)
                                  }
                                  disabled={dashboardPage === 1}
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                  Previous
                                </Button>
                                <div className="flex items-center space-x-1">
                                  {Array.from(
                                    { length: totalDashboardPages },
                                    (_, i) => i + 1,
                                  ).map((page) => (
                                    <Button
                                      key={page}
                                      variant={
                                        dashboardPage === page
                                          ? "default"
                                          : "outline"
                                      }
                                      size="sm"
                                      onClick={() => setDashboardPage(page)}
                                      className="w-8 h-8 p-0"
                                    >
                                      {page}
                                    </Button>
                                  ))}
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setDashboardPage(dashboardPage + 1)
                                  }
                                  disabled={
                                    dashboardPage === totalDashboardPages
                                  }
                                >
                                  Next
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}

                          {activeTasks.length === 0 && (
                            <div className="text-center py-8">
                              <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">
                                No active tasks
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Create a new task to get started
                              </p>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <TimerDisplay
                  tasks={tasks}
                  onToggleTimer={toggleTimer}
                  onStopTimer={stopTimer}
                />

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <div className="flex-1">
                          <p className="text-sm">Completed documentation</p>
                          <p className="text-xs text-muted-foreground">
                            2 hours ago
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Play className="h-4 w-4 text-blue-500" />
                        <div className="flex-1">
                          <p className="text-sm">Started wireframe design</p>
                          <p className="text-xs text-muted-foreground">
                            15 minutes ago
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Plus className="h-4 w-4 text-primary" />
                        <div className="flex-1">
                          <p className="text-sm">Added new task</p>
                          <p className="text-xs text-muted-foreground">
                            1 hour ago
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === "tasks" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">All Tasks</h2>
              <div className="flex items-center space-x-4">
                {/* View Type Selector */}
                <div className="flex items-center space-x-1 border rounded-lg">
                  <Button
                    variant={viewType === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewType("list")}
                    className="rounded-r-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewType === "board" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewType("board")}
                    className="rounded-none border-x"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewType === "kanban" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewType("kanban")}
                    className="rounded-l-none"
                  >
                    <Columns className="h-4 w-4" />
                  </Button>
                </div>

                {/* Items per page selector (only show for list and board views) */}
                {viewType !== "kanban" && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Show:</span>
                    <Select
                      value={customItemsPerPage.toString()}
                      onValueChange={(value) => {
                        setCustomItemsPerPage(parseInt(value));
                        setCurrentPage(1); // Reset to first page
                      }}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="8">8</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="15">15</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Task
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </div>

            <Tabs
              value={selectedTab}
              onValueChange={setSelectedTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All ({tasks.length})</TabsTrigger>
                <TabsTrigger value="todo">
                  To Do ({tasks.filter((t) => t.status === "todo").length})
                </TabsTrigger>
                <TabsTrigger value="in-progress">
                  In Progress (
                  {tasks.filter((t) => t.status === "in-progress").length})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed (
                  {tasks.filter((t) => t.status === "completed").length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={selectedTab} className="space-y-4">
                {searchQuery && (
                  <div className="text-sm text-muted-foreground">
                    Found {filteredTasks.length} task
                    {filteredTasks.length !== 1 ? "s" : ""} matching "
                    {searchQuery}"
                  </div>
                )}

                {/* Render different views based on viewType */}
                {viewType === "list" && (
                  <>
                    {/* List View */}
                    {paginatedTasks.map((task) => (
                      <Card key={task.id}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <button onClick={() => toggleTaskStatus(task.id)}>
                                {getStatusIcon(task.status, task.isRunning)}
                              </button>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <h3 className="font-medium">{task.title}</h3>
                                  <Badge
                                    variant="outline"
                                    className={getPriorityColor(task.priority)}
                                  >
                                    {task.priority}
                                  </Badge>
                                  <Badge variant="secondary">
                                    {task.category}
                                  </Badge>
                                  {task.isRunning && (
                                    <Badge
                                      variant="default"
                                      className="bg-green-500"
                                    >
                                      <div className="h-2 w-2 bg-white rounded-full animate-pulse mr-1"></div>
                                      Running
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {task.description}
                                </p>
                                <div className="flex items-center space-x-4 mt-3">
                                  <span className="text-xs text-muted-foreground">
                                    Time: {formatTime(getRunningTaskTime(task))}{" "}
                                    / {formatTime(task.estimatedTime)}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    Due: {task.dueDate.toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleTimer(task.id)}
                              >
                                {task.isRunning ? (
                                  <Pause className="h-4 w-4" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => editTask(task)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteTask(task.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </>
                )}

                {viewType === "board" && (
                  <>
                    {/* Board/Grid View */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {paginatedTasks.map((task) => (
                        <Card
                          key={task.id}
                          className={`h-fit ${task.isRunning ? "border-primary/50 bg-primary/5" : ""}`}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <button onClick={() => toggleTaskStatus(task.id)}>
                                {getStatusIcon(task.status, task.isRunning)}
                              </button>
                              <Badge
                                variant="outline"
                                className={getPriorityColor(task.priority)}
                              >
                                {task.priority}
                              </Badge>
                            </div>
                            <div className="space-y-1">
                              <h3 className="font-medium line-clamp-2">
                                {task.title}
                              </h3>
                              {task.isRunning && (
                                <Badge
                                  variant="default"
                                  className="bg-green-500 w-fit"
                                >
                                  <div className="h-2 w-2 bg-white rounded-full animate-pulse mr-1"></div>
                                  Running
                                </Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {task.description}
                            </p>
                            <div className="space-y-2">
                              <Badge variant="secondary" className="w-fit">
                                {task.category}
                              </Badge>
                              <div className="text-xs text-muted-foreground">
                                Time: {formatTime(getRunningTaskTime(task))} /{" "}
                                {formatTime(task.estimatedTime)}
                              </div>
                              <Progress
                                value={
                                  (getRunningTaskTime(task) /
                                    task.estimatedTime) *
                                  100
                                }
                                className="h-1"
                              />
                              <div className="text-xs text-muted-foreground">
                                Due: {task.dueDate.toLocaleDateString()}
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleTimer(task.id)}
                                className="flex-1"
                              >
                                {task.isRunning ? (
                                  <Pause className="h-4 w-4" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => editTask(task)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteTask(task.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}

                {viewType === "kanban" && (
                  <>
                    {/* Kanban View */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* To Do Column */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-muted-foreground">
                            To Do
                          </h3>
                          <Badge variant="secondary">
                            {
                              filteredTasks.filter((t) => t.status === "todo")
                                .length
                            }
                          </Badge>
                        </div>
                        <div className="space-y-3">
                          {filteredTasks
                            .filter((t) => t.status === "todo")
                            .map((task) => (
                              <Card
                                key={task.id}
                                className="cursor-pointer hover:shadow-md transition-shadow"
                              >
                                <CardContent className="p-4">
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <h4 className="font-medium line-clamp-2">
                                        {task.title}
                                      </h4>
                                      <Badge
                                        variant="outline"
                                        className={getPriorityColor(
                                          task.priority,
                                        )}
                                      >
                                        {task.priority}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                      {task.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {task.category}
                                      </Badge>
                                      <div className="text-xs text-muted-foreground">
                                        {formatTime(task.estimatedTime)}
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleTimer(task.id)}
                                        className="flex-1"
                                      >
                                        <Play className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => editTask(task)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteTask(task.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                        </div>
                      </div>

                      {/* In Progress Column */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-blue-600">
                            In Progress
                          </h3>
                          <Badge variant="secondary">
                            {
                              filteredTasks.filter(
                                (t) => t.status === "in-progress",
                              ).length
                            }
                          </Badge>
                        </div>
                        <div className="space-y-3">
                          {filteredTasks
                            .filter((t) => t.status === "in-progress")
                            .map((task) => (
                              <Card
                                key={task.id}
                                className={`cursor-pointer hover:shadow-md transition-shadow ${task.isRunning ? "border-primary/50 bg-primary/5" : ""}`}
                              >
                                <CardContent className="p-4">
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <h4 className="font-medium line-clamp-2">
                                        {task.title}
                                      </h4>
                                      <Badge
                                        variant="outline"
                                        className={getPriorityColor(
                                          task.priority,
                                        )}
                                      >
                                        {task.priority}
                                      </Badge>
                                    </div>
                                    {task.isRunning && (
                                      <Badge
                                        variant="default"
                                        className="bg-green-500 w-fit"
                                      >
                                        <div className="h-2 w-2 bg-white rounded-full animate-pulse mr-1"></div>
                                        Running
                                      </Badge>
                                    )}
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                      {task.description}
                                    </p>
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <Badge
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          {task.category}
                                        </Badge>
                                        <div className="text-xs text-muted-foreground">
                                          {formatTime(getRunningTaskTime(task))}{" "}
                                          / {formatTime(task.estimatedTime)}
                                        </div>
                                      </div>
                                      <Progress
                                        value={
                                          (getRunningTaskTime(task) /
                                            task.estimatedTime) *
                                          100
                                        }
                                        className="h-1"
                                      />
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleTimer(task.id)}
                                        className="flex-1"
                                      >
                                        {task.isRunning ? (
                                          <Pause className="h-4 w-4" />
                                        ) : (
                                          <Play className="h-4 w-4" />
                                        )}
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => editTask(task)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteTask(task.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                        </div>
                      </div>

                      {/* Completed Column */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-green-600">
                            Completed
                          </h3>
                          <Badge variant="secondary">
                            {
                              filteredTasks.filter(
                                (t) => t.status === "completed",
                              ).length
                            }
                          </Badge>
                        </div>
                        <div className="space-y-3">
                          {filteredTasks
                            .filter((t) => t.status === "completed")
                            .map((task) => (
                              <Card
                                key={task.id}
                                className="cursor-pointer hover:shadow-md transition-shadow opacity-75"
                              >
                                <CardContent className="p-4">
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <h4 className="font-medium line-clamp-2 line-through">
                                        {task.title}
                                      </h4>
                                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                      {task.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {task.category}
                                      </Badge>
                                      <div className="text-xs text-muted-foreground">
                                        {formatTime(task.timeSpent)}
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => editTask(task)}
                                        className="flex-1"
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteTask(task.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Pagination - only show for list and board views */}
                {viewType !== "kanban" && totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Showing {startIndex + 1} to{" "}
                      {Math.min(
                        startIndex + customItemsPerPage,
                        filteredTasks.length,
                      )}{" "}
                      of {filteredTasks.length} tasks
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <div className="flex items-center space-x-1">
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1,
                        ).map((page) => (
                          <Button
                            key={page}
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {filteredTasks.length === 0 && (
                  <div className="text-center py-12">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                      No tasks found
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {searchQuery
                        ? `No tasks match "${searchQuery}"`
                        : "Get started by creating your first task"}
                    </p>
                    <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Task
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Analytics & Reports</h2>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Time Distribution</CardTitle>
                  <CardDescription>
                    How you spend your time across categories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Development</span>
                      <span className="text-sm font-medium">240 min</span>
                    </div>
                    <Progress value={60} />
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Design</span>
                      <span className="text-sm font-medium">95 min</span>
                    </div>
                    <Progress value={24} />
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Documentation</span>
                      <span className="text-sm font-medium">120 min</span>
                    </div>
                    <Progress value={30} />
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Review</span>
                      <span className="text-sm font-medium">30 min</span>
                    </div>
                    <Progress value={8} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Weekly Progress</CardTitle>
                  <CardDescription>
                    Your productivity over the last 7 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                      (day, i) => (
                        <div key={day} className="flex items-center space-x-4">
                          <span className="text-sm w-8">{day}</span>
                          <Progress
                            value={[85, 92, 78, 88, 95, 45, 60][i]}
                            className="flex-1"
                          />
                          <span className="text-sm font-medium">
                            {[6.8, 7.4, 6.2, 7.0, 7.6, 3.6, 4.8][i]}h
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Task Dialogs */}
      <TaskDialog
        open={newTaskOpen}
        onOpenChange={setNewTaskOpen}
        onSubmit={createTask}
      />

      <TaskDialog
        open={editTaskOpen}
        onOpenChange={setEditTaskOpen}
        onSubmit={updateTask}
        task={editingTask || undefined}
        isEdit={true}
      />
    </div>
  );
}
