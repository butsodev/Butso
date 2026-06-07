'use client'

import { motion } from 'framer-motion'
import { Send, Phone, Video, Info, Search, ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '@/lib/store'

export function Messaging() {
  const { setCurrentPage, currentUser } = useAppStore()
  const [selectedConversation, setSelectedConversation] = useState<string | null>('conv1')
  const [messageInput, setMessageInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Sample conversations
  const conversations = [
    {
      id: 'conv1',
      name: 'Chukwu Okonkwo',
      avatar: '👷',
      lastMessage: 'Can you start on Monday?',
      timestamp: '2 hours ago',
      unread: 2,
      isOnline: true,
      job: 'Bathroom Renovation',
    },
    {
      id: 'conv2',
      name: 'Amara Adebayo',
      avatar: '👩‍🔧',
      lastMessage: 'I can do that!',
      timestamp: '4 hours ago',
      unread: 0,
      isOnline: true,
      job: 'Electrical Work',
    },
    {
      id: 'conv3',
      name: 'Tunde Oluwaseun',
      avatar: '👨‍💼',
      lastMessage: 'What time works best for you?',
      timestamp: '1 day ago',
      unread: 0,
      isOnline: false,
      job: 'Plumbing Repair',
    },
    {
      id: 'conv4',
      name: 'Blessing Ezeoke',
      avatar: '👩‍💼',
      lastMessage: 'Thank you for the opportunity',
      timestamp: '2 days ago',
      unread: 0,
      isOnline: false,
      job: 'House Cleaning',
    },
  ]

  // Sample messages
  const messages = {
    conv1: [
      { id: '1', sender: 'other', text: 'Hi! I saw your bathroom renovation job posting.', time: '10:30' },
      { id: '2', sender: 'other', text: 'I have 5+ years of experience with similar projects.', time: '10:31' },
      { id: '3', sender: 'me', text: 'Great! When can you start?', time: '10:45' },
      { id: '4', sender: 'other', text: 'Can you start on Monday?', time: '11:00' },
      { id: '5', sender: 'me', text: 'Monday works perfectly. What time?', time: 'now' },
    ],
    conv2: [
      { id: '1', sender: 'me', text: 'Hello! Interested in the electrical work?', time: '9:00' },
      { id: '2', sender: 'other', text: 'Yes! I have the certifications and experience.', time: '9:15' },
      { id: '3', sender: 'me', text: 'Can you do residential work?', time: '9:20' },
      { id: '4', sender: 'other', text: 'I can do that!', time: '9:30' },
    ],
    conv3: [
      { id: '1', sender: 'other', text: 'Hi, I saw your plumbing job', time: 'yesterday' },
      { id: '2', sender: 'me', text: 'When are you available?', time: 'yesterday' },
      { id: '3', sender: 'other', text: 'What time works best for you?', time: 'today' },
    ],
    conv4: [
      { id: '1', sender: 'me', text: 'Thanks for applying!', time: '2 days ago' },
      { id: '2', sender: 'other', text: 'Thank you for the opportunity', time: '2 days ago' },
    ],
  }

  const selectedConv = conversations.find(c => c.id === selectedConversation)
  const convMessages = selectedConversation && messages[selectedConversation as keyof typeof messages] ? 
    messages[selectedConversation as keyof typeof messages] : []

  const filteredConversations = conversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.job.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // In a real app, would add to messages
      console.log('Sending:', messageInput)
      setMessageInput('')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 bg-background flex overflow-hidden"
    >
      <div className="flex w-full h-screen">
        {/* Conversations List */}
        <div className={`w-full md:w-96 border-r border-border flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
          {/* Header */}
          <div className="border-b border-border p-4 bg-white">
            <div className="flex items-center gap-4 mb-4">
              <motion.button
                whileHover={{ x: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage('dashboard')}
                className="flex items-center gap-2 text-primary hover:text-primary/80 transition font-semibold md:hidden"
              >
                <ArrowLeft size={20} />
                Back
              </motion.button>
              <h1 className="text-2xl font-bold text-foreground">Messages</h1>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 text-muted-foreground" size={16} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conv, index) => (
              <motion.button
                key={conv.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedConversation(conv.id)}
                className={`w-full p-4 border-b border-border hover:bg-secondary/50 transition text-left ${
                  selectedConversation === conv.id ? 'bg-primary/5' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="text-3xl">{conv.avatar}</div>
                    {conv.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-foreground truncate">{conv.name}</h3>
                      <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">{conv.timestamp}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mb-1">{conv.job}</p>
                    <p className="text-sm text-foreground truncate">{conv.lastMessage}</p>
                  </div>
                  {conv.unread > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex-shrink-0 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center"
                    >
                      {conv.unread}
                    </motion.div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        {selectedConv && (
          <div className="flex-1 flex flex-col bg-white hidden md:flex">
            {/* Chat Header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="border-b border-border p-4 flex items-center justify-between bg-white"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="text-3xl">{selectedConv.avatar}</div>
                  {selectedConv.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <h2 className="font-bold text-foreground">{selectedConv.name}</h2>
                  <p className="text-xs text-muted-foreground">{selectedConv.job}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 hover:bg-secondary rounded-lg transition"
                >
                  <Phone className="text-primary" size={20} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 hover:bg-secondary rounded-lg transition"
                >
                  <Video className="text-primary" size={20} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 hover:bg-secondary rounded-lg transition"
                >
                  <Info className="text-primary" size={20} />
                </motion.button>
              </div>
            </motion.div>

            {/* Messages */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {convMessages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.sender === 'me'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-foreground'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-xs mt-1 ${
                      msg.sender === 'me' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                      {msg.time}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Message Input */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="border-t border-border p-4 bg-white"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="p-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
                >
                  <Send size={20} />
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Empty State on Mobile */}
        {!selectedConversation && (
          <div className="flex-1 hidden md:flex items-center justify-center text-center">
            <p className="text-muted-foreground">Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
