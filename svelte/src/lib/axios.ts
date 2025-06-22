import axios from "axios"
import { supabaseClient } from "./supabase/client";
import {PUBLIC_BASE_URL, PUBLIC_NODE_ENV} from '$env/static/public'

const baseConfig = {
    baseURL: PUBLIC_NODE_ENV === "development"
        ? `${PUBLIC_BASE_URL}`
        : "",
    headers: {
        "Content-Type": "application/json",
    },
};



export const publicProcedure = axios.create(baseConfig);
export const protectedProcedure = axios.create(baseConfig);

// Helper function to make authenticated requests
export const makeAuthenticatedRequest = async (
  method: 'get' | 'post' | 'put' | 'delete',
  url: string,
  data?: any,
  accessToken?: string
) => {
  const config = accessToken 
    ? { headers: { Authorization: `Bearer ${accessToken}` } }
    : {};

  return protectedProcedure[method](url, data, config);
};