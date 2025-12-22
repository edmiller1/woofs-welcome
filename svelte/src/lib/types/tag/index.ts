export interface Tag {
	id: string;
	name: string;
	category: string;
	createdAt: string;
}

export interface PlaceTag {
	id: string;
	placeId: string;
	tagId: string;
	createdAt: string;
}
