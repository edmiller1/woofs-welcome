import { z } from "zod";

export const trackViewSchema = z.object({
  placeId: z.string().uuid("Invalid place ID"),
  sessionId: z.string().uuid("Invalid session ID"),
  source: z.string().optional(),
  referrer: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  deviceType: z.string().optional(),
});

export type TrackViewInput = z.infer<typeof trackViewSchema>;

export const getViewsByPlaceParamSchema = z.object({
  placeId: z.string().uuid("Invalid place ID"),
});

export type GetViewsByPlaceParam = z.infer<typeof getViewsByPlaceParamSchema>;
