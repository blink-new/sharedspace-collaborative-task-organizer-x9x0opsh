import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Users, Crown, Shield, User, Mail, Settings, MoreVertical, UserPlus, Eye, Trash2, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreateFamilyDialog } from '@/components/families/CreateFamilyDialog'
import { EmptyFamiliesIllustration, LoadingSpinner, SuccessCheckmark } from '@/components/ui/illustrations'
import { blink } from '@/blink/client'
import { Family, FamilyMember } from '@/types'

export function FamiliesPage() {
  const [families, setFamilies] = useState<Family[]>([])
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'member' | 'moderator'>('member')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteSuccess, setInviteSuccess] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('my-families')

  const loadFamilies = useCallback(async () => {
    try {
      setLoading(true)
      const user = await blink.auth.me()
      if (user) {
        const familiesData = await blink.db.families.list({
          where: { createdBy: user.id },
          orderBy: { createdAt: 'desc' }
        })
        setFamilies(familiesData || [])

        // Load members for all families
        const allMembers = []
        for (const family of familiesData || []) {
          const familyMembers = await blink.db.family_members.list({
            where: { familyId: family.id }
          })
          allMembers.push(...(familyMembers || []))
        }
        setMembers(allMembers)
      }
    } catch (error) {
      console.error('Failed to load families:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      if (state.user) {
        loadFamilies()
      } else {
        setLoading(false)
      }
    })
    return unsubscribe
  }, [loadFamilies])

  const handleCreateFamily = useCallback(async (familyData: Omit<Family, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const user = await blink.auth.me()
      if (!user) return

      const newFamily = await blink.db.families.create({
        ...familyData,
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      if (newFamily) {
        // Add creator as admin member
        await blink.db.family_members.create({
          familyId: newFamily.id,
          userId: user.id,
          email: user.email,
          role: 'admin',
          status: 'active',
          joinedAt: new Date().toISOString()
        })

        setFamilies(prev => [newFamily, ...prev])
        loadFamilies() // Reload to get updated member counts
      }
    } catch (error) {
      console.error('Failed to create family:', error)
    }
  }, [loadFamilies])

  const handleInviteMember = async () => {
    if (!selectedFamily || !inviteEmail.trim()) return

    try {
      setInviteLoading(true)
      
      // Create family member invitation
      await blink.db.family_members.create({
        familyId: selectedFamily.id,
        email: inviteEmail.trim(),
        role: inviteRole,
        status: 'invited',
        invitedAt: new Date().toISOString()
      })

      setInviteSuccess(true)
      setTimeout(() => {
        setInviteSuccess(false)
        setShowInviteDialog(false)
        setInviteEmail('')
        setInviteRole('member')
        setSelectedFamily(null)
        loadFamilies()
      }, 2000)

    } catch (error) {
      console.error('Failed to invite member:', error)
    } finally {
      setInviteLoading(false)
    }
  }

  const getFamilyMembers = (familyId: string) => {
    return members.filter(member => member.familyId === familyId)
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-3 w-3" />
      case 'moderator': return <Shield className="h-3 w-3" />
      default: return <User className="h-3 w-3" />
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'default'
      case 'moderator': return 'secondary'
      default: return 'outline'
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  // Get families where user is a member (not creator)
  const getMemberFamilies = () => {
    if (!user) return []
    return members
      .filter(member => member.email === user.email && member.status === 'active')
      .map(member => families.find(family => family.id === member.familyId))
      .filter(Boolean) as Family[]
  }

  const myFamilies = families
  const memberFamilies = getMemberFamilies()

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <EmptyFamiliesIllustration />
        <h3 className="text-lg font-semibold mt-4 mb-2">Family Spaces</h3>
        <p className="text-muted-foreground text-center mb-4">
          Sign in to create and manage your family spaces
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
            <h1 className="text-2xl font-bold">Family Spaces</h1>
            <p className="text-muted-foreground">
              Manage your collaborative spaces and team members
            </p>
          </div>
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="rounded-full h-12 w-12 p-0 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-xs text-blue-600 font-medium">My Spaces</p>
                  <p className="text-lg font-bold text-blue-700">{myFamilies.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <Crown className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-xs text-green-600 font-medium">Member Of</p>
                  <p className="text-lg font-bold text-green-700">{memberFamilies.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-xs text-purple-600 font-medium">Total Members</p>
                  <p className="text-lg font-bold text-purple-700">
                    {members.filter(m => m.status === 'active').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner size={32} />
          <p className="text-muted-foreground mt-4">Loading family spaces...</p>
        </div>
      ) : (
        <div className="flex-1 px-4 pb-20">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="my-families">
                My Spaces ({myFamilies.length})
              </TabsTrigger>
              <TabsTrigger value="member-families">
                Member Of ({memberFamilies.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="my-families">
              {myFamilies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <EmptyFamiliesIllustration />
                  <h3 className="text-lg font-semibold mt-4 mb-2">No family spaces yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Create your first family space to start collaborating with your team
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Space
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myFamilies.map((family, index) => {
                    const familyMembers = getFamilyMembers(family.id)
                    const activeMembers = familyMembers.filter(m => m.status === 'active')
                    const pendingInvites = familyMembers.filter(m => m.status === 'invited')

                    return (
                      <Card 
                        key={family.id} 
                        className="hover:shadow-lg transition-all duration-200 animate-fade-in"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="flex items-center space-x-2">
                                <span>{family.name}</span>
                                <Badge variant="secondary">
                                  {activeMembers.length} members
                                </Badge>
                                {pendingInvites.length > 0 && (
                                  <Badge variant="outline">
                                    {pendingInvites.length} pending
                                  </Badge>
                                )}
                              </CardTitle>
                              {family.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {family.description}
                                </p>
                              )}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedFamily(family)
                                    setShowInviteDialog(true)
                                  }}
                                >
                                  <UserPlus className="h-4 w-4 mr-2" />
                                  Invite Member
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Space
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Space
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {/* Member Avatars */}
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium">Members:</span>
                              <div className="flex -space-x-2">
                                {activeMembers.slice(0, 5).map((member, i) => (
                                  <Avatar key={i} className="h-8 w-8 border-2 border-background">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${member.email}`} />
                                    <AvatarFallback className="text-xs">
                                      {getInitials(member.email)}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                                {activeMembers.length > 5 && (
                                  <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                                    <span className="text-xs font-medium">
                                      +{activeMembers.length - 5}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Member List */}
                            <div className="space-y-2">
                              {activeMembers.slice(0, 3).map((member, i) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                  <div className="flex items-center space-x-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${member.email}`} />
                                      <AvatarFallback className="text-xs">
                                        {getInitials(member.email)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span>{member.email}</span>
                                  </div>
                                  <Badge variant={getRoleBadgeVariant(member.role)} className="text-xs">
                                    {getRoleIcon(member.role)}
                                    <span className="ml-1">{member.role}</span>
                                  </Badge>
                                </div>
                              ))}
                              {activeMembers.length > 3 && (
                                <p className="text-xs text-muted-foreground">
                                  +{activeMembers.length - 3} more members
                                </p>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-2 pt-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedFamily(family)
                                  setShowInviteDialog(true)
                                }}
                              >
                                <UserPlus className="h-4 w-4 mr-2" />
                                Invite
                              </Button>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                              <Button variant="outline" size="sm">
                                <Settings className="h-4 w-4 mr-2" />
                                Manage
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="member-families">
              {memberFamilies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Users className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No memberships yet</h3>
                  <p className="text-muted-foreground text-center">
                    You haven't been invited to any family spaces yet
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {memberFamilies.map((family, index) => {
                    const familyMembers = getFamilyMembers(family.id)
                    const myMembership = familyMembers.find(m => m.email === user.email)

                    return (
                      <Card 
                        key={family.id}
                        className="hover:shadow-lg transition-all duration-200 animate-fade-in"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <span>{family.name}</span>
                            <Badge variant={getRoleBadgeVariant(myMembership?.role || 'member')}>
                              {getRoleIcon(myMembership?.role || 'member')}
                              <span className="ml-1">{myMembership?.role}</span>
                            </Badge>
                          </CardTitle>
                          {family.description && (
                            <p className="text-sm text-muted-foreground">
                              {family.description}
                            </p>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {familyMembers.filter(m => m.status === 'active').length} members
                              </span>
                            </div>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View Tasks
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Create Family Dialog */}
      <CreateFamilyDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateFamily={handleCreateFamily}
      />

      {/* Invite Member Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Member to {selectedFamily?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {inviteSuccess ? (
              <div className="flex flex-col items-center justify-center py-8">
                <SuccessCheckmark size={48} />
                <h3 className="text-lg font-semibold mt-4">Invitation Sent!</h3>
                <p className="text-muted-foreground text-center">
                  An invitation has been sent to {inviteEmail}
                </p>
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="invite-email">Email Address</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="Enter email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="invite-role">Role</Label>
                  <Select value={inviteRole} onValueChange={(value: 'member' | 'moderator') => setInviteRole(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>Member</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="moderator">
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4" />
                          <span>Moderator</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleInviteMember}
                    disabled={!inviteEmail.trim() || inviteLoading}
                    className="flex-1"
                  >
                    {inviteLoading ? (
                      <>
                        <LoadingSpinner size={16} />
                        <span className="ml-2">Sending...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Invitation
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}