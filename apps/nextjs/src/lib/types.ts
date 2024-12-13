export interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  isBusiness: boolean | null;
  businessName: string | null;
  plan: "none" | "starter" | "pro" | null;
}
