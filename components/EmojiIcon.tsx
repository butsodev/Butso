'use client'

import {
  Store, Wrench, Sparkles, Zap, Car, MessageCircle, ClipboardList, Search, Construction, ChefHat,
  CheckCircle2, Paintbrush, Bot, Wallet, Leaf, Scissors, Shirt, Camera, HardHat, Smartphone, Award,
  UserRound, Hammer, Package, Flower2, Hand, Target, Lock, Calendar, ThumbsUp, ThumbsDown, Users,
  Briefcase, GraduationCap, Headphones, Handshake, Moon, Bell, KeyRound, Lightbulb, CircleHelp, Mail,
  MailCheck, Rocket, Settings, BrickWall, Laptop, Palette, CircleDot, CreditCard, Image as ImageIcon,
  RefreshCw, Globe, TriangleAlert, Pencil, HeartHandshake, BookOpen, Pin, User, Inbox, House, Plug,
  UtensilsCrossed, Eye, Sun, Building2, type LucideIcon,
} from 'lucide-react'

// Emoji keys stay in data files; this maps each one to a clean line icon.
const MAP: Record<string, LucideIcon> = {
  '🏪': Store, '🛠️': Wrench, '🔧': Wrench, '🧹': Sparkles, '⚡': Zap, '🚗': Car, '💬': MessageCircle,
  '📋': ClipboardList, '🔍': Search, '🏗️': Construction, '🚧': Construction, '🍳': ChefHat,
  '✅': CheckCircle2, '🎨': Paintbrush, '🤖': Bot, '💰': Wallet, '🌿': Leaf, '✂️': Scissors,
  '💇': Scissors, '🧵': Scissors, '👗': Shirt, '👕': Shirt, '👔': Briefcase, '📸': Camera,
  '👷': HardHat, '📱': Smartphone, '⭐': Award, 'rating': Award, '🌟': Sparkles, '✨': Sparkles, '👩‍💼': UserRound,
  '👨‍💼': UserRound, '🧑': UserRound, '👨': UserRound, '👩': UserRound, '👤': User,
  '🪚': Hammer, '🪵': Hammer, '🧱': BrickWall, '📦': Package, '💆': Flower2, '👋': Hand,
  '🎯': Target, '🔒': Lock, '📅': Calendar, '👍': ThumbsUp, '👎': ThumbsDown, '👥': Users,
  '🧑‍🤝‍🧑': Users, '🧑‍🏫': GraduationCap, '🎧': Headphones, '🤝': Handshake, '🌙': Moon, '🔔': Bell,
  '🔐': KeyRound, '💡': Lightbulb, '❓': CircleHelp, '✉️': Mail, '📬': MailCheck, '📭': Inbox,
  '🚀': Rocket, '🧑‍🔧': Wrench, '👨‍🔧': Wrench, '👩‍🔧': Wrench, '⚙️': Settings, '👨‍💻': Laptop,
  '👩‍🎨': Palette, '🟢': CircleDot, '💳': CreditCard, '🖼️': ImageIcon, '🔄': RefreshCw, '🌍': Globe,
  '🚨': TriangleAlert, '✏️‍': Pencil, '🙏': HeartHandshake, '📖': BookOpen, '📌': Pin, '🏠': House,
  '🔌': Plug, '🍽️': UtensilsCrossed, '👀': Eye, '☀️': Sun, '🏙️': Building2, '🎉': Sparkles,
}

export function EmojiIcon({ e, size = 20, className = '' }: { e: string; size?: number; className?: string }) {
  const Icon = MAP[e] ?? MAP[e.replace(/\uFE0F/g, '')]
  if (!Icon) return null
  return <Icon size={size} strokeWidth={1.9} className={className} aria-hidden />
}