import { ITEM_CONDITIONS } from '@e-hetsena/shared';
import type { ArticleCardItem } from '@/components/home/ArticleGrid';

export const DELIVERY_LABELS: Record<string, string> = {
  HAND_DELIVERY: 'Ifanatrehana (Main propre)',
  TAXI_BROUSSE_PARCEL: 'Taxi-brousse (Colis)',
  LOCAL_COURIER: 'Livreur local',
};

export function formatPrice(price: number) {
  return `${price.toLocaleString('fr-FR')} Ar`;
}

export function conditionLabel(id: string) {
  const c = ITEM_CONDITIONS.find((item) => item.id === id);
  return c ? `${c.mg} (${c.fr})` : id;
}

/** Article renvoyé par GET /api/articles -> carte de la grille */
export function toArticleCard(art: any): ArticleCardItem {
  return {
    id: art.id,
    title: art.title,
    price: art.price,
    city: art.city,
    size: art.size,
    condition: art.condition,
    imageUrl: art.images?.[0]?.url || '',
    hasVideo: !!art.video,
    seller: {
      id: art.seller?.id,
      fullName: art.seller?.fullName,
      avatarUrl: art.seller?.avatarUrl,
      trustScore: art.seller?.trustScore ?? 5,
    },
  };
}
