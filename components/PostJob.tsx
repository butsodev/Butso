'use client'

import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '@/lib/store'

export function PostJob() {
  const { currentUser, setCurrentPage, addJob } = useAppStore()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Construction',
    budget: '',
    location: 'Wukari',
    deadline: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  const categories = ['Construction', 'Plumbing', 'Electrical', 'Cleaning', 'Repairs', 'Other']

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.budget) {
      alert('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      const newJob = {
        id: Math.random().toString(36).substr(2, 9),
        title: formData.title,
        description: formData.description,
        category: formData.category,
        budget: parseInt(formData.budget),
        location: formData.location,
        employerId: currentUser?.id || '',
        status: 'open' as const,
        applicants: [],
        createdAt: new Date().toISOString(),
        deadline: formData.deadline || undefined,
      }
      
      addJob(newJob)
      setCurrentPage('dashboard')
      setIsLoading(false)
    }, 1000)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background pb-20"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-accent to-accent/80 text-primary-foreground p-6 pt-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-3xl font-bold mb-1">Post a New Job</h1>
          <p className="text-primary-foreground/80">Describe the work you need done</p>
        </motion.div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 -mt-6 pb-8">
        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSubmit}
          className="bg-card rounded-lg border border-border shadow-sm p-8 mt-6 space-y-6"
        >
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Job Title *
            </label>
            <input
              type="text"
              name="title"
              placeholder="e.g., Bathroom Renovation"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Job Description *
            </label>
            <textarea
              name="description"
              placeholder="Describe the work in detail"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground placeholder:text-muted-foreground resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground bg-card"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Budget (₦) *
            </label>
            <input
              type="number"
              name="budget"
              placeholder="Enter budget in Naira"
              value={formData.budget}
              onChange={handleChange}
              min="1000"
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Location
            </label>
            <select
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground bg-card"
            >
              <option>Wukari</option>
              <option>Central Wukari</option>
              <option>North Wukari</option>
              <option>South Wukari</option>
            </select>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Deadline (Optional)
            </label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 px-6 bg-accent text-accent-foreground font-semibold rounded-lg hover:bg-accent/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? 'Publishing...' : 'Publish Job'}
              {!isLoading && <ChevronRight size={20} />}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setCurrentPage('dashboard')}
              className="flex-1 py-3 px-6 border border-border text-foreground font-semibold rounded-lg hover:bg-secondary transition"
            >
              Cancel
            </motion.button>
          </div>
        </motion.form>
      </div>
    </motion.div>
  )
}
