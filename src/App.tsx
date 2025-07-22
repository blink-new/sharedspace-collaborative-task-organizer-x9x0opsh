import { useState, useEffect, useCallback } from 'react'
import { Toaster } from '@/components/ui/toaster'
import { Header } from '@/components/layout/Header'
import { BottomNavigation } from '@/components/layout/BottomNavigation'
import { TasksPage } from '@/pages/TasksPage'
import { CalendarPage } from '@/pages/CalendarPage'
import { FamiliesPage } from '@/pages/FamiliesPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { CreateFamilyDialog } from '@/components/families/CreateFamilyDialog'
import { Family, FamilyMember } from '@/types'
import { blink } from '@/blink/client'

function App() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('tasks')
  const [currentFamily, setCurrentFamily] = useState<Family | null>(null)
  const [families, setFamilies] = useState<Family[]>([])
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [showCreateFamilyDialog, setShowCreateFamilyDialog] = useState(false)

  // Auth state management
  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const loadFamilies = useCallback(async () => {
    if (!user) return
    try {
      const familiesData = await blink.db.families.list({
        where: { ownerId: user.id },
        orderBy: { createdAt: 'desc' }
      })
      setFamilies(familiesData)
    } catch (error) {
      console.error('Failed to load families:', error)
    }
  }, [user])

  const loadFamilyMembers = useCallback(async () => {
    if (!currentFamily) return
    
    try {
      const membersData = await blink.db.familyMembers.list({
        where: { familyId: currentFamily.id },
        orderBy: { joinedAt: 'asc' }
      })
      setFamilyMembers(membersData)
    } catch (error) {
      console.error('Failed to load family members:', error)
    }
  }, [currentFamily])

  // Load families when user is authenticated
  useEffect(() => {
    if (user) {
      loadFamilies()
    }
  }, [user, loadFamilies])

  // Load family members when current family changes
  useEffect(() => {
    if (currentFamily) {
      loadFamilyMembers()
    } else {
      setFamilyMembers([])
    }
  }, [currentFamily, loadFamilyMembers])

  const handleCreateFamily = async (familyData: { name: string; description?: string }) => {
    try {
      const newFamily = await blink.db.families.create({
        id: `family_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...familyData,
        ownerId: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      // Add owner as a member
      await blink.db.familyMembers.create({
        id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        familyId: newFamily.id,
        userId: user.id,
        role: 'owner',
        joinedAt: new Date().toISOString(),
      })

      setFamilies(prev => [newFamily, ...prev])
      setCurrentFamily(newFamily)
    } catch (error) {
      console.error('Failed to create family:', error)
    }
  }

  const handleFamilyChange = (family: Family | null) => {
    setCurrentFamily(family)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading SharedSpace...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">SharedSpace</h1>
            <p className="text-lg text-gray-600">
              Collaborative task management for families and teams
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-gray-700">Create shared family spaces</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                </div>
                <span className="text-gray-700">Invite members via email</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700">Manage tasks with role-based permissions</span>
              </div>
            </div>
            
            <button
              onClick={() => blink.auth.login()}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Sign In to Get Started
            </button>
          </div>
          
          <p className="text-sm text-gray-500">
            Perfect for families, roommates, and small teams
          </p>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'tasks':
        return <TasksPage />
      case 'calendar':
        return <CalendarPage />
      case 'families':
        return <FamiliesPage />
      case 'settings':
        return <SettingsPage />
      default:
        return <TasksPage />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        user={user}
        currentFamily={currentFamily}
        families={families}
        onFamilyChange={handleFamilyChange}
        onCreateFamily={() => setShowCreateFamilyDialog(true)}
      />
      
      <main className="pb-20 pt-4">
        <div className="max-w-4xl mx-auto px-4">
          {renderContent()}
        </div>
      </main>

      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <CreateFamilyDialog
        open={showCreateFamilyDialog}
        onOpenChange={setShowCreateFamilyDialog}
        onCreateFamily={handleCreateFamily}
      />

      <Toaster />
    </div>
  )
}

export default App