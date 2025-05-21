import axios from "axios";
import { createClient } from "./supabase/client";

const supabase = createClient();

const baseConfig = {
  baseURL:
    process.env.NODE_ENV === "development"
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}`
      : "",
  headers: {
    "Content-Type": "application/json",
  },
};

// Public instance for unauthenticated requests
export const publicProcedure = axios.create(baseConfig);

// Protected instance for authenticated requests
const protectedProcedure = axios.create(baseConfig);

// Add request interceptor to protected instance
protectedProcedure.interceptors.request.use(
  async (config) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // If there's no session, just proceed without token
      // This allows the request to go through and let the server handle authorization
      if (session?.access_token) {
        config.headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      return config;
    } catch (error) {
      console.log(error);
      // If there's an error getting the session, still allow the request
      // The server will handle unauthorized requests
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default protectedProcedure;
