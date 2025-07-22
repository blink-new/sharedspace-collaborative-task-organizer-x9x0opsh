import { useState } from 'react'
import { ChevronDown, Plus, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Family } from '@/types'

interface HeaderProps {
  user: any
  currentFamily?: Family | null
  families: Family[]
  onFamilyChange: (family: Family | null) => void
  onCreateFamily: () => void
}

export function Header({ user, currentFamily, families, onFamilyChange, onCreateFamily }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        {/* Space Switcher */}
        <div className="flex items-center space-x-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 p-2 h-auto">
                <div className="text-left">
                  <div className="font-semibold text-gray-900 text-sm">
                    {currentFamily ? currentFamily.name : 'Personal'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {currentFamily ? 'Family Space' : 'Your Tasks'}
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem 
                onClick={() => onFamilyChange(null)}
                className={!currentFamily ? 'bg-indigo-50 text-indigo-700' : ''}
              >
                <div>
                  <div className="font-medium">Personal</div>
                  <div className="text-xs text-gray-500">Your private tasks</div>
                </div>
              </DropdownMenuItem>
              
              {families.length > 0 && <DropdownMenuSeparator />}
              
              {families.map((family) => (
                <DropdownMenuItem 
                  key={family.id}
                  onClick={() => onFamilyChange(family)}
                  className={currentFamily?.id === family.id ? 'bg-indigo-50 text-indigo-700' : ''}
                >
                  <div>
                    <div className="font-medium">{family.name}</div>
                    <div className="text-xs text-gray-500">Family space</div>
                  </div>
                </DropdownMenuItem>
              ))}
              
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onCreateFamily}>
                <Plus className="h-4 w-4 mr-2" />
                Create Family
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative"
          >
            <Bell className="h-5 w-5" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              2
            </Badge>
          </Button>

          {/* User Avatar */}
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-indigo-100 text-indigo-700 text-sm">
              {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}