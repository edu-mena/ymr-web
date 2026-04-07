// ─── Types & static data for Rental Quote Modal ──────────────────────────────

export interface RentalSpec {
  id: string | number;
  spec_type: string;   // "capacity" | "powerRange" | "type" etc.
  spec_value: string;  // human-readable label
  image: string;
  available: boolean;
}

export interface RentalCategory {
  id: string;
  label: string;
  type: 'equipment' | 'service';
  categoryImage: string;
  specs: RentalSpec[];
}

// Shape returned by GET /rental/categories → parsed via apiFetch
export interface RentalCategoriesResponse {
  success: boolean;
  data: Record<string, RentalCategory>;
}

export const ANGOLA_PROVINCES = [
  'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando Cubango',
  'Cuanza Norte', 'Cuanza Sul', 'Cunene', 'Huambo', 'Huila',
  'Luanda', 'Lunda Norte', 'Lunda Sul', 'Malanje', 'Moxico',
  'Namibe', 'Uíge', 'Zaire', 'Outro',
];

export const RENTAL_DURATIONS = [
  '1 dia',
  '1 semana',
  '1 mês',
  '3 meses',
  '6 meses',
  '1 ano',
  'Personalizado',
];

export const SUPPORT_PLANS = [
  { value: 'none', label: 'Sem plano SLA' },
  { value: 'basic', label: 'Basic (48h resposta)' },
  { value: 'standard', label: 'Standard (24h resposta, técnico agendado)' },
  { value: 'premium', label: 'Premium (12h resposta, técnico rápido)' },
  { value: 'critical', label: 'Critical (4h resposta, técnico urgente)' },
];
