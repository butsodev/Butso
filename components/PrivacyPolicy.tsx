'use client'

import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { goBackTo } from '@/lib/store'
import { LEGAL_VERSION } from '@/lib/legal'

// DRAFT: have a Nigerian lawyer review this before relying on it.
// When the text changes in a way that matters, bump LEGAL_VERSION in lib/legal.ts.
const SECTIONS: [string, string[]][] = [
  [
    "1. Who we are",
    [
      "Butsó runs the Butsó app and decides how your personal data is used. Contact us at support@butso.ng about anything in this policy."
    ]
  ],
  [
    "2. What we collect",
    [
      "Account details: your email address, or the details from Google if you sign in with Google.",
      "Profile details: your name, username, area, skills, bio, gender if you give it, and your phone number if you add one. Your phone number is not checked by us yet.",
      "Your date of birth and the version of the Terms you agreed to. These are kept private and used only to confirm you are 18 or over.",
      "What you create: jobs, applications, bookings, messages, message and contact requests, reviews, shop details, and photos you upload.",
      "Safety records: blocks and reports.",
      "Support messages and feedback you send us, and basic usage data about how the app is used."
    ]
  ],
  [
    "3. Why we use it",
    [
      "To run the service you asked for: your account, jobs, bookings, messages and reviews.",
      "To keep people safe and prevent fraud and abuse, and to meet legal duties.",
      "To confirm your age and record that you agreed to the Terms.",
      "To understand how the app is used, and to fix and improve it."
    ]
  ],
  [
    "4. Who can see what",
    [
      "Strangers see your username, skills, rating, reviews, area and a generic picture. Your real name and phone number stay hidden until you accept a message request or contact request, hire someone, or accept a booking.",
      "Shop pages are public: shop name, photos, services, prices, hours and reviews. A shop's phone number is hidden unless the owner chooses to show it. Your date of birth is never shown to anyone."
    ]
  ],
  [
    "5. Who we share data with",
    [
      "We do not sell your data. We use trusted services to run Butsó: Supabase (database and login), Vercel (hosting and basic analytics), Cloudinary (photo storage), and Google (only if you sign in with Google). They handle data only to provide their service to us.",
      "We may share data if the law requires it, or to protect someone's safety."
    ]
  ],
  [
    "6. Data sent outside Nigeria",
    [
      "Some of these services store data outside Nigeria. We choose providers with suitable security and contract terms, and we only send what is needed to run the service."
    ]
  ],
  [
    "7. How long we keep it",
    [
      "We keep your data while your account is active. If you ask us to delete your account, we delete or anonymise your personal data within 30 days. We may keep limited records for longer where the law, safety or a dispute needs it, for example reports and blocks."
    ]
  ],
  [
    "8. Your rights",
    [
      "You can ask to see your data, correct it, delete it, or object to how we use it, and you can take back a consent you gave.",
      "In Settings you can download a copy of your data, edit your profile, and request account deletion. For anything else, contact us. You can also complain to the Nigeria Data Protection Commission."
    ]
  ],
  [
    "9. Children",
    [
      "Butsó is for people 18 and over. We do not knowingly collect data from anyone under 18. If we find that we have, we will delete it. A parent or guardian who thinks a child has an account can contact us."
    ]
  ],
  [
    "10. Security",
    [
      "We use reasonable technical and organisational measures to protect your data, but no system is completely secure. If a breach puts your rights at risk, we will report it to the regulator and tell you as the law requires."
    ]
  ],
  [
    "11. Cookies and similar storage",
    [
      "We use storage in your browser that the app needs to work: keeping you logged in, your preferences, and remembering the page you were on so you can return to it after signing in. We use simple, privacy-friendly analytics to see how the app is used."
    ]
  ],
  [
    "12. Changes to this policy",
    [
      "We may update this policy. If a change matters, we will tell you in the app before it takes effect."
    ]
  ],
  [
    "13. Contact",
    [
      "Questions or requests: support@butso.ng."
    ]
  ]
]

export function PrivacyPolicy() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      <header className="bg-background border-b border-border py-4 px-4 sm:px-6 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button aria-label="Go back"
            onClick={() => goBackTo('splash')}
            className="p-2 hover:bg-secondary rounded-lg transition"
          >
            <ArrowLeft size={24} className="text-foreground" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Privacy Policy</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-none"
        >
          <h2 className="text-2xl font-bold text-foreground mb-2">Privacy Policy for Butsó</h2>
          <p className="text-muted-foreground mb-8">Version {LEGAL_VERSION}</p>

          {SECTIONS.map(([title, body]) => (
            <section key={title} className="mb-8">
              <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
              <div className="space-y-3">
                {body.map((p, i) => (
                  <p key={i} className="text-muted-foreground leading-relaxed">{p}</p>
                ))}
              </div>
            </section>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}
