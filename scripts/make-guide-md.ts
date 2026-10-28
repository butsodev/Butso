// Builds docs/HOW-TO-USE.md from lib/guideContent.ts
// Run: npx tsx scripts/make-guide-md.ts
import { writeFileSync } from 'node:fs'
import { GUIDES } from '../lib/guideContent'

const out = [
  '# How to use Butsó',
  '',
  'Butsó is free to join. These guides cover the main things you can do. The same guides, as step-by-step walkthroughs, are in the app under **Help & Support**.',
  '',
  '> This file is generated from `lib/guideContent.ts`. Edit that file, then run `npx tsx scripts/make-guide-md.ts`.',
  '',
  ...GUIDES.map(g => [
    `## ${g.title}`,
    `*For: ${g.forWho}.* ${g.intro}`,
    '',
    ...g.steps.map((s, i) => `${i + 1}. ${s.text}`),
    '',
  ].join('\n')),
  '## Fees',
  '',
  'Butsó is free to join, free to post and free to apply while we grow. When secure in-app payments launch, we may take a small cut from the person who earns, never from the person hiring, and only on payments made through the app. We will give you at least 30 days’ notice before any fee starts. For now, agree the price directly and pay each other directly. Only pay when you are happy with the work.',
  '',
  '## Need help?',
  '',
  'Open **Help & Support** in the app, or email support@butso.ng.',
  '',
].join('\n')

writeFileSync(new URL('../docs/HOW-TO-USE.md', import.meta.url), out)
console.log('docs/HOW-TO-USE.md written')
