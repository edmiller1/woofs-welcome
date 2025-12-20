import { createAuthClient } from 'better-auth/svelte';
import { emailOTPClient, oneTapClient } from 'better-auth/client/plugins';
import { PUBLIC_GOOGLE_CLIENT_ID } from '$env/static/public';

export const authClient = createAuthClient({
	baseURL: 'http://localhost:9000',
	plugins: [
		oneTapClient({
			clientId: PUBLIC_GOOGLE_CLIENT_ID,
			autoSelect: false,
			cancelOnTapOutside: true,
			context: 'signin'
		}),
		emailOTPClient()
	]
});

export const { useSession, signIn, signUp, signOut, forgetPassword, resetPassword } = authClient;

export type Session = typeof authClient.$Infer.Session;
export type User = typeof authClient.$Infer.Session.user;
