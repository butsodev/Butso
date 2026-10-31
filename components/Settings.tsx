'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Bell, Lock, Globe, LogOut, User, Edit2, Shield, Download, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { WUKARI_AREAS } from '@/lib/areas'
import { useAppStore, goBackTo } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import { signOutUser } from '@/lib/auth'
import { showToast } from '@/lib/toast'
import { confirmAction } from '@/lib/confirm'

export function Settings() {
  const { currentUser, setCurrentPage, setCurrentUser, darkMode, toggleDarkMode } = useAppStore()
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(currentUser?.name || '')
  const [editedBio, setEditedBio] = useState(currentUser?.bio || '')
  const [editedArea, setEditedArea] = useState(currentUser?.location || '')

  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)

  // Your data: download a copy of everything we hold about you
  const handleExport = async () => {
    if (exporting) return
    setExporting(true)
    const { data, error } = await supabase.rpc('export_my_data')
    setExporting(false)
    if (error || !data) { showToast('error', error?.message ?? 'Could not prepare your data.'); return }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `butso-my-data-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    showToast('success', 'Your data was downloaded.')
  }

  // Ask us to delete the account. We process requests by hand within 30 days.
  const handleDeleteRequest = async () => {
    if (!currentUser) return
    const ok = await confirmAction({
      title: 'Delete your account?',
      message: 'We will delete your account and personal data within 30 days. Some records may be kept where the law or safety needs it. You will not be able to undo this.',
      confirmLabel: 'Request deletion',
      danger: true,
    })
    if (!ok) return
    const { error } = await supabase.from('deletion_requests').insert({ user_id: currentUser.id })
    if (error && error.code !== '23505') { showToast('error', error.message); return }
    showToast('success', error ? 'You already asked us to delete this account.' : 'Deletion requested. We will process it within 30 days.')
  }

  const handleSaveProfile = async () => {
    if (!currentUser || saving) return
    const name = editedName.trim()
    if (name.length < 2) { showToast('error', 'Please enter your name.'); return }
    setSaving(true)
    const bio = editedBio.trim()
    const { error } = await supabase
      .from('profiles')
      .update({ name, bio: bio || null, location: editedArea || null })
      .eq('id', currentUser.id)
    setSaving(false)
    if (error) { showToast('error', 'Could not save your changes. Please try again.'); return }
    setCurrentUser({ ...currentUser, name, bio: bio || undefined, location: editedArea || undefined })
    setIsEditing(false)
    showToast('success', 'Profile updated')
  }

  const handleLogout = () => { void signOutUser() }

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
          <button aria-label="Go back"
            onClick={() => goBackTo('dashboard')}
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
              <button aria-label="Edit profile"
                onClick={() => setIsEditing(true)}
                className="p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
              >
                <Edit2 size={20} />
              </button>
            </div>
            {currentUser?.role === 'worker' && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Rating</p>
                <p className="text-lg font-bold text-primary">
                  {Number(currentUser.rating || 5).toFixed(1)} / 5
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
                <input aria-label="Name"
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
                <textarea aria-label="Bio"
                  value={editedBio}
                  onChange={(e) => setEditedBio(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Your Area</label>
                <select aria-label="Your area"
                  value={editedArea}
                  onChange={e => setEditedArea(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select your area…</option>
                  {WUKARI_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg hover:opacity-90 transition font-medium disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save'}
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
            <button role="switch" aria-checked={darkMode} aria-label="Dark mode"
              onClick={toggleDarkMode}
              className={`w-12 h-6 rounded-full transition ${darkMode ? 'bg-primary' : 'bg-muted'
                }`}
            >
              <div
                className={`w-5 h-5 bg-card rounded-full transition transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'
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
          Your data
        </h3>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="w-full bg-card hover:bg-secondary text-foreground rounded-lg p-4 flex items-center gap-3 transition mb-3 disabled:opacity-60"
        >
          <Download size={20} />
          <span className="font-medium">{exporting ? 'Preparing...' : 'Download my data'}</span>
        </button>
        <h3 className="text-sm font-bold text-muted-foreground uppercase mb-3 mt-6">
          Danger Zone
        </h3>
        <button
          onClick={handleLogout}
          className="w-full bg-card hover:bg-destructive/10 dark:hover:bg-destructive/10 text-destructive rounded-lg p-4 flex items-center gap-3 transition"
        >
          <LogOut size={20} />
          <span className="font-medium">Log Out</span>
        </button>
        <button
          onClick={handleDeleteRequest}
          className="w-full mt-3 bg-card hover:bg-destructive/10 dark:hover:bg-destructive/10 text-destructive rounded-lg p-4 flex items-center gap-3 transition"
        >
          <Trash2 size={20} />
          <span className="font-medium">Delete my account</span>
        </button>
      </motion.div>
    </motion.div>
  )
}