// ロール定義

export type UserRole = 'super_admin' | 'venue_admin' | 'guest';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  venueId?: string;      // Venue Adminの場合、所属する式場ID
  organizationId?: string; // Venue Adminの場合、組織ID
  createdAt?: string;
  updatedAt?: string;
}

export interface SuperAdmin extends User {
  role: 'super_admin';
}

export interface VenueAdmin extends User {
  role: 'venue_admin';
  venueId: string;
  organizationId: string;
}

export interface Guest extends User {
  role: 'guest';
}
