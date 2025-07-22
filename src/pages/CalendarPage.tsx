import React, { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, CheckCircle2, AlertTriangle, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CalendarIllustration, LoadingSpinner } from '@/components/ui/illustrations'
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog'
import { blink } from '@/blink/client'
import { Task } from '@/types'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isToday, addMonths, subMonths } from 'date-fns'

export function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [filterPriority, setFilterPriority] = useState<string>('all')
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

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false
      return isSameDay(new Date(task.dueDate), date)
    }).filter(task => {
      if (filterPriority === 'all') return true
      return task.priority === filterPriority
    })
  }

  // Get all tasks in current month
  const getTasksInMonth = () => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    
    return tasks.filter(task => {
      if (!task.dueDate) return false
      const taskDate = new Date(task.dueDate)
      return taskDate >= start && taskDate <= end
    })
  }

  // Calendar navigation
  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  // Generate calendar days
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Add padding days for proper grid layout
  const startDay = monthStart.getDay()
  const paddingDays = Array.from({ length: startDay }, (_, i) => {
    const date = new Date(monthStart)
    date.setDate(date.getDate() - (startDay - i))
    return date
  })

  const endDay = monthEnd.getDay()
  const endPaddingDays = Array.from({ length: 6 - endDay }, (_, i) => {
    const date = new Date(monthEnd)
    date.setDate(date.getDate() + (i + 1))
    return date
  })

  const allDays = [...paddingDays, ...calendarDays, ...endPaddingDays]

  // Statistics
  const monthTasks = getTasksInMonth()
  const stats = {
    total: monthTasks.length,
    completed: monthTasks.filter(t => t.status === 'completed').length,
    pending: monthTasks.filter(t => t.status === 'pending').length,
    overdue: monthTasks.filter(t => {
      if (!t.dueDate) return false
      return new Date(t.dueDate) < new Date() && t.status !== 'completed'
    }).length
  }

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : []

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <CalendarIllustration />
        <h3 className="text-lg font-semibold mt-4 mb-2">Calendar View</h3>
        <p className="text-muted-foreground text-center mb-4">
          Sign in to view your tasks in calendar format
        </p>
        <Button onClick={() => blink.auth.login()}>
          Sign In to Continue
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Calendar</h1>
            <p className="text-muted-foreground">
              {format(currentDate, 'MMMM yyyy')} • {stats.total} tasks this month
            </p>
          </div>
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="rounded-full h-12 w-12 p-0 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>

        {/* Month Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-xs text-blue-600 font-medium">Total</p>
                  <p className="text-lg font-bold text-blue-700">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-xs text-green-600 font-medium">Completed</p>
                  <p className="text-lg font-bold text-green-700">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <div>
                  <p className="text-xs text-amber-600 font-medium">Pending</p>
                  <p className="text-lg font-bold text-amber-700">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-xs text-red-600 font-medium">Overdue</p>
                  <p className="text-lg font-bold text-red-700">{stats.overdue}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation and Filter */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
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

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner size={32} />
          <p className="text-muted-foreground mt-4">Loading calendar...</p>
        </div>
      ) : (
        <div className="flex-1 px-4 pb-20">
          {/* Calendar Grid */}
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <div className="grid grid-cols-7 gap-1 text-center">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-xs font-medium text-muted-foreground p-2">
                    {day}
                  </div>
                ))}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-7 gap-1">
                {allDays.map((day, index) => {
                  const dayTasks = getTasksForDate(day)
                  const isCurrentMonth = isSameMonth(day, currentDate)
                  const isTodayDate = isToday(day)
                  const isSelected = selectedDate && isSameDay(day, selectedDate)
                  
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        relative p-2 h-12 text-sm rounded-lg transition-all duration-200 hover:bg-muted
                        ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}
                        ${isTodayDate ? 'bg-primary text-primary-foreground font-semibold' : ''}
                        ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
                        ${dayTasks.length > 0 ? 'font-medium' : ''}
                      `}
                    >
                      <span>{day.getDate()}</span>
                      {dayTasks.length > 0 && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
                          {dayTasks.slice(0, 3).map((task, i) => (
                            <div
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full ${
                                task.priority === 'high' ? 'bg-red-500' :
                                task.priority === 'medium' ? 'bg-amber-500' :
                                'bg-blue-500'
                              }`}
                            />
                          ))}
                          {dayTasks.length > 3 && (
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          )}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Selected Date Tasks */}
          {selectedDate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  <Badge variant="secondary" className="ml-2">
                    {selectedDateTasks.length} tasks
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDateTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No tasks scheduled for this date</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => setShowCreateDialog(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDateTasks.map((task, index) => (
                      <div
                        key={task.id}
                        className="flex items-center space-x-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors animate-fade-in"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className={`w-3 h-3 rounded-full ${
                          task.priority === 'high' ? 'bg-red-500' :
                          task.priority === 'medium' ? 'bg-amber-500' :
                          'bg-blue-500'
                        }`} />
                        <div className="flex-1">
                          <h4 className="font-medium">{task.title}</h4>
                          {task.description && (
                            <p className="text-sm text-muted-foreground">{task.description}</p>
                          )}
                        </div>
                        <Badge variant={
                          task.status === 'completed' ? 'default' :
                          task.status === 'in-progress' ? 'secondary' :
                          'outline'
                        }>
                          {task.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <CreateTaskDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateTask={handleCreateTask}
        defaultDate={selectedDate}
      />
    </div>
  )
}