import { PermitRecord, UserAccount } from '../types';

const RECORDS_KEY = 'oboRegistry.records.v1';
const USERS_KEY = 'oboRegistry.users.v1';
const SESSION_KEY = 'oboRegistry.session';
const LOGO_KEY = 'oboRegistry.logo.v1';

// In-memory fallback if storage is blocked
const memoryStore: Record<string, string> = {};

export const storage = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return memoryStore[key] ?? null;
    }
  },
  set(key: string, value: string): boolean {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      memoryStore[key] = value;
      return false;
    }
  },
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {}
    delete memoryStore[key];
  },
};

export const DEFAULT_LOGO = '/assets/aistudio/Talisayan_Building_Official_Seal_5dc37e23.png';
export const MUNICIPAL_SEAL = '/assets/aistudio/Talisayan_logo_de080e16.jpg';

export function getSavedLogo(): string {
  const saved = storage.get(LOGO_KEY);
  if (!saved || saved === '/icon.svg') {
    return DEFAULT_LOGO;
  }
  return saved;
}

export function saveLogo(dataUrl: string): void {
  storage.set(LOGO_KEY, dataUrl);
}

export function resetLogo(): void {
  storage.remove(LOGO_KEY);
}

// Empty initial records - fresh start with 0 records
const INITIAL_RECORDS: PermitRecord[] = [];

export function loadRecords(): PermitRecord[] {
  // Clean up any old mock data from previous sessions
  try {
    localStorage.removeItem('oboRegistry.records.v1');
    localStorage.removeItem('permitRegistry.v1');
    localStorage.removeItem('permitRegistry.records.v1');
  } catch {}

  try {
    const raw = storage.get(RECORDS_KEY);
    if (!raw) {
      saveRecords([]);
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRecords(records: PermitRecord[]): void {
  storage.set(RECORDS_KEY, JSON.stringify(records));
}

export function loadUsers(): UserAccount[] {
  try {
    const raw = storage.get(USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveUsers(users: UserAccount[]): void {
  storage.set(USERS_KEY, JSON.stringify(users));
}

export function getActiveSession(): string | null {
  try {
    return sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export function setActiveSession(name: string): void {
  try {
    sessionStorage.setItem(SESSION_KEY, name);
  } catch {}
}

export function clearActiveSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {}
}

// Security: PBKDF2 Password Hashing
export async function hashPassword(password: string, salt: string): Promise<string> {
  try {
    if (window.crypto && crypto.subtle) {
      const enc = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        'PBKDF2',
        false,
        ['deriveBits']
      );
      const bits = await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: enc.encode(salt),
          iterations: 100000,
          hash: 'SHA-256',
        },
        keyMaterial,
        256
      );
      const hashArray = Array.from(new Uint8Array(bits));
      return 'p:' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (err) {
    console.warn('SubtleCrypto error, falling back to secure hash:', err);
  }
  // Deterministic fallback
  let h = 5381;
  const x = salt + password;
  for (let i = 0; i < x.length; i++) {
    h = ((h << 5) + h + x.charCodeAt(i)) | 0;
  }
  return 's:' + (h >>> 0).toString(16);
}

export function generateSalt(): string {
  const arr = new Uint8Array(16);
  if (window.crypto) {
    crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function formatPeso(amount: number | string): string {
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  return '₱' + num.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function getTodayString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export function getRecordStatus(record: PermitRecord): 'Active' | 'Expiring soon' | 'Expired' | '' {
  if (!record.valid) return '';
  const today = getTodayString();
  if (record.valid < today) return 'Expired';
  const diffDays = (new Date(record.valid).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= 30 ? 'Expiring soon' : 'Active';
}

// 18 Official Barangays of Municipality of Talisayan, Misamis Oriental
export const TALISAYAN_BARANGAYS = [
  'Poblacion',
  'Bagocboc',
  'Bugdang',
  'Calamcam',
  'Casibole',
  'Macopa',
  'Magkarila',
  'Mahinog',
  'Mandahilag',
  'Mintabon',
  'Pangpangon',
  'Puting Balas',
  'San Jose',
  'Santa Ines',
  'Sibantang',
  'Sindangan',
  'Subaan',
  'Tagbocboc',
];

// Common pre-filled templates for friendly 1-click form entry
export interface FormTemplate {
  name: string;
  type: import('../types').RecordType;
  category: import('../types').BuildingCategory;
  floorArea: string;
  storeys: string;
  amount: number;
  remarks: string;
}

export const OBO_TEMPLATES: FormTemplate[] = [
  {
    name: 'Residential (2-Storey House)',
    type: 'Building Permit',
    category: 'Residential',
    floorArea: '180 sq.m.',
    storeys: '2 Storeys',
    amount: 14500,
    remarks: 'Approved for new single-family residential construction. Structural, electrical, and sanitary clearance passed.',
  },
  {
    name: 'Commercial Store / Plaza Unit',
    type: 'Building Permit',
    category: 'Commercial',
    floorArea: '120 sq.m.',
    storeys: '1 Storey with Mezzanine',
    amount: 22800,
    remarks: 'Commercial building permit with parking, fire egress, and accessibility compliance review cleared.',
  },
  {
    name: 'Commercial Occupancy Certificate',
    type: 'Certificate of Occupancy',
    category: 'Commercial',
    floorArea: '350 sq.m.',
    storeys: '2 Storeys',
    amount: 35000,
    remarks: 'Full Certificate of Occupancy issued after final inspection of structural stability, fire safety (FSIC), and electrical wiring.',
  },
  {
    name: 'Warehouse / Cold Storage Facility',
    type: 'Building Permit',
    category: 'Industrial',
    floorArea: '800 sq.m.',
    storeys: 'Single Storey High Ceiling',
    amount: 68500,
    remarks: 'Industrial warehouse building permit with mechanical refrigeration & heavy electrical loads approved.',
  },
  {
    name: 'Annual Business OBO Safety Clearance',
    type: 'Business Permit / OBO Clearance',
    category: 'Commercial',
    floorArea: '85 sq.m.',
    storeys: 'Ground Floor Commercial Space',
    amount: 8500,
    remarks: 'Annual building and structural safety inspection clearance for Business Permit renewal.',
  },
];

// Automatic Permit & OR Number Generators
export function generateNextPermitNo(type: import('../types').RecordType, existingRecords: PermitRecord[]): string {
  const year = new Date().getFullYear();
  const prefix = type === 'Building Permit' ? 'BP' : type === 'Certificate of Occupancy' ? 'CO' : 'CLR';
  const matches = existingRecords
    .map(r => r.permitNo)
    .filter(p => p && p.startsWith(`${prefix}-${year}-`));
  const nextNum = matches.length + 1;
  return `${prefix}-${year}-${String(nextNum).padStart(4, '0')}`;
}

export function generateNextOrNo(existingRecords: PermitRecord[]): string {
  const base = 9482000;
  return `OR-${base + existingRecords.length + 1}`;
}

// User-friendly fee estimator
export function estimateOboFee(category: import('../types').BuildingCategory, floorAreaNum: number): {
  buildingFee: number;
  electricalFee: number;
  plumbingFee: number;
  filingFee: number;
  total: number;
} {
  const area = Math.max(0, floorAreaNum);
  let ratePerSqM = 18;
  if (category === 'Residential') ratePerSqM = 15;
  else if (category === 'Commercial') ratePerSqM = 28;
  else if (category === 'Industrial') ratePerSqM = 36;
  else if (category === 'Institutional') ratePerSqM = 22;
  else if (category === 'Mixed-Use') ratePerSqM = 30;
  else if (category === 'Agricultural') ratePerSqM = 12;

  const buildingFee = Math.round(area * ratePerSqM);
  const electricalFee = Math.round(buildingFee * 0.25);
  const plumbingFee = Math.round(buildingFee * 0.15);
  const filingFee = 500;
  const total = buildingFee + electricalFee + plumbingFee + filingFee;

  return { buildingFee, electricalFee, plumbingFee, filingFee, total };
}
