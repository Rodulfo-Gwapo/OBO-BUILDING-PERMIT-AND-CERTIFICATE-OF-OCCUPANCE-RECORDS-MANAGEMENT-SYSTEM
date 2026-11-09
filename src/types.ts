export type RecordType = 'Building Permit' | 'Certificate of Occupancy' | 'Business Permit / OBO Clearance';

export type BuildingCategory =
  | 'Residential'
  | 'Commercial'
  | 'Industrial'
  | 'Institutional'
  | 'Agricultural'
  | 'Mixed-Use';

export interface PermitRecord {
  id: string;
  business: string; // Project / Building / Business Name
  owner: string; // Owner / Applicant / Representative
  engineer?: string; // Architect / Engineer in charge (PRC license)
  address: string; // Location / Barangay / Street
  type: RecordType;
  category?: BuildingCategory;
  floorArea?: string; // e.g. "320 sq.m."
  storeys?: string; // e.g. "2 Storeys"
  permitNo: string; // Building Permit or Occupancy Certificate No.
  orNo: string; // Official Receipt (OR) No.
  amount: number; // Amount Paid (PHP ₱)
  date: string; // Date Paid / Issued (YYYY-MM-DD)
  valid?: string; // Valid Until / Inspection Due Date (YYYY-MM-DD)
  remarks?: string; // Technical inspection notes or remarks
  createdAt?: string;
  updatedAt?: string;
}

export interface UserAccount {
  name: string;
  salt: string;
  hash: string;
  role?: string;
  createdAt: string;
}

export type PlatformType = 'windows' | 'mac' | 'android' | 'ios' | 'other';
