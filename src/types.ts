export interface Offer {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: number;
}

export interface CityHall {
  name: string;
  phone: string;
  landline: string;
  address: string;
  logo: string;
  social: {
    whatsapp: string;
    instagram: string;
    facebook: string;
  };
  updatedAt: number;
}

export interface Company {
  id: string;
  name: string;
  phone: string;
  category: string;
  description?: string;
  address?: string;
  logo: string;
  isFeatured: boolean;
  social?: {
    whatsapp?: string;
    instagram?: string;
    facebook?: string;
  };
  city: string;
  createdAt?: number;
}

export interface Alert {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  link?: string;
  active: boolean;
  city: string;
  createdAt?: number;
}

export interface OnCallDuty {
  pharmacyName: string;
  phone: string;
  address: string;
  updatedAt: number;
  city: string;
}

export interface AdminContact {
  phone: string;
  email: string;
  address: string;
  social?: {
    whatsapp?: string;
    instagram?: string;
    facebook?: string;
  };
  city: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  category: 'oferta' | 'evento' | 'cidade' | 'urgente';
  imageUrl?: string;
  link?: string;
  createdAt: number;
  city: string;
}

export interface Banner {
  id: string;
  imageUrl: string;
  link?: string;
  active: boolean;
  order: number;
  city: string;
  createdAt?: number;
}
