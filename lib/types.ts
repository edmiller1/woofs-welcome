import type { Models } from "appwrite";

export interface Place extends Models.Document {
  name: string;
  description: string;
  region: string;
  mainImage: string;
  slug: string;
  listings: Listing[];
}

export interface Listing extends Models.Document {
  name: string;
  slug: string;
  description: string;
  city: string;
  region: string;
  address: string;
  email: string;
  latitude: number;
  longitude: number;
  phone: number | null;
  tags: string[] | null;
  type: string[];
  images: string[];
  mon: string | null;
  tue: string | null;
  wed: string | null;
  thu: string | null;
  fri: string | null;
  sat: string | null;
  sun: string | null;
  hours: boolean;
  placeId: string;
}
