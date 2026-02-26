import { Company, AdminContact, OnCallDuty, Offer, CityHall, Banner } from './types';

export const INITIAL_CITY_HALL: CityHall = {
  name: 'Prefeitura Municipal',
  phone: '(14) 3346-1234',
  landline: '(14) 3346-1000',
  address: 'Praça da Bandeira, s/n - Centro, Bernardino de Campos - SP',
  logo: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&q=80&w=400',
  social: {
    whatsapp: '',
    instagram: '',
    facebook: ''
  },
  updatedAt: Date.now()
};

export const INITIAL_ADMIN_CONTACT: AdminContact = {
  phone: '(14) 99755-0000',
  email: '',
  address: 'Copyright © 2024 bernardinonanet.com - Bernardino de Campos, SP',
  social: {
    whatsapp: '5514997550000',
    instagram: '',
    facebook: ''
  },
  city: 'bernardino'
};

export const INITIAL_ON_CALL: OnCallDuty = {
  pharmacyName: 'Farmácia Central',
  phone: '(14) 3346-1234',
  address: 'Rua Nove de Julho, 500 - Centro',
  updatedAt: Date.now(),
  city: 'bernardino'
};

export const INITIAL_OFFERS: Offer[] = [
  {
    id: 'o1',
    title: 'Promoção de Inauguração',
    description: 'Ganhe 10% de desconto em qualquer compra na Pizzaria D’Itália apresentando o bernardinonanet.com.',
    imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&q=80&w=600&h=400',
    createdAt: Date.now()
  }
];

export const INITIAL_COMPANIES: Company[] = [
  {
    id: '1',
    name: 'Pizzaria D’Itália',
    phone: '(14) 99888-0001',
    address: 'Rua Cel. José Baptista, 120',
    logo: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400',
    social: { 
      whatsapp: '5514998880001', 
      instagram: 'pizzaria_bc',
      facebook: 'pizzariaditaliabc'
    },
    createdAt: Date.now(),
    isFeatured: true,
    category: 'Alimentação',
    description: 'Tradicional pizzaria italiana com ingredientes selecionados e masa artesanal.',
    city: 'bernardino'
  }
];

export const INITIAL_BANNERS: Banner[] = [
  {
    id: 'b1',
    imageUrl: 'https://images.unsplash.com/photo-1623033290314-d73e9cf839bb?auto=format&fit=crop&q=80&w=1200&h=400',
    link: '/planos',
    active: true,
    order: 1,
    city: 'all'
  },
  {
    id: 'b2',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1200&h=400',
    link: '/plantao',
    active: true,
    order: 2,
    city: 'all'
  }
];
