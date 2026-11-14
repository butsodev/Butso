import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/seo'

// Private screens (messages, settings, bookings...) need a login anyway; keeping
// crawlers off them saves crawl budget for the public profile, job and shop pages.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard', '/messages', '/notifications', '/bookings', '/book', '/payments',
        '/settings', '/profile', '/my-shop', '/post-job', '/suggestions', '/setup',
        '/verify-phone', '/reset-password', '/forgot-password', '/jobs/*/applicants', '/jobs/*/apply',
      ],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  }
}
