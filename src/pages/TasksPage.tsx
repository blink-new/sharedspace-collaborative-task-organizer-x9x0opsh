import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Filter, Calendar, Users, CheckCircle2, Clock, AlertCircle, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { TaskCard } from '@/components/tasks/TaskCard'
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog'
import { EmptyTasksIllustration, LoadingSpinner } from '@/components/ui/illustrations'
import { blink } from '@/blink/client'
import { Task } from '@/types'

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [user, setUser] = useState<any>(null)

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true)
      const user = await blink.auth.me()
      if (user) {
        const tasksData = await blink.db.tasks.list({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' }
        })
        setTasks(tasksData || [])
      }
    } catch (error) {
      console.error('Failed to load tasks:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load user and tasks
  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      if (state.user) {
        loadTasks()
      } else {
        setLoading(false)
      }
    })
    return unsubscribe
  }, [loadTasks])

  const handleCreateTask = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const user = await blink.auth.me()
      if (!user) return

      const newTask = await blink.db.tasks.create({
        ...taskData,
        userId: user.id,
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      if (newTask) {
        setTasks(prev => [newTask, ...prev])
      }
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }, [])

  const handleUpdateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    try {
      await blink.db.tasks.update(taskId, {
        ...updates,
        updatedAt: new Date().toISOString()
      })
      
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      ))
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }, [])

  const handleDeleteTask = useCallback(async (taskId: string) => {
    try {
      await blink.db.tasks.delete(taskId)
      setTasks(prev => prev.filter(task => task.id !== taskId))
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }, [])

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  // Task statistics
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    overdue: tasks.filter(t => {
      if (!t.dueDate) return false
      return new Date(t.dueDate) < new Date() && t.status !== 'completed'
    }).length
  }

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  // Group tasks by tab
  const getTasksByTab = (tab: string) => {
    switch (tab) {
      case 'today':
        return filteredTasks.filter(task => {
          if (!task.dueDate) return false
          const today = new Date().toDateString()
          return new Date(task.dueDate).toDateString() === today
        })
      case 'upcoming':
        return filteredTasks.filter(task => {
          if (!task.dueDate) return false
          const tomorrow = new Date()
          tomorrow.setDate(tomorrow.getDate() + 1)
          return new Date(task.dueDate) >= tomorrow
        })
      case 'completed':
        return filteredTasks.filter(task => task.status === 'completed')
      default:
        return filteredTasks
    }
  }

  const currentTasks = getTasksByTab(activeTab)

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <EmptyTasksIllustration />
        <h3 className="text-lg font-semibold mt-4 mb-2">Welcome to SharedSpace</h3>
        <p className="text-muted-foreground text-center mb-4">
          Sign in to start organizing your tasks and collaborating with your team
        </p>
        <Button onClick={() => blink.auth.login()}>
          Sign In to Get Started
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background to-muted/20">
      {/* Header with Stats */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Tasks</h1>
            <p className="text-muted-foreground">
              {stats.total} tasks • {completionRate}% complete
            </p>
          </div>
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="rounded-full h-12 w-12 p-0 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-xs text-blue-600 font-medium">Completed</p>
                  <p className="text-lg font-bold text-blue-700">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <div>
                  <p className="text-xs text-amber-600 font-medium">In Progress</p>
                  <p className="text-lg font-bold text-amber-700">{stats.inProgress}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-600 font-medium">Pending</p>
                  <p className="text-lg font-bold text-gray-700">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-xs text-red-600 font-medium">Overdue</p>
                  <p className="text-lg font-bold text-red-700">{stats.overdue}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-32">
                <BarChart3 className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Task Tabs */}
      <div className="flex-1 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="all" className="text-xs">
              All ({filteredTasks.length})
            </TabsTrigger>
            <TabsTrigger value="today" className="text-xs">
              Today ({getTasksByTab('today').length})
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="text-xs">
              Upcoming ({getTasksByTab('upcoming').length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-xs">
              Done ({getTasksByTab('completed').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="h-full">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <LoadingSpinner size={32} />
                <p className="text-muted-foreground mt-4">Loading your tasks...</p>
              </div>
            ) : currentTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <EmptyTasksIllustration />
                <h3 className="text-lg font-semibold mt-4 mb-2">
                  {activeTab === 'all' ? 'No tasks yet' : 
                   activeTab === 'today' ? 'No tasks for today' :
                   activeTab === 'upcoming' ? 'No upcoming tasks' :
                   'No completed tasks'}
                </h3>
                <p className="text-muted-foreground text-center mb-4">
                  {activeTab === 'all' ? 'Create your first task to get started with organizing your work' :
                   activeTab === 'today' ? 'You\'re all caught up for today!' :
                   activeTab === 'upcoming' ? 'No upcoming deadlines to worry about' :
                   'Complete some tasks to see them here'}
                </p>
                {activeTab === 'all' && (
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Task
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3 pb-20">
                {currentTasks.map((task, index) => (
                  <div
                    key={task.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TaskCard
                      task={task}
                      onUpdate={handleUpdateTask}
                      onDelete={handleDeleteTask}
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <CreateTaskDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateTask={handleCreateTask}
      />
    </div>
  )
}