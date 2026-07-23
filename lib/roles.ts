// Access tiers for the staff app.
//
// Booking tier  — properties@ login (Joleen today; a hired third-party caller later).
//                 Sees the booking side only: Today, Bookings, Inventory, Waitlist,
//                 Schedule, Stats, Guide.
// Manager tier  — emails below (Emily; family). Sees everything, including the tenant
//                 back office: Tenants, Rent, Documents, Reports.
//
// The back office must stay invisible AND server-blocked for the booking tier so a
// hired caller can be handed the properties@ login without any risk of crossover.
export const MANAGER_EMAILS = [
  'management@canyon-advisors.com',
  'jeff.martin.az@gmail.com',
  // ⚠ REMOVE the line below the day a third-party caller is hired — that flips the
  // firewall on: the properties@ login then sees the booking side only.
  'properties@canyon-advisors.com',
];

export function isManager(email: string | null | undefined): boolean {
  if (!email) return false;
  return MANAGER_EMAILS.includes(email.toLowerCase().trim());
}

// Paths only managers may open (middleware + layout both use this).
export const MANAGER_PATHS = ['/staff/tenants', '/staff/rent', '/staff/documents', '/staff/reports'];

export function isManagerPath(pathname: string): boolean {
  return MANAGER_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'));
}
