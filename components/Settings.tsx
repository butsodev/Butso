'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Bell, Lock, Globe, LogOut, User, Edit2, Shield } from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '@/lib/store'

export function Settings() {
  const { currentUser, setCurrentPage, setCurrentUser, darkMode, toggleDarkMode } = useAppStore()
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(currentUser?.name || '')
  const [editedBio, setEditedBio] = useState(currentUser?.bio || '')

  const handleSaveProfile = () => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        name: editedName,
        bio: editedBio,
      })
      setIsEditing(false)
    }
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setCurrentPage('splash')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background text-foreground pb-20"
    >
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background border-b border-border">
        <div className="flex items-center gap-3 px-4 py-4 sm:px-6">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="p-2 hover:bg-secondary rounded-lg transition"
          >
            <ArrowLeft size={24} className="text-foreground" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </div>
      </div>

      {/* Profile Section */}
      {!isEditing ? (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="p-4 sm:p-6"
        >
          <div className="bg-card rounded-xl p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">{currentUser?.name}</h2>
                <p className="text-muted-foreground text-sm">{currentUser?.phone}</p>
                {currentUser?.bio && (
                  <p className="text-foreground text-sm mt-2">{currentUser.bio}</p>
                )}
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 bg-primary text-white rounded-lg hover:opacity-90 transition"
              >
                <Edit2 size={20} />
              </button>
            </div>
            {currentUser?.role === 'worker' && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Rating</p>
                <p className="text-lg font-bold text-primary">
                  ★ {currentUser.rating || 5.0}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="p-4 sm:p-6"
        >
          <div className="bg-card rounded-xl p-6 mb-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Edit Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Bio
                </label>
                <textarea
                  value={editedBio}
                  onChange={(e) => setEditedBio(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 bg-primary text-white py-2 rounded-lg hover:opacity-90 transition font-medium"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setEditedName(currentUser?.name || '')
                    setEditedBio(currentUser?.bio || '')
                  }}
                  className="flex-1 bg-secondary text-foreground py-2 rounded-lg hover:opacity-90 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Settings Options */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="px-4 sm:px-6"
      >
        <h3 className="text-sm font-bold text-muted-foreground uppercase mb-3">
          Preferences
        </h3>
        <div className="space-y-2">
          {/* Theme Toggle */}
          <div className="bg-card rounded-lg p-4 flex items-center justify-between hover:bg-opacity-80 transition">
            <div className="flex items-center gap-3">
              {darkMode ? <Bell size={20} /> : <Globe size={20} />}
              <div>
                <p className="font-medium text-foreground">Dark Mode</p>
                <p className="text-xs text-muted-foreground">
                  {darkMode ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`w-12 h-6 rounded-full transition ${
                darkMode ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Notifications */}
          <div className="bg-card rounded-lg p-4 flex items-center justify-between hover:bg-opacity-80 transition cursor-pointer">
            <div className="flex items-center gap-3">
              <Bell size={20} />
              <div>
                <p className="font-medium text-foreground">Notifications</p>
                <p className="text-xs text-muted-foreground">Email & push alerts</p>
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-card rounded-lg p-4 flex items-center justify-between hover:bg-opacity-80 transition cursor-pointer">
            <div className="flex items-center gap-3">
              <Shield size={20} />
              <div>
                <p className="font-medium text-foreground">Privacy & Security</p>
                <p className="text-xs text-muted-foreground">Manage permissions</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="px-4 sm:px-6 mt-8"
      >
        <h3 className="text-sm font-bold text-muted-foreground uppercase mb-3">
          Danger Zone
        </h3>
        <button
          onClick={handleLogout}
          className="w-full bg-card hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg p-4 flex items-center gap-3 transition"
        >
          <LogOut size={20} />
          <span className="font-medium">Log Out</span>
        </button>
      </motion.div>
    </motion.div>
  )
}
