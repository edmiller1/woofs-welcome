/**
 * SEO Metadata utilities
 */

export interface PageMetadata {
	title: string;
	description: string;
	keywords?: string[];
	image?: string;
	url?: string;
	type?: 'website' | 'article' | 'place';
	publishedTime?: string;
	modifiedTime?: string;
	author?: string;
	locale?: string;
	canonical?: string;
}

/**
 * Site configuration
 */
export const SITE_CONFIG = {
	name: 'Woofs Welcome',
	tagline: 'Discover Dog-Friendly Places in New Zealand',
	description:
		'Find and review dog-friendly cafes, restaurants, parks, beaches, and accommodations across New Zealand. Join our community of dog lovers!',
	url: 'https://www.woofswelcome.app',
	twitterHandle: '@woofswelcome', // Update with your actual handle
	facebookUrl: 'https://facebook.com/woofswelcome', // Update with your actual page
	image: 'https://www.woofswelcome.app/og-image.jpg', // Default OG image
	locale: 'en_NZ'
};

/**
 * Generate full title with site name
 */
export function generateTitle(pageTitle?: string): string {
	if (!pageTitle) {
		return `${SITE_CONFIG.name} - ${SITE_CONFIG.tagline}`;
	}
	return `${pageTitle} | ${SITE_CONFIG.name}`;
}

/**
 * Truncate description to proper length
 */
export function truncateDescription(description: string, maxLength: number = 160): string {
	if (description.length <= maxLength) {
		return description;
	}
	return description.slice(0, maxLength - 3) + '...';
}

/**
 * Generate keywords from text
 */
export function generateKeywords(text: string, additionalKeywords: string[] = []): string[] {
	const defaultKeywords = [
		'dog friendly',
		'dog friendly nz',
		'dog friendly new zealand',
		'dogs allowed',
		'pet friendly',
		'dogs welcome'
	];

	return [...defaultKeywords, ...additionalKeywords];
}

/**
 * Get absolute URL
 */
export function getAbsoluteUrl(path: string): string {
	const cleanPath = path.startsWith('/') ? path : `/${path}`;
	return `${SITE_CONFIG.url}${cleanPath}`;
}
