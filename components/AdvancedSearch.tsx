'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Search, Filter, X } from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '@/lib/store'

const categories = [
  'Carpentry',
  'Plumbing',
  'Electrical',
  'Painting',
  'Welding',
  'House Cleaning',
  'Landscaping',
  'Repairs',
]

const budgetRanges = [
  { label: '₦0 - ₦5,000', min: 0, max: 5000 },
  { label: '₦5,000 - ₦15,000', min: 5000, max: 15000 },
  { label: '₦15,000 - ₦30,000', min: 15000, max: 30000 },
  { label: '₦30,000 - ₦50,000', min: 30000, max: 50000 },
  { label: '₦50,000+', min: 50000, max: Infinity },
]

export function AdvancedSearch() {
  const { setCurrentPage } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null)
  const [minRating, setMinRating] = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = () => {
    // Navigate to jobs page with filters
    setCurrentPage('jobs')
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedCategory(null)
    setSelectedBudget(null)
    setMinRating(0)
  }

  const activeFilters = [
    searchQuery && `Search: ${searchQuery}`,
    selectedCategory && `Category: ${selectedCategory}`,
    selectedBudget && `Budget: ${selectedBudget}`,
    minRating > 0 && `Rating: ${minRating}★+`,
  ].filter(Boolean)

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
            onClick={() => setCurrentPage('jobs')}
            className="p-2 hover:bg-secondary rounded-lg transition"
          >
            <ArrowLeft size={24} className="text-foreground" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Advanced Search</h1>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Search Bar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search jobs by title, description..."
              className="w-full px-4 py-3 pl-10 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Search size={20} className="absolute left-3 top-3.5 text-muted-foreground" />
          </div>
        </motion.div>

        {/* Filter Toggle */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 }}
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-primary hover:opacity-80 transition mb-4 font-medium"
        >
          <Filter size={20} />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </motion.button>

        {/* Filters Section */}
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-6 mb-6 pb-6 border-b border-border"
          >
            {/* Categories */}
            <div>
              <h3 className="font-bold text-foreground mb-3">Category</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                    className={`p-3 rounded-lg text-left transition ${
                      selectedCategory === cat
                        ? 'bg-primary text-white'
                        : 'bg-card text-foreground hover:bg-opacity-80'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget Range */}
            <div>
              <h3 className="font-bold text-foreground mb-3">Budget Range</h3>
              <div className="space-y-2">
                {budgetRanges.map((range) => (
                  <button
                    key={range.label}
                    onClick={() => setSelectedBudget(selectedBudget === range.label ? null : range.label)}
                    className={`w-full p-3 rounded-lg text-left transition ${
                      selectedBudget === range.label
                        ? 'bg-primary text-white'
                        : 'bg-card text-foreground hover:bg-opacity-80'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Minimum Rating */}
            <div>
              <h3 className="font-bold text-foreground mb-3">
                Minimum Rating: {minRating}★
              </h3>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={minRating}
                onChange={(e) => setMinRating(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>0★</span>
                <span>5★</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="flex flex-wrap gap-2 items-center">
              {activeFilters.map((filter) => (
                <div
                  key={filter}
                  className="bg-primary bg-opacity-20 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {filter}
                </div>
              ))}
              <button
                onClick={handleClearFilters}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                Clear all
              </button>
            </div>
          </motion.div>
        )}

        {/* Search Results Preview */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-card rounded-lg p-6 text-center"
        >
          <p className="text-muted-foreground mb-4">
            {activeFilters.length > 0
              ? `Found ${Math.floor(Math.random() * 20) + 5} jobs matching your filters`
              : 'Set filters and search to find jobs'}
          </p>
          <button
            onClick={handleSearch}
            className="bg-primary text-white px-8 py-3 rounded-lg hover:opacity-90 transition font-medium"
          >
            Search Jobs
          </button>
        </motion.div>
      </div>
    </motion.div>
  )
}
