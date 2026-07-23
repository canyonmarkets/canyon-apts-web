'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Section {
  title: string;
  steps: { heading: string; body: string }[];
}

const SECTIONS: Section[] = [
  {
    title: '📋 Daily Routine',
    steps: [
      {
        heading: 'Check your Today dashboard first',
        body: 'When you open the staff app, go to the Today tab. It shows every call scheduled for today in time order. Tap any card to open the full details for that booking.',
      },
      {
        heading: 'Review before each call',
        body: 'Before a call, tap the booking card to see the prospect\'s name, phone number, preferred city, bedroom count, move-in date, and how they heard about us. This is your prep sheet for the call.',
      },
      {
        heading: 'After the call — update the card',
        body: 'Tap the booking card and use the status buttons to mark the call Complete or No Show. Then move the pipeline stage to match where they are: New → Photos Sent → Application → Approved → Moved In.',
      },
    ],
  },
  {
    title: '📸 Uploading Photos to a Unit',
    steps: [
      {
        heading: 'Go to the Inventory tab',
        body: 'Tap Inventory in the bottom nav. You\'ll see a list of all your apartment units.',
      },
      {
        heading: 'Tap the unit you want to edit',
        body: 'Tap any unit name to open the editor for that unit.',
      },
      {
        heading: 'Scroll down to the Photos section',
        body: 'In the unit editor, scroll down until you see the Photos section. Tap "Upload Photos" and select images from your phone or computer. You can upload multiple at once. Photos appear in the order you upload them — the first photo is the main image on the public inventory page.',
      },
      {
        heading: 'Save the unit',
        body: 'Tap Save at the bottom. The photos will show up on the public inventory page within 60 seconds.',
      },
    ],
  },
  {
    title: '🏠 Setting the Apartment Complex Name',
    steps: [
      {
        heading: 'What is the complex name for?',
        body: 'The complex name is the real name of the apartment complex (e.g. "The Reserve at Desert Sky"). When you send a photo recap email, this name appears in a blue verification box so the prospect can call the complex directly and confirm Canyon Apartments is a current leaseholder. It is never shown on the public website.',
      },
      {
        heading: 'Where to add it',
        body: 'Go to Inventory → tap the unit → scroll down to the field labeled "Apartment complex name (staff only)". Type the complex name and tap Save.',
      },
    ],
  },
  {
    title: '📧 Sending a Photo Recap Email',
    steps: [
      {
        heading: 'When to send it',
        body: 'Send the photo recap after a call goes well and the prospect wants to see photos of a specific unit.',
      },
      {
        heading: 'How to send it',
        body: 'Open the booking card (Today tab or Bookings tab → tap the booking). Scroll down and tap the purple "Send Photo Recap" button.',
      },
      {
        heading: 'Pick the apartment unit',
        body: 'A list of your available units will pop up. Tap the unit you want to show them. The system will send them an email with the photos, price, amenities, and (if you\'ve set it) the complex name verification block.',
      },
      {
        heading: 'What gets sent',
        body: 'The prospect receives a branded email with: all photos of the unit in a gallery, the weekly price, the list of amenities, the city and bedroom count, and a blue box with the complex name and instructions to verify directly with the management office.',
      },
      {
        heading: 'After sending',
        body: 'The booking card will show "Recap Sent" with the date. The pipeline stage automatically moves to "Photos Sent". Four hours later, an automatic follow-up email goes out to check that they received the photos.',
      },
    ],
  },
  {
    title: '⏰ Automated Emails (What Sends Automatically)',
    steps: [
      {
        heading: '2-hour reminder',
        body: 'Automatically sent to the prospect 2 hours before their scheduled call time. No action needed from you.',
      },
      {
        heading: '1-hour reminder',
        body: 'Automatically sent 1 hour before the call. No action needed.',
      },
      {
        heading: 'Running-behind email',
        body: 'If 10 minutes pass after a call was supposed to start and you haven\'t opened the booking card within the last hour, the system automatically sends the prospect a "running a few minutes behind" email. To suppress this — if you know you\'ll be on time — just open the booking card sometime in the hour before the call.',
      },
      {
        heading: '4-hour photo follow-up',
        body: 'Sent automatically 4 hours after you send the photo recap. It\'s a short check-in email asking if they received the photos and if they have questions.',
      },
    ],
  },
  {
    title: '📋 Managing the Waitlist',
    steps: [
      {
        heading: 'Who goes on the waitlist?',
        body: 'Prospects who try to book but can\'t find availability — either because we have nothing in their city, their bedroom size isn\'t available, or their move-in date is too far out. They get added automatically when they choose to join during the booking flow.',
      },
      {
        heading: 'Viewing the waitlist',
        body: 'Tap the Waitlist tab in the bottom nav. Prospects are grouped by reason: City Unavailable, Beds Unavailable, and Date Too Far.',
      },
      {
        heading: 'Sending a blast when something opens up',
        body: 'When a unit becomes available that matches waitlisted prospects, tap the amber lightning bolt icon (⚡) in the top right corner of the Waitlist screen. Pick the unit from the list and tap Send. Everyone on the waitlist who matches that city and bedroom count will receive an email about the unit with a Book Now button.',
      },
    ],
  },
  {
    title: '🗓 Managing Your Call Schedule',
    steps: [
      {
        heading: 'Where to set your availability',
        body: 'Tap the Schedule tab (calendar icon) in the bottom nav.',
      },
      {
        heading: 'Setting available days and times',
        body: 'Toggle which days of the week you take calls and set the start/end time window for each day. The public booking page will only show time slots that fall within your available windows.',
      },
      {
        heading: 'Blocking time off',
        body: 'To block a day or period, toggle that day off or adjust the time window. Changes take effect immediately — any slot that falls outside your new window will disappear from the public booking page within a minute.',
      },
    ],
  },
  {
    title: '📊 Reading the Stats Page',
    steps: [
      {
        heading: 'What the stats show',
        body: 'The Stats tab shows lead volume, booking counts, no-show rate, and what percentage of bookings resulted in a photo recap being sent (your conversion metric). It also shows your top requested city, top bedroom count, lead sources breakdown, and weekly booking trends.',
      },
      {
        heading: 'Changing the date range',
        body: 'Tap "Last 7 days", "Last 30 days", "Last 90 days", or "All time" at the top of the Stats page to change the period.',
      },
    ],
  },
  {
    title: '✏️ Editing Unit Details',
    steps: [
      {
        heading: 'Status options',
        body: '"Available" = shows on the public page with a green dot. "Available On" = shows with an amber dot and a date (e.g. "Available June 30"). "Unavailable" = hidden from the public page entirely.',
      },
      {
        heading: 'Special badge',
        body: 'The optional badge field shows a small highlight chip on the unit card (e.g. "$350 off first month"). Leave it blank if there\'s no promotion.',
      },
      {
        heading: 'Internal notes',
        body: 'The internal notes field is staff-only and never shown publicly. Use it for anything you want to remember about the unit — maintenance notes, quirks, lease end dates, etc.',
      },
      {
        heading: 'Saving changes',
        body: 'Always tap Save at the bottom after making any edits. Changes to status and price appear on the public inventory page within 60 seconds.',
      },
    ],
  },
  {
    title: '🧭 Finding Your Way Around (the More menu)',
    steps: [
      {
        heading: 'The bottom bar shows your most-used tabs',
        body: 'Managers see Today, Bookings, Tenants, Rent, and More. Everything else — Inventory, Waitlist, Schedule, Stats, Reports, Documents, and this Guide — lives under the More button (the grid icon).',
      },
      {
        heading: 'Manager vs. booking access',
        body: 'The Tenants, Rent, Documents, and Reports areas are only visible when you log in with the management email. Anyone logged in with the properties email sees just the booking side (Today, Bookings, Inventory, Waitlist, Schedule, Stats, Guide). That means a hired caller can be given the properties login without ever seeing rent or tenant information.',
      },
      {
        heading: 'The search magnifying glass finds anyone',
        body: 'Tap the magnifying glass in the top bar on any screen and type a name, phone number, or email. It searches leads, bookings, waitlist, AND current tenants all at once — tap a result to jump straight to their card.',
      },
    ],
  },
  {
    title: '🏠 Tenants — Your Roster (managers)',
    steps: [
      {
        heading: 'The Tenants tab is the master list',
        body: 'Everyone currently living in a unit, grouped by apartment complex. The number chip shows their unit; tap any card to open their full record. Use the Moved Out toggle to see past tenants and their payment history.',
      },
      {
        heading: 'When someone moves in from a booking',
        body: 'Open their booking card and tap the green "Moved In — Create Tenant" button. Their name, phone, email, and pet info carry over automatically. Pick the unit, set their weekly rate, and you\'re done — the unit is automatically marked Taken on the inventory.',
      },
      {
        heading: 'Record money WHEN it arrives — the golden rule',
        body: 'The moment a prospect pays their $25 application fee or $200 hold (usually days before move-in), open their card, tap Record Payment, pick "App fee" or "Deposit" — the amounts are pre-filled. Two chips near the top of their card turn green: "✓ App fee paid" and "✓ Hold/deposit paid." Those chips are your at-a-glance truth, and the rental agreement wizard reads them automatically.',
      },
      {
        heading: 'Move-in day: Record Move-In Charges',
        body: 'On move-in day, tap "Record Move-In Charges" for the rest: prorated days (a − / + counter, 1–7 days, pre-set from their move-in date — the dollar amount calculates itself) and the buffer day (automatic, 1/7 of their weekly rate, rounded up). Anything already recorded — like the app fee and hold — shows "✓ Already recorded" and stays unchecked so nothing gets double-counted.',
      },
      {
        heading: 'The tenant card is their whole story',
        body: 'Weekly rate (tap the orange price to change it), everyone staying in the unit, deposit progress bar with Holding / Returned / Kept buttons, entry info (keypad code or metal key — set on the unit in Inventory), utility overages, documents, notes, and the Activity Log at the bottom showing every payment, email, and event ever recorded. Color badges tell you what each entry is at a glance; automated emails (like Sunday rent reminders) are tucked into one "🤖 automated emails" row — tap the + to see every single one with dates, handy when someone claims they were never reminded. Recorded a payment by mistake? Tap the small ✕ on that row to delete it.',
      },
      {
        heading: 'Move-outs and the 72-hour rule',
        body: 'When a tenant gives notice, tap "Record notice of vacancy" — that timestamps the 72-hour clock (tap "✕ undo" if you hit it by accident). When they leave, tap "Mark moved out": the tenancy closes, the unit flips back to Available on the inventory, and the card tells you whether their notice qualified for a deposit return. Then set the deposit to Returned or Kept.',
      },
      {
        heading: 'When someone pays but never moves in',
        body: 'It happens all the time — they pay the app fee and hold, then ghost or find something cheaper. Open their card, tap "Mark moved out…", then the "🚫 Never moved in" button. One tap archives them to the Moved Out list, marks the deposit Kept, and writes a dated note. The money they forfeited stays on the books as income and shows up on the Reports page.',
      },
    ],
  },
  {
    title: '📄 Rental Agreements & E-Signing (managers)',
    steps: [
      {
        heading: 'Sending the agreement — no more Eversign',
        body: 'On the tenant\'s card, tap "📄 Send Rental Agreement." Almost everything is pre-filled: their name, email, phone, the unit address, weekly rate, standard fees, and check-in/check-out dates. The move-in money section calculates the prorated days and buffer for you (and shows "✓ paid" next to anything already on their ledger). Tap "Write it for me" and the app composes the Special Terms money paragraph from the numbers — edit it if you like.',
      },
      {
        heading: 'Preview, pick recipients, send',
        body: 'Tap "👁 Preview the PDF first" to see exactly what they\'ll get — logo, Joleen\'s script signature, all thirty clauses. Then check who should receive the signing link ("Email the signing link to" lists every adult with an email — all checked by default). Hit Send. Each adult gets their own email; they all sign on the same link, one after another.',
      },
      {
        heading: 'What the tenant does on their phone',
        body: 'They open the link, read the agreement, check the "I agree" box, type their legal name, and draw their signature with a finger. Right after signing, the page asks for a photo of their ID and then a quick selfie (front camera) so you can confirm the face matches the license — important since we rarely meet people before move-in. If they close the page early, reopening the same link picks up where they left off.',
      },
      {
        heading: 'Everything files itself',
        body: 'The signed PDF, their photo ID, and their selfie all land in their Documents automatically. You get an alert at properties@ the moment each person signs, every signer is emailed their own finished copy, and the Activity Log shows the full trail: 📄 sent, ✍️ signed (one entry per adult), 🪪 ID, 🤳 selfie. The PDF\'s last page is a full audit trail — who signed, when, from what device address — stronger evidence than Eversign ever gave us.',
      },
    ],
  },
  {
    title: '🔔 Phone Alerts (push notifications)',
    steps: [
      {
        heading: 'One-time setup on your phone',
        body: 'Open canyon-apts.com/staff in Safari, tap Share → "Add to Home Screen," then open the app from its new home-screen icon and tap Allow when it asks about notifications. That\'s it — from then on your phone pops a banner the instant someone books a call, even with the app closed and your phone in your pocket. Tap the banner and it opens that booking directly.',
      },
      {
        heading: 'Turning booking alerts off (just for you)',
        body: 'On the staff home page (Today screen), scroll to the "New-booking alerts" card and tap the On/Off pill. It only affects YOUR phone — whoever handles booking calls keeps theirs On, everyone else can go quiet. Flip it back anytime, like when the caller role changes hands.',
      },
    ],
  },
  {
    title: '💵 Rent Day — Monday Mornings (managers)',
    steps: [
      {
        heading: 'Open the Rent tab Monday morning',
        body: 'Every active tenant is listed with their rate, sorted so unpaid people float to the top. The dark card at the top shows your running total collected this week versus expected. As payments arrive by Zelle or Venmo, tap Record next to the name — the amount is pre-filled, tap the payment method, done.',
      },
      {
        heading: 'The screen knows what time it is',
        body: 'Before 10 AM Monday everyone shows as Due. From 10 AM to 5 PM an amber "Late window" banner appears — the $50 fee applies. After 5 PM it turns into the red "buffer night" banner listing exactly who is out tomorrow at 10 AM unless they pay. The send-email button next to each unpaid name pre-loads the right email for the moment: late notice during the window, checkout instructions after 5.',
      },
      {
        heading: 'Late fees and partial payments',
        body: 'In the Record Payment popup, check "also record the $50 late fee" to book both amounts in one tap. If someone pays part now and the rest later, just record what they gave you — the row shows "$200 LEFT" until the rest is recorded, and the week completes itself.',
      },
      {
        heading: 'Browsing history',
        body: 'Use the arrows next to "This week" to step back through any past week — that\'s the permanent ledger. All the 2026 history from the old Google Sheet is in there.',
      },
    ],
  },
  {
    title: '⚡ The One-Time Late Extension (managers)',
    steps: [
      {
        heading: 'When a tenant asks for their extension',
        body: 'Open their card. If they\'ve already used it, an amber badge at the top says so — and the Grant Late Extension button shows how many times. You decide whether to allow another; the app just makes sure you know the truth before you say yes.',
      },
      {
        heading: 'Granting it',
        body: 'Tap "⚡ Grant Late Extension." The confirmation email opens pre-written with their amount plus the $50 fee and the 5 PM deadline — edit anything, hit Send. The moment it sends, the extension is logged to their record automatically.',
      },
    ],
  },
  {
    title: '🔌 Utility Overages (managers)',
    steps: [
      {
        heading: 'When the monthly utility bill arrives',
        body: 'Open the tenant\'s card, find Utility Overages, tap "+ Enter bill." The month and their credit ($100 for 1BR, $150 for 2BR — set per unit) are pre-filled. Type the bill amount and the overage calculates itself as you type.',
      },
      {
        heading: 'Collecting it',
        body: 'A pending overage shows purple on their Rent row so you remember it\'s owed with the next weekly payment. Use "Send overage email" to notify them with the exact numbers filled in, then "Mark collected" when it arrives — or Waive it if you\'re letting it slide.',
      },
    ],
  },
  {
    title: '✉️ Email Templates & Blasts (managers)',
    steps: [
      {
        heading: 'Your saved templates',
        body: 'Late Payment, Utility Overage, Checkout Instructions, Late Extension, Sunday Rent Reminder, and Bank Holiday Notice come pre-written. Every send is editable before it goes out, and placeholders like the tenant\'s name and amount fill in automatically. All tenant email sends from management@canyon-advisors.com.',
      },
      {
        heading: 'Making a template say it YOUR way',
        body: 'Open any tenant\'s Send Email, pick the template, rewrite the wording however you like, and tap "Save as template." From then on, every send (including automated ones) uses your wording.',
      },
      {
        heading: 'Emailing everyone at once',
        body: 'On the Tenants tab, tap "Email All." Pick a template (like the Bank Holiday Notice), review, and send — every current tenant gets a personalized copy with their own name and rate.',
      },
      {
        heading: 'Making a blast automatic',
        body: 'In that same Email All popup, use "Make it recurring": pick a day and time (like Sunday 6 PM for the rent reminder) and tap Schedule. It then sends itself every week without you touching anything. Scheduled blasts are listed right there with a trash can to cancel.',
      },
    ],
  },
  {
    title: '📁 Documents (managers)',
    steps: [
      {
        heading: 'One vault for everything',
        body: 'More → Documents holds every rental agreement and file, searchable by tenant name. Files are stored privately — opening one creates a temporary secure link.',
      },
      {
        heading: 'Uploading',
        body: 'Fastest way: open the tenant\'s card, scroll to Documents, tap "+ Upload." The file is automatically tagged to them. You can also upload from the vault itself and pick who it belongs to.',
      },
    ],
  },
  {
    title: '📊 Reports (managers)',
    steps: [
      {
        heading: 'The money picture',
        body: 'More → Reports shows what was collected (broken down by rent, late fees, deposits, and overages), a weekly bar chart, and your occupancy and vacancy rate. Switch between last 4 weeks, 3 months, and year-to-date.',
      },
      {
        heading: 'Deposits and problem payers',
        body: 'The deposits card tracks kept vs. returned totals all-time, plus an amber "forfeited by no-shows" card counting the money from people who paid fees but never moved in. The late-payment leaderboard shows who pays late most often — useful context when someone asks for a favor.',
      },
      {
        heading: 'Tax-time export',
        body: 'At the bottom of Reports, the "Export for taxes" card downloads the complete payment ledger for any year as a spreadsheet — every payment with tenant, unit, type, amount, and method, with a grand total at the bottom. Once a year, tap the button and hand the file to the accountant. Done.',
      },
    ],
  },
];

function AccordionSection({ section }: { section: Section }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-xl border border-iron-200 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-iron-50 transition-colors"
      >
        <span className="font-semibold text-iron-900 text-base">{section.title}</span>
        {open ? <ChevronUp className="w-5 h-5 text-iron-800 shrink-0" /> : <ChevronDown className="w-5 h-5 text-iron-800 shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-5 border-t border-iron-100 pt-4">
          {section.steps.map((step, i) => (
            <div key={i}>
              <p className="text-sm font-semibold text-brand-700 mb-1">{step.heading}</p>
              <p className="text-sm text-iron-600 leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function StaffGuidePage() {
  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-28">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-iron-900">Staff Guide</h1>
        <p className="text-sm text-iron-800 mt-1">Everything you need to manage Canyon Apartments bookings.</p>
      </div>
      <div className="space-y-3">
        {SECTIONS.map((section) => (
          <AccordionSection key={section.title} section={section} />
        ))}
      </div>
    </div>
  );
}
