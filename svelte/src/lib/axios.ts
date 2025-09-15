import axios from 'axios';
import { PUBLIC_BASE_URL, PUBLIC_NODE_ENV } from '$env/static/public';
import { browser } from '$app/environment';
import { authClient } from './auth/auth-client';

const baseConfig = {
	baseURL: PUBLIC_NODE_ENV === 'development' ? `${PUBLIC_BASE_URL}` : '',
	headers: {
		'Content-Type': 'application/json'
	}
};

export const publicProcedure = axios.create(baseConfig);
export const protectedProcedure = axios.create(baseConfig);

protectedProcedure.interceptors.request.use(
	async (config) => {
		if (browser) {
			// Get token from auth store/session
			const { data } = await authClient.getSession();
			if (data?.session) {
				config.headers.Authorization = `Bearer ${data.session.token}`;
			}
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);
