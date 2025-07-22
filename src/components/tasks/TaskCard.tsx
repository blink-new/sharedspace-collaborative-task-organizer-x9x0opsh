import { useState } from 'react'
import { MoreHorizontal, Clock, User, Flag } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Task } from '@/types'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onStatusChange: (taskId: string, status: Task['status']) => void
  isDragging?: boolean
}

const priorityColors = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-red-100 text-red-800 border-red-200',
}

const statusColors = {
  todo: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
}

export function TaskCard({ task, onEdit, onDelete, onStatusChange, isDragging }: TaskCardProps) {
  const [isCompleting, setIsCompleting] = useState(false)

  const handleStatusToggle = async () => {
    if (task.status === 'completed') {
      onStatusChange(task.id, 'todo')
    } else {
      setIsCompleting(true)
      onStatusChange(task.id, 'completed')
      setTimeout(() => setIsCompleting(false), 300)
    }
  }

  const formatDueDate = (dateString?: string) => {
    if (!dateString) return null
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'Overdue'
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays <= 7) return `${diffDays} days`
    return date.toLocaleDateString()
  }

  return (
    <Card 
      className={cn(
        "transition-all duration-200 hover:shadow-md cursor-pointer",
        isDragging && "opacity-50 rotate-2 shadow-lg",
        task.status === 'completed' && "opacity-75",
        isCompleting && "scale-95"
      )}
      onClick={() => onEdit(task)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleStatusToggle()
              }}
              className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                task.status === 'completed'
                  ? "bg-green-500 border-green-500"
                  : "border-gray-300 hover:border-indigo-500"
              )}
            >
              {task.status === 'completed' && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            
            <Badge variant="outline" className={priorityColors[task.priority]}>
              <Flag className="w-3 h-3 mr-1" />
              {task.priority}
            </Badge>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                Edit Task
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onStatusChange(task.id, task.status === 'in_progress' ? 'todo' : 'in_progress')}
              >
                {task.status === 'in_progress' ? 'Mark as Todo' : 'Start Working'}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(task.id)}
                className="text-red-600"
              >
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2">
          <h3 className={cn(
            "font-medium text-gray-900 leading-tight",
            task.status === 'completed' && "line-through text-gray-500"
          )}>
            {task.title}
          </h3>
          
          {task.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {task.assignee && (
                <div className="flex items-center space-x-1">
                  <User className="w-3 h-3 text-gray-400" />
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={task.assignee.avatar} />
                    <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700">
                      {task.assignee.displayName?.charAt(0) || task.assignee.email?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}

              {task.dueDate && (
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span className={cn(
                    formatDueDate(task.dueDate) === 'Overdue' && "text-red-600 font-medium"
                  )}>
                    {formatDueDate(task.dueDate)}
                  </span>
                </div>
              )}
            </div>

            <Badge variant="secondary" className={statusColors[task.status]}>
              {task.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}