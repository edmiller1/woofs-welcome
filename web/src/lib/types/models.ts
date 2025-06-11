export interface Place {
    id: string;
    name: string;
    slug: string;
    description: string;
    address: string;
    latitude: number;
    longitude: number;
    createdAt: string;
    updatedAt: string;
    images: PlaceImage[];
    phone: string | null;
    website: string | null;
    hours: any;
    dogPolicy: string | null;
    leashRequired: boolean;
    hasWater: boolean;
    hasWasteBags: boolean;
    indoorAllowed: boolean;
    outdoorAllowed: boolean;
    dogSizeLimit: string | null;
    feeDetails: string | null;
    amenities: string[] | null;
    rating: number | null;
    reviewsCount: number;
    isVerified: boolean;
    isFeatured: boolean;
    tags: Tag[];
}

export interface PlaceImage {
    id: string;
    placeId: string;
    url: string;
    index: number;
}

export interface Tag {
    id: string;
    name: string;
    category: string;
    createdAt: string;
}