import { OfferType } from '../../../types/index.js';

export class UpdateOfferDto {
  public title?: string;
  public description?: string;
  public postDate?: Date;
  public city?: string;
  public previewImage?: string;
  public images?: string[];
  public isPremium?: boolean;
  public isFavorite?: boolean;
  public rating?: number;
  public type?: OfferType;
  public rooms?: number;
  public guests?: number;
  public price?: number;
  public goods?: string[];
  public categories?: string[];
  public location?: {
    latitude: number;
    longitude: number;
  };
}
