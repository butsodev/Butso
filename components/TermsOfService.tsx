'use client'

import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { goBackTo } from '@/lib/store'
import { LEGAL_VERSION } from '@/lib/legal'

// DRAFT: have a Nigerian lawyer review this before relying on it.
// When the text changes in a way that matters, bump LEGAL_VERSION in lib/legal.ts.
const SECTIONS: [string, string[]][] = [
  [
    "1. About Butsó and these Terms",
    [
      "Butsó is an online platform that helps people find local work, hire skilled workers, and find and book shops and services. These Terms are an agreement between you and Butsó. By creating an account or using Butsó you agree to them.",
      "Butsó only makes introductions. We are not your employer, your agent, or a party to any job, booking or payment between users."
    ]
  ],
  [
    "2. Who can use Butsó",
    [
      "You must be 18 or over. We ask for your date of birth and your confirmation when you sign up. Junior accounts for younger people, approved by a parent or legal guardian, are planned but not available yet.",
      "Give us true information, keep your login private, and use one account only. If we learn that someone is under 18, we may close the account and delete their data."
    ]
  ],
  [
    "3. What Butsó does not do",
    [
      "We do not check anyone's identity, skills, qualifications, phone number or work quality, and we do not guarantee that any job, booking or payment will go well.",
      "Right now, payments are not made through Butsó. Users agree a price and pay each other directly. Agree the price and what is included before work starts, and only pay when you are happy with the work."
    ]
  ],
  [
    "4. Using Butsó properly",
    [
      "Do not use Butsó for anything illegal, or to scam, harass, threaten or discriminate against anyone. Do not post fake jobs, fake shops or fake reviews, pretend to be someone else, or ask anyone to pay you in order to apply for or get a job.",
      "Do not post jobs for, or hire, anyone under 18. Do not offer or request sexual services, weapons, illegal drugs, or any work that is dangerous or unlawful.",
      "Do not share another person's contact details without their permission, scrape the platform, or try to get around its privacy and safety rules."
    ]
  ],
  [
    "5. Staying safe",
    [
      "When you meet someone from Butsó, meet in a public place the first time where you can, tell someone you trust where you are going, and never pay anyone in advance to get a job. You deal with other users at your own risk. Use Block and Report if someone makes you uncomfortable."
    ]
  ],
  [
    "6. Content you post",
    [
      "You own what you post, including photos, descriptions and reviews. You give Butsó permission to store, display and share it on the platform so the service can work. You promise you have the right to post it, and that anyone who appears in your photos agrees to it.",
      "We can remove content that breaks these Terms or that someone reports. To ask us to take something down, contact support@butso.ng."
    ]
  ],
  [
    "7. Reviews",
    [
      "Reviews can only be left after a completed booking, and must be honest and based on your own experience. We can remove reviews that are fake, abusive or break these Terms."
    ]
  ],
  [
    "8. Your privacy",
    [
      "Our Privacy Policy explains what we collect and why. Other people only see your username until you share more. If someone shares their contact details with you, use them only for the job or booking you agreed."
    ]
  ],
  [
    "9. Suspending or ending accounts",
    [
      "We can warn, suspend or remove an account or content if these Terms are broken or if we need to for safety or the law. You can stop using Butsó at any time. You can ask us to delete your account in Settings."
    ]
  ],
  [
    "10. Fees",
    [
      "Butsó is free to join, post and apply while we grow. When secure in-app payments launch, we may take a small cut from the person who earns, never from the person hiring, and only on payments made through the app. We will give you at least 30 days' notice before any fee starts."
    ]
  ],
  [
    "11. No warranty",
    [
      "Butsó is provided as it is and as available. We do not promise it will always work without interruption or errors."
    ]
  ],
  [
    "12. Limits on our responsibility",
    [
      "To the extent the law allows, Butsó is not responsible for what users do or say, for the quality or safety of any work or service, for losses from agreements or payments between users, or for injury, damage or loss that happens in connection with a job or booking.",
      "Nothing in these Terms limits any responsibility that the law does not allow us to limit."
    ]
  ],
  [
    "13. Changes to these Terms",
    [
      "We may update these Terms. If a change matters, we will tell you in the app before it takes effect. Continuing to use Butsó after that means you accept the new version. We record which version you agreed to."
    ]
  ],
  [
    "14. Law and disputes",
    [
      "These Terms are governed by the laws of the Federal Republic of Nigeria. If there is a problem, please contact us first so we can try to sort it out. If we cannot, the courts of Nigeria can decide it."
    ]
  ],
  [
    "15. Contact",
    [
      "Questions about these Terms: support@butso.ng."
    ]
  ]
]

export function TermsOfService() {
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
          <h1 className="text-2xl font-bold text-foreground">Terms of Service</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-none"
        >
          <h2 className="text-2xl font-bold text-foreground mb-2">Terms of Service for Butsó</h2>
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
