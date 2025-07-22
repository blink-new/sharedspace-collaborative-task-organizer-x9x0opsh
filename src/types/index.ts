export interface User {
  id: string
  email: string
  displayName: string
  avatar?: string
  createdAt: string
}

export interface Family {
  id: string
  name: string
  description?: string
  ownerId: string
  createdAt: string
  updatedAt: string
}

export interface FamilyMember {
  id: string
  familyId: string
  userId: string
  role: 'owner' | 'admin' | 'member'
  joinedAt: string
  user?: User
}

export interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  assignedTo?: string
  createdBy: string
  userId: string
  familyId?: string
  dueDate?: string
  createdAt: string
  updatedAt: string
  assignee?: User
  creator?: User
}

export interface FamilyInvitation {
  id: string
  familyId: string
  email: string
  role: 'admin' | 'member'
  invitedBy: string
  status: 'pending' | 'accepted' | 'declined'
  createdAt: string
  expiresAt: string
}