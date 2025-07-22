import React, { useState, useEffect, useCallback } from 'react'
import { User, Bell, Palette, Shield, CreditCard, LogOut, Save, Camera, Mail, Phone, MapPin, Calendar, Crown, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { SettingsIllustration, LoadingSpinner, SuccessCheckmark } from '@/components/ui/illustrations'
import { blink } from '@/blink/client'

const THEME_COLORS = [
  { name: 'Indigo', value: 'indigo', primary: '#6366F1', accent: '#F59E0B' },
  { name: 'Blue', value: 'blue', primary: '#3B82F6', accent: '#10B981' },
  { name: 'Purple', value: 'purple', primary: '#8B5CF6', accent: '#F59E0B' },
  { name: 'Pink', value: 'pink', primary: '#EC4899', accent: '#06B6D4' },
  { name: 'Green', value: 'green', primary: '#10B981', accent: '#F59E0B' },
  { name: 'Orange', value: 'orange', primary: '#F97316', accent: '#8B5CF6' },
  { name: 'Red', value: 'red', primary: '#EF4444', accent: '#10B981' },
  { name: 'Teal', value: 'teal', primary: '#14B8A6', accent: '#F59E0B' }
]

export function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  
  // Profile settings
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [phone, setPhone] = useState('')
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [taskReminders, setTaskReminders] = useState(true)
  const [familyUpdates, setFamilyUpdates] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(false)
  
  // Theme settings
  const [selectedTheme, setSelectedTheme] = useState('indigo')
  const [darkMode, setDarkMode] = useState(false)
  const [compactMode, setCompactMode] = useState(false)
  
  // Privacy settings
  const [profileVisibility, setProfileVisibility] = useState('friends')
  const [activityStatus, setActivityStatus] = useState(true)
  const [dataSharing, setDataSharing] = useState(false)

  const loadUserSettings = useCallback(async (userData: any) => {
    try {
      setLoading(true)
      
      // Set basic user info
      setDisplayName(userData.displayName || userData.email?.split('@')[0] || '')
      setEmail(userData.email || '')
      
      // Load user preferences from database
      const preferences = await blink.db.user_preferences.list({
        where: { userId: userData.id }
      })
      
      if (preferences && preferences.length > 0) {
        const prefs = preferences[0]
        setBio(prefs.bio || '')
        setLocation(prefs.location || '')
        setPhone(prefs.phone || '')
        setEmailNotifications(prefs.emailNotifications !== false)
        setPushNotifications(prefs.pushNotifications !== false)
        setTaskReminders(prefs.taskReminders !== false)
        setFamilyUpdates(prefs.familyUpdates !== false)
        setWeeklyDigest(prefs.weeklyDigest === true)
        setSelectedTheme(prefs.theme || 'indigo')
        setDarkMode(prefs.darkMode === true)
        setCompactMode(prefs.compactMode === true)
        setProfileVisibility(prefs.profileVisibility || 'friends')
        setActivityStatus(prefs.activityStatus !== false)
        setDataSharing(prefs.dataSharing === true)
      }
    } catch (error) {
      console.error('Failed to load user settings:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const applyTheme = (theme: string) => {
    const themeConfig = THEME_COLORS.find(t => t.value === theme)
    if (themeConfig) {
      const root = document.documentElement
      root.style.setProperty('--primary', themeConfig.primary)
      root.style.setProperty('--accent', themeConfig.accent)
      
      // Store theme in localStorage for persistence
      localStorage.setItem('sharedspace-theme', theme)
    }
  }

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      if (state.user) {
        loadUserSettings(state.user)
      } else {
        setLoading(false)
      }
    })
    return unsubscribe
  }, [loadUserSettings])

  const handleSaveSettings = async () => {
    if (!user) return

    try {
      setSaving(true)
      
      // Update user profile
      await blink.auth.updateMe({
        displayName: displayName.trim()
      })

      // Save user preferences
      const preferences = {
        userId: user.id,
        bio: bio.trim(),
        location: location.trim(),
        phone: phone.trim(),
        emailNotifications,
        pushNotifications,
        taskReminders,
        familyUpdates,
        weeklyDigest,
        theme: selectedTheme,
        darkMode,
        compactMode,
        profileVisibility,
        activityStatus,
        dataSharing,
        updatedAt: new Date().toISOString()
      }

      // Check if preferences exist
      const existingPrefs = await blink.db.user_preferences.list({
        where: { userId: user.id }
      })

      if (existingPrefs && existingPrefs.length > 0) {
        await blink.db.user_preferences.update(existingPrefs[0].id, preferences)
      } else {
        await blink.db.user_preferences.create({
          ...preferences,
          createdAt: new Date().toISOString()
        })
      }

      // Apply theme changes
      applyTheme(selectedTheme)

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)

    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    blink.auth.logout()
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <SettingsIllustration />
        <h3 className="text-lg font-semibold mt-4 mb-2">Settings</h3>
        <p className="text-muted-foreground text-center mb-4">
          Sign in to access your account settings
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
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account and preferences
            </p>
          </div>
          <Button 
            onClick={handleSaveSettings}
            disabled={saving}
            className="shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {saving ? (
              <>
                <LoadingSpinner size={16} />
                <span className="ml-2">Saving...</span>
              </>
            ) : saveSuccess ? (
              <>
                <SuccessCheckmark size={16} />
                <span className="ml-2">Saved!</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        {/* User Profile Card */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`} />
                  <AvatarFallback className="text-lg font-semibold">
                    {getInitials(displayName || user.email)}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  size="sm" 
                  className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full p-0"
                >
                  <Camera className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{displayName || 'User'}</h3>
                <p className="text-muted-foreground">{user.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="secondary">
                    <Crown className="h-3 w-3 mr-1" />
                    Free Plan
                  </Badge>
                  <Badge variant="outline">
                    Member since {new Date().getFullYear()}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner size={32} />
          <p className="text-muted-foreground mt-4">Loading settings...</p>
        </div>
      ) : (
        <div className="flex-1 px-4 pb-20">
          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile" className="text-xs">
                <User className="h-4 w-4 mr-1" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications" className="text-xs">
                <Bell className="h-4 w-4 mr-1" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="appearance" className="text-xs">
                <Palette className="h-4 w-4 mr-1" />
                Theme
              </TabsTrigger>
              <TabsTrigger value="privacy" className="text-xs">
                <Shield className="h-4 w-4 mr-1" />
                Privacy
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your display name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        value={email}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="City, Country"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                      </div>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Bell className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Push Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive push notifications</p>
                      </div>
                    </div>
                    <Switch
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Task Reminders</p>
                        <p className="text-sm text-muted-foreground">Get reminded about upcoming tasks</p>
                      </div>
                    </div>
                    <Switch
                      checked={taskReminders}
                      onCheckedChange={setTaskReminders}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Family Updates</p>
                        <p className="text-sm text-muted-foreground">Notifications about family activities</p>
                      </div>
                    </div>
                    <Switch
                      checked={familyUpdates}
                      onCheckedChange={setFamilyUpdates}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Weekly Digest</p>
                        <p className="text-sm text-muted-foreground">Weekly summary of your activities</p>
                      </div>
                    </div>
                    <Switch
                      checked={weeklyDigest}
                      onCheckedChange={setWeeklyDigest}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Theme Customization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-base font-medium">Color Theme</Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      Choose your preferred color scheme
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {THEME_COLORS.map((theme) => (
                        <button
                          key={theme.value}
                          onClick={() => setSelectedTheme(theme.value)}
                          className={`
                            relative p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105
                            ${selectedTheme === theme.value ? 'border-primary shadow-lg' : 'border-muted'}
                          `}
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: theme.primary }}
                            />
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: theme.accent }}
                            />
                          </div>
                          <p className="text-sm font-medium">{theme.name}</p>
                          {selectedTheme === theme.value && (
                            <div className="absolute top-1 right-1">
                              <SuccessCheckmark size={16} />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Dark Mode</p>
                      <p className="text-sm text-muted-foreground">Use dark theme</p>
                    </div>
                    <Switch
                      checked={darkMode}
                      onCheckedChange={setDarkMode}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Compact Mode</p>
                      <p className="text-sm text-muted-foreground">Reduce spacing and padding</p>
                    </div>
                    <Switch
                      checked={compactMode}
                      onCheckedChange={setCompactMode}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy & Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="profileVisibility">Profile Visibility</Label>
                    <Select value={profileVisibility} onValueChange={setProfileVisibility}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="friends">Friends Only</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Activity Status</p>
                      <p className="text-sm text-muted-foreground">Show when you're online</p>
                    </div>
                    <Switch
                      checked={activityStatus}
                      onCheckedChange={setActivityStatus}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Data Sharing</p>
                      <p className="text-sm text-muted-foreground">Share usage data for improvements</p>
                    </div>
                    <Switch
                      checked={dataSharing}
                      onCheckedChange={setDataSharing}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Billing & Subscription
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="w-full justify-start"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Subscription Upgrade Banner */}
          <Card className="mt-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Zap className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">Upgrade to Pro</h3>
                    <p className="text-sm text-muted-foreground">
                      Unlock advanced features and unlimited family spaces
                    </p>
                  </div>
                </div>
                <Button>
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}