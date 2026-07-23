import { Wifi, Car, Waves, Dumbbell, WashingMachine, PawPrint, BedDouble, Zap } from 'lucide-react';
import { CITIES } from '@/lib/cities';

export interface UnitPhoto { id: string; storage_path: string; sort_order: number; }
export interface Unit {
  id: string; title: string; area: string; city: string; bedrooms: number; bathrooms: number;
  weekly_price: number; amenities: string[]; special: string | null;
  status: 'available' | 'available_on'; available_date: string | null; sort_order: number;
  unit_photos: UnitPhoto[];
}

export const AMENITY_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  'WiFi included': Wifi,
  'Covered parking': Car,
  'Pool': Waves,
  'Gym': Dumbbell,
  'In-unit W/D': WashingMachine,
  'Pet friendly': PawPrint,
  'King beds': BedDouble,
  'Utilities included': Zap,
};

export function cityName(slug: string) {
  return CITIES.find(c => c.slug === slug)?.name ?? slug;
}
