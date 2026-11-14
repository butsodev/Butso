import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) })

const config = [
  { ignores: ['node_modules/**', '.next/**', 'next-env.d.ts', 'scripts/**'] },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // Apostrophes and quotes in JSX text render fine; escaping them only hurts readability.
      'react/no-unescaped-entities': 'off',
      // Kept visible, but not allowed to block a deploy.
      '@typescript-eslint/no-explicit-any': 'warn',
      // Photos come from Cloudinary already shrunk on the phone, and next.config sets
      // images.unoptimized, so next/image would add nothing over a plain <img>.
      '@next/next/no-img-element': 'off',
    },
  },
]

export default config
