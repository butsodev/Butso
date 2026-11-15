// Frequently asked questions for Help & Support. Kept here (not in the screen) so search
// can look through them alongside the how-to guides. Keep answers short and true today.

export interface Faq {
  id: string
  question: string
  answer: string
  /** Extra words people might search with. */
  keywords?: string[]
}

export const FAQS: Faq[] = [
  {
    id: 'post-job',
    question: 'How do I post a job?',
    answer: 'From your dashboard, tap Post Job. Add a title, a description, the category and your budget. Location and a deadline are optional. Then publish it, and workers can apply.',
    keywords: ['hire', 'employer', 'create job'],
  },
  {
    id: 'apply-job',
    question: 'How do I apply for a job?',
    answer: 'Open Jobs and tap a job to read the details, then tap Apply. Say when you can start, and add a short message and your expected daily rate if you want to. Each job takes at most 30 applicants, so apply early.',
    keywords: ['work', 'application', 'worker'],
  },
  {
    id: 'in-app-payments',
    question: 'Are in-app payments available?',
    answer: 'Not yet. Secure in-app payments are coming soon. For now, agree the price with the other person and pay them directly. Only pay once you are happy with the work.',
    keywords: ['money', 'naira', 'transfer', 'pay'],
  },
  {
    id: 'book-service',
    question: 'How do I book a service?',
    answer: 'Open a shop, pick a service, then choose a date and time. The shop owner accepts or declines your booking, and you both see the update in Bookings. You agree the price and pay each other directly for now.',
    keywords: ['appointment', 'salon', 'barber'],
  },
  {
    id: 'forgot-password',
    question: 'I forgot my password. What do I do?',
    answer: 'On the Log in screen, tap Continue with Email, then Forgot password? Enter your email and we send you a link. Open it on the same phone and choose a new password. Signed up with Google? Just tap Log in with Google instead: there is no password to reset.',
    keywords: ['reset', 'cannot log in', 'locked out', 'change password'],
  },
  {
    id: 'verified',
    question: 'How do I get verified on Butsó?',
    answer: 'Verification badges are not available yet. For now, a complete profile and good reviews after finished jobs are the best way to build trust. We will announce verification before it starts.',
    keywords: ['badge', 'trust', 'id'],
  },
  {
    id: 'dispute',
    question: 'What if there is a dispute between employer and worker?',
    answer: 'Talk to the other person first in Messages. If that does not work, use the Still need help? form at the bottom of Help & Support and describe what happened. A formal dispute process is not available yet.',
    keywords: ['problem', 'complaint', 'argument', 'refund'],
  },
  {
    id: 'who',
    question: 'Who can use Butsó?',
    answer: 'Butsó is for people aged 18 and over. We ask for your date of birth when you sign up, and it stays private. Junior accounts approved by a parent or legal guardian are planned, but they are not available yet.',
    keywords: ['age', 'children', 'minor', '18'],
  },
  {
    id: 'safety',
    question: 'How do I stay safe?',
    answer: 'Meet in a public place the first time, tell someone you trust where you are going, and never pay anyone to apply for or get a job. Agree the price before work starts and pay only when you are happy with the work. If someone makes you uncomfortable, open the chat menu and tap Block or Report.',
    keywords: ['scam', 'fraud', 'danger', 'security'],
  },
  {
    id: 'delete-data',
    question: 'Can I delete my account or get a copy of my data?',
    answer: 'Yes. In Settings, tap Download my data for a copy, or Delete my account to ask us to delete it. We process deletion requests within 30 days.',
    keywords: ['remove', 'close account', 'export', 'privacy'],
  },
  {
    id: 'fees',
    question: 'Does Butsó charge fees?',
    answer: 'Butsó is free to join, free to post and free to apply while we grow. When secure in-app payments launch, we may take a small cut from the person who earns, never from the person hiring, and only on payments made through the app. We will give you at least 30 days\' notice before any fee starts.',
    keywords: ['cost', 'free', 'price', 'commission', 'charge'],
  },
  {
    id: 'payments-how',
    question: 'How are payments processed?',
    answer: 'Right now you agree the price in chat or on the booking and pay each other directly. In-app payments are on the way, and we will tell you before anything changes.',
    keywords: ['money', 'transfer', 'cash'],
  },
  {
    id: 'info-safe',
    question: 'Is my personal information safe?',
    answer: 'Your phone number and real name stay hidden from other people until you accept a request or a booking. You can block or report anyone from Messages. We do not share your details without a reason you can see in the app.',
    keywords: ['privacy', 'phone number', 'name', 'hidden'],
  },
]
