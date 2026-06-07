'use client'

import { motion } from 'framer-motion'
import { Plus, Briefcase, Users, Clock } from 'lucide-react'
import { useAppStore } from '@/lib/store'

export function EmployerDashboard() {
  const { currentUser, setCurrentPage, jobs } = useAppStore()

  const employerJobs = jobs.filter((job) => job.employerId === currentUser?.id)
  const stats = [
    {
      icon: Briefcase,
      label: 'Active Jobs',
      value: employerJobs.filter((j) => j.status === 'open').length,
      color: 'text-primary',
    },
    {
      icon: Users,
      label: 'Total Applicants',
      value: employerJobs.reduce((sum, job) => sum + job.applicants.length, 0),
      color: 'text-accent',
    },
    {
      icon: Clock,
      label: 'In Progress',
      value: employerJobs.filter((j) => j.status === 'in-progress').length,
      color: 'text-blue-500',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background pb-20"
    >
      {/* Header Section */}
      <div className="bg-gradient-to-r from-accent to-accent/80 text-white p-6 pt-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-3xl font-bold mb-1">Welcome, {currentUser?.name}</h1>
          <p className="text-white/80">Manage your jobs and find the perfect workers</p>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 -mt-6 pb-8">
        {/* Stats Cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="bg-white border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-foreground mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <Icon className={`${stat.color} opacity-70`} size={24} />
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Post Job Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg border border-border shadow-sm p-6 mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">Post a New Job</h2>
              <p className="text-muted-foreground">Find the right workers for your project</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage('post-job')}
              className="p-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
            >
              <Plus size={24} />
            </motion.button>
          </div>
        </motion.div>

        {/* Active Jobs */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg border border-border shadow-sm p-6"
        >
          <h2 className="text-xl font-bold text-foreground mb-4">Your Active Jobs</h2>
          {employerJobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No jobs posted yet. Create your first job to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {employerJobs.map((job) => (
                <motion.div
                  key={job.id}
                  whileHover={{ x: 5 }}
                  className="p-4 border border-border rounded-lg hover:bg-secondary/50 transition cursor-pointer"
                  onClick={() => setCurrentPage('job-details')}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{job.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{job.description}</p>
                      <div className="flex gap-4 mt-3 text-sm">
                        <span className="text-primary font-semibold">₦{job.budget}</span>
                        <span className="text-muted-foreground">{job.applicants.length} applicants</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      job.status === 'open' 
                        ? 'bg-green-100 text-green-700'
                        : job.status === 'in-progress'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
