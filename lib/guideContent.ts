// One source for every how-to guide. The in-app guides (Help & Support) and docs/HOW-TO-USE.md
// are both made from this file, so they can never disagree. Keep steps short and plain.
// To regenerate the markdown: npx tsx scripts/make-guide-md.ts

export interface GuideStep {
  text: string
  /** A simple picture of the screen: a title bar, a few rows, and the thing to tap (highlighted). */
  screen: { title: string; rows?: string[]; button?: string }
}

export interface Guide {
  id: string
  title: string
  forWho: string
  intro: string
  steps: GuideStep[]
}

export const GUIDES: Guide[] = [
  {
    id: 'get-started',
    title: 'Join and set up your profile',
    forWho: 'Everyone',
    intro: 'Free to join, for people 18 and over. Takes about three minutes.',
    steps: [
      { text: 'Open Butsó and tap Join. Sign up with your email, or with Google.', screen: { title: 'Join Butsó', rows: ['Email', 'Password'], button: 'Join' } },
      { text: 'Confirm your date of birth and that you are 18 or over, and agree to the Terms and Privacy Policy. Your date of birth stays private.', screen: { title: 'Before we start', rows: ['Date of birth', 'I am 18 or over'], button: 'Continue' } },
      { text: 'Pick what you want to do first: find work or hire people. You can always do both later.', screen: { title: 'What brings you here?', rows: ['Find work', 'Hire people'], button: 'Continue' } },
      { text: 'Pick a username. People see @username, not your real name, until you share your contact details. A phone number is optional, and we do not check it yet.', screen: { title: 'Your profile', rows: ['@yourname', 'Full name', 'Phone (optional)'], button: 'Next' } },
      { text: 'Add your area, your skills and a short bio. Workers with a complete profile who start applying are shown to employers first for 30 days.', screen: { title: 'About you', rows: ['Area', 'Skills', 'Short bio'], button: 'Finish' } },
    ],
  },
  {
    id: 'find-work',
    title: 'Find work and apply',
    forWho: 'Workers',
    intro: 'Apply early. Each job takes at most 30 applicants.',
    steps: [
      { text: 'Tap Jobs. Use the search box to look for a skill or a place, or scroll the list.', screen: { title: 'Jobs', rows: ['Phone screen repair', 'Home cleaning'], button: 'Search' } },
      { text: 'Tap a job to read the details: what is needed, the budget, and where.', screen: { title: 'Job details', rows: ['Budget', 'Location', 'Description'], button: 'Apply' } },
      { text: 'Tap Apply. Add a short note, and the price you expect if you want to.', screen: { title: 'Apply', rows: ['Your note', 'Expected price'], button: 'Send application' } },
      { text: 'The employer is notified and picks from the people who applied. You will get a notification.', screen: { title: 'Notifications', rows: ['You got the job'], button: 'Open' } },
      { text: 'When you are chosen, you and the employer can see each other’s contact details.', screen: { title: 'Contact shared', rows: ['@employer', 'Phone number'], button: 'Message' } },
    ],
  },
  {
    id: 'post-and-hire',
    title: 'Post a job and hire someone',
    forWho: 'Employers',
    intro: 'Free to post. You choose who you hire.',
    steps: [
      { text: 'From your dashboard, tap Post Job.', screen: { title: 'Dashboard', rows: ['Find workers', 'My jobs'], button: 'Post Job' } },
      { text: 'Write a clear title and description. Choose a category, the budget and the location.', screen: { title: 'Post a job', rows: ['Title', 'Description', 'Budget'], button: 'Publish Job' } },
      { text: 'Workers apply, and you get a notification each time. Open your job to see everyone who applied.', screen: { title: 'My jobs', rows: ['3 applicants'], button: 'View applicants' } },
      { text: 'Check each applicant’s skills, rating and reviews. Tap Hire on the one you choose.', screen: { title: 'Applicants', rows: ['@worker1', '@worker2'], button: 'Hire' } },
      { text: 'You can also hire someone directly: open their profile, tap Hire this person, and pick one of your open jobs. They accept or decline.', screen: { title: 'Worker profile', rows: ['Skills', 'Reviews'], button: 'Hire this person' } },
      { text: 'Need to change something? Edit, close or reopen your job any time. A job with a hired worker cannot be deleted.', screen: { title: 'Manage job', rows: ['Edit', 'Close'], button: 'Save' } },
    ],
  },
  {
    id: 'set-up-shop',
    title: 'Set up your shop',
    forWho: 'Shop owners',
    intro: 'Let customers find you, see your work and book you.',
    steps: [
      { text: 'Open My Shop and start setting up. Add your shop name and pick a category.', screen: { title: 'My Shop', rows: ['Shop name', 'Category'], button: 'Next' } },
      { text: 'Add a shop photo, your area, and a short description of what you do.', screen: { title: 'Shop photo', rows: ['Photo', 'Area', 'Description'], button: 'Add a photo' } },
      { text: 'Your phone number is hidden by default. You can choose to show it, or stay private.', screen: { title: 'Privacy', rows: ['Show my number', 'Accept messages from anyone'], button: 'Next' } },
      { text: 'Add your services with prices, and your opening hours. Then save your shop.', screen: { title: 'Services', rows: ['Haircut ₦2,000', 'Braids ₦8,000'], button: 'Save shop' } },
      { text: 'Open your shop page and tap the Work tab. Add up to 12 photos of your work, with a short caption.', screen: { title: 'Work', rows: ['Photo', 'Photo'], button: 'Add a work photo' } },
      { text: 'Tap Share to send your shop link on WhatsApp.', screen: { title: 'Your shop', rows: ['Services', 'Work', 'Reviews'], button: 'Share' } },
    ],
  },
  {
    id: 'book-service',
    title: 'Book a service',
    forWho: 'Customers',
    intro: 'Pick a shop, pick a time, and agree the price directly.',
    steps: [
      { text: 'Tap Shops and find a barber, salon, tailor or repair shop near you.', screen: { title: 'Shops', rows: ['Ada’s Salon', 'Quick Fix Phones'], button: 'Open shop' } },
      { text: 'Look at their work photos and reviews, then choose a service.', screen: { title: 'Ada’s Salon', rows: ['Work', 'Reviews', 'Braids ₦8,000'], button: 'Book' } },
      { text: 'Choose a date and time, then send your booking.', screen: { title: 'Pick a time', rows: ['Sat 2 Nov', '10:00 AM'], button: 'Send booking' } },
      { text: 'The shop accepts or declines. You both see the update in Bookings.', screen: { title: 'Bookings', rows: ['Braids, accepted'], button: 'Open' } },
      { text: 'After the job is marked complete, you can leave a review. You pay the shop directly for now.', screen: { title: 'Leave a review', rows: ['5 stars', 'Your comment'], button: 'Submit' } },
    ],
  },
  {
    id: 'messages-privacy',
    title: 'Messages, privacy and staying safe',
    forWho: 'Everyone',
    intro: 'Your real name and phone number stay hidden until you decide.',
    steps: [
      { text: 'To contact someone new, send a message request of up to 200 characters. Say who you are and what you need.', screen: { title: 'Message request', rows: ['Hi, I need my sink fixed...'], button: 'Send request' } },
      { text: 'The other person sees it in their Requests tab. When they accept, a chat opens.', screen: { title: 'Requests', rows: ['@newperson'], button: 'Accept' } },
      { text: 'Inside a chat, you can ask to see their contact details. They choose whether to share.', screen: { title: 'Chat', rows: ['Hello!'], button: 'Ask for contact details' } },
      { text: 'Hiring someone, or accepting a booking, shares contact details both ways automatically.', screen: { title: 'Contact shared', rows: ['Phone number'], button: 'Call' } },
      { text: 'Someone bothering you? Open the chat menu and tap Block or Report. They cannot contact you again.', screen: { title: 'Chat menu', rows: ['Report', 'Block'], button: 'Block' } },
    ],
  },
]
