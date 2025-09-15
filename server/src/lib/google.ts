export const Google = {
  searchPlaces: async (query: string, location?: string) => {
    const searchQuery = location ? `${query} in ${location}` : query;

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${process.env.GOOGLE_PLACES_API_KEY}`
    );

    const data = await response.json();

    if (data.status === "OK") {
      return data.results.map((place: any) => ({
        place_id: place.place_id,
        name: place.name,
        address: place.formatted_address,
        rating: place.rating,
        types: place.types,
      }));
    }

    return [];
  },
  getPlacePhotos: async (
    placeId: string,
    apiKey: string
  ): Promise<string[]> => {
    // First get place details to get photo references
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${apiKey}`;

    const response = await fetch(detailsUrl);
    const data = await response.json();

    if (data.status === "OK" && data.result?.photos) {
      const photos = data.result.photos.slice(0, 20); // Limit to 20 photos
      // Convert photo references to actual image URLs
      return photos.map((photo: any) => {
        return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photo.photo_reference}&key=${apiKey}`;
      });
    }

    return [];
  },
  searchRegionOrCity: async (
    query: string,
    location: string = "New Zealand"
  ) => {
    const searchQuery = location ? `${query} in ${location}` : query;

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${process.env.GOOGLE_PLACES_API_KEY}`
    );

    const data = await response.json();

    if (data.status === "OK") {
      return data.results.map((place: any) => ({
        place_id: place.place_id,
      }));
    }

    return [];
  },
  getRegionOrCityPhoto: async (
    placeId: string,
    apiKey: string
  ): Promise<string | string[]> => {
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${apiKey}`;

    const response = await fetch(detailsUrl);
    const data = await response.json();

    if (data.status === "OK" && data.result?.photos) {
      const photo = data.result.photos[1];
      return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photo.photo_reference}&key=${apiKey}`;
    }

    return [];
  },
};
