import axios from 'axios';
import { PUBLIC_BASE_URL, PUBLIC_NODE_ENV } from '$env/static/public';
import { browser } from '$app/environment';
import { authClient } from './auth/auth-client';
import { parseApiError } from './errors';
import { getUser } from './auth/guard';

const baseConfig = {
	baseURL: PUBLIC_NODE_ENV === 'development' ? `${PUBLIC_BASE_URL}` : '',
	headers: {
		'Content-Type': 'application/json'
	},
	paramsSerializer: {
		indexes: null
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
				// Add context header
				const user = await getUser();
				if (user) {
					// Use the user's activeContext field
					config.headers['X-User-Context'] = user.activeContext || 'personal';
				}
				config.headers.Authorization = `Bearer ${data.session.token}`;
			}
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

publicProcedure.interceptors.response.use(
	(response) => response,
	(error) => {
		throw parseApiError(error);
	}
);

protectedProcedure.interceptors.response.use(
	(response) => response,
	(error) => {
		throw parseApiError(error);
	}
);
