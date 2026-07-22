export interface Product {
  _id: string;
  productName: string;
  price: number;
  ca_price?: number;
  addHome?: boolean;
  productType?: "card" | "marchandice" | string; // Assuming 'marchandice' is the typo in DB, keeping it as string literal or string
  category?:
    | "ALL"
    | "APPAREL"
    | "ACCESSORIES"
    | "PRINTS & POSTERS"
    | "STATIONERY"
    | "HOME & DECOR"
    | "COLLECTIBLES"
    | string;
  merchandiseBadge?: MerchandiseBadge;
  feature?: string;
  description?: string;
  videoLink?: string;
  img?: string; // Some products have 'img', some have 'imgs'
  imgs?: string[];
  ruleTitle?: string;
  rulls?: ProductRule[];
  boardanatomyTitle?: string;
  boardAnatomyDiscription?: string;
  passandplayTittle?: string;
  passandplay?: ProductPassAndPlayItem[];
  garmentTitle?: string;
  garmentsMATERIAL?: string;
  garmentWEIGHT?: string;
  garmentFit?: string;
  garmentPRINT?: string;
  garmentMADeIN?: string;
  garmentCARE?: string;
  productFeatures?: string[];
  gameSubtitle?: string;
  players?: string;
  age?: string;
  minutes?: string;
  cards?: string;
  inTheBox?: ProductInTheBox;
  homeImage?: string;
  quantity?: number;
  color?: string[];
  size?: string[];
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface ProductRule {
  num?: string;
  title?: string;
  description?: string;
}

export interface ProductPassAndPlayItem {
  message?: string;
  name?: string;
  type?: string;
}

export interface ProductBoxItem {
  number?: string;
  title?: string;
  subtitle?: string;
}

export interface ProductInTheBox {
  title?: string;
  subtitle?: string;
  boxnumbers?: ProductBoxItem[];
}

export type MerchandiseBadge =
  | "none"
  | "new_arrival"
  | "most_popular"
  | "best_seller"
  | "limited_edition";

export interface ProductResponse {
  success: boolean;
  message: string;
  data: Product[];
}

export interface CreateProductInput {
  productName: string;
  price: number;
  ca_price: number;
  addHome: boolean;
  productType: string;
  category?: string;
  merchandiseBadge?: MerchandiseBadge;
  feature?: string;
  description?: string;
  videoLink?: string;
  imgs: File[]; // Always an array, can be empty
  existingImgs: string[]; // Always an array of URLs, can be empty
  color?: string[];
  size?: string[];
  quantity?: number;
  ruleTitle?: string;
  rulls?: ProductRule[];
  boardanatomyTitle?: string;
  boardAnatomyDiscription?: string;
  passandplayTittle?: string;
  passandplay?: ProductPassAndPlayItem[];
  garmentTitle?: string;
  garmentsMATERIAL?: string;
  garmentWEIGHT?: string;
  garmentFit?: string;
  garmentPRINT?: string;
  garmentMADeIN?: string;
  garmentCARE?: string;
  productFeatures?: string[];
  gameSubtitle?: string;
  players?: string;
  age?: string;
  minutes?: string;
  cards?: string;
  inTheBox?: ProductInTheBox;
  homeImage?: File;
  existingHomeImage?: string;
}
