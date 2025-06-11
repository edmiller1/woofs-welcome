import { publicProcedure } from "@/lib/axios";
import { Place } from "@/lib/types/models";

export const getPlaceBySlug = async (slug: string) => {
    try {
        const response = await publicProcedure.get<Place>(`/place/${slug}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching place by slug:", error);
        throw error;
    }
}