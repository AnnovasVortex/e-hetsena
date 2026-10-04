import { z } from 'zod';

export const MADAGASCAR_CITIES = [
  'Antananarivo',
  'Toamasina',
  'Antsirabe',
  'Mahajanga',
  'Fianarantsoa',
  'Toliara',
  'Antsiranana',
  'Morondava',
  'Ambatondrazaka',
  'Nosy Be',
] as const;

export const CATEGORIES = [
  { id: 'friperie', fr: 'Friperie & Vêtements', mg: 'Akanjo & Fitafiana' },
  { id: 'chaussures', fr: 'Chaussures & Baskets', mg: 'Kiraro' },
  { id: 'artisanat', fr: 'Artisanat & Fait-main', mg: 'Zavatra vita tanana' },
  { id: 'beaute', fr: 'Beauté & Bien-être', mg: 'Fikarakarana vatana' },
  { id: 'maison', fr: 'Maison & Décoration', mg: 'Haingon-trano' },
  { id: 'hightech', fr: 'Téléphones & High-Tech', mg: 'Finday & Fitaovana' },
  { id: 'enfants', fr: 'Bébés & Enfants', mg: 'Zaza & Ankizy' },
] as const;

export const ITEM_CONDITIONS = [
  { id: 'NEW_WITH_TAG', fr: 'Neuf avec étiquette', mg: 'Vaovao misy marika' },
  { id: 'NEW_WITHOUT_TAG', fr: 'Neuf sans étiquette', mg: 'Vaovao tsy misy marika' },
  { id: 'VERY_GOOD_STATE', fr: 'Très bon état', mg: 'Tena tsara' },
  { id: 'GOOD_STATE', fr: 'Bon état', mg: 'Tsara' },
  { id: 'FAIR_STATE', fr: 'État satisfaisant', mg: 'Antonony' },
] as const;

export const CreateArticleSchema = z.object({
  title: z
    .string()
    .min(3, 'Lohateny fohy loatra (Titre trop court, min 3 caractères)')
    .max(80, 'Titre trop long (max 80 caractères)'),
  description: z
    .string()
    .min(10, 'Famaritana fohy loatra (Description trop courte, min 10 caractères)')
    .max(1500, 'Description trop longue'),
  price: z
    .number()
    .int('Le prix doit être un nombre entier')
    .min(500, 'Vidiny ambany loatra (Prix minimum: 500 Ar)')
    .max(100_000_000, 'Prix trop élevé'),
  category: z.string().min(1, 'Safidio ny sokajy (Choisissez une catégorie)'),
  size: z.string().optional(),
  condition: z.enum([
    'NEW_WITH_TAG',
    'NEW_WITHOUT_TAG',
    'VERY_GOOD_STATE',
    'GOOD_STATE',
    'FAIR_STATE',
  ]),
  city: z.string().min(1, 'Safidio ny tanàna (Choisissez une ville)'),
  deliveryOptions: z
    .array(z.enum(['HAND_DELIVERY', 'TAXI_BROUSSE_PARCEL', 'LOCAL_COURIER']))
    .min(1, 'Safidio farafahakeliny fomba fanaterana 1 (Au moins 1 mode de livraison requis)'),
  isWhatsAppContactEnabled: z.boolean().default(true),
  imageUrls: z
    .array(z.string().url('URL photo non valide'))
    .min(1, 'Mila sary 1 farafahakeliny (Au moins 1 photo requise)')
    .max(5, '5 sary fara-fahabetsany (Maximum 5 photos)'),
});

export type CreateArticleInput = z.infer<typeof CreateArticleSchema>;
