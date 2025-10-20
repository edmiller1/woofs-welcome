/**
 * JSON-LD Structured Data generators for SEO
 */

import { SITE_CONFIG } from './metadata';
import type { Place, Review } from '$lib/types/models';

/**
 * Organization Schema
 */
export function getOrganizationSchema() {
	return {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: SITE_CONFIG.name,
		description: SITE_CONFIG.description,
		url: SITE_CONFIG.url,
		logo: `${SITE_CONFIG.url}/logo.png`,
		sameAs: [
			SITE_CONFIG.facebookUrl,
			`https://twitter.com/${SITE_CONFIG.twitterHandle.replace('@', '')}`
		],
		contactPoint: {
			'@type': 'ContactPoint',
			contactType: 'Customer Service',
			email: 'hello@woofswelcome.app'
		}
	};
}

/**
 * Website Schema
 */
export function getWebsiteSchema() {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: SITE_CONFIG.name,
		description: SITE_CONFIG.description,
		url: SITE_CONFIG.url,
		potentialAction: {
			'@type': 'SearchAction',
			target: {
				'@type': 'EntryPoint',
				urlTemplate: `${SITE_CONFIG.url}/search?q={search_term_string}`
			},
			'query-input': 'required name=search_term_string'
		}
	};
}

/**
 * Place Schema (for individual place pages)
 */
export function getPlaceSchema(place: Place, reviews?: Review[]) {
	const schema: any = {
		'@context': 'https://schema.org',
		'@type': 'TouristAttraction', // Or 'Restaurant', 'Park', etc. based on type
		name: place.name,
		description: place.description,
		image: place.images?.[0]?.url,
		address: {
			'@type': 'PostalAddress',
			streetAddress: place.address,
			addressLocality: place.cityName,
			addressRegion: place.regionName,
			addressCountry: 'NZ'
		}
	};

	// Add coordinates if available
	if (place.latitude && place.longitude) {
		schema.geo = {
			'@type': 'GeoCoordinates',
			latitude: place.latitude,
			longitude: place.longitude
		};
	}

	// Add contact info if available
	if (place.phone) {
		schema.telephone = place.phone;
	}

	if (place.website) {
		schema.url = place.website;
	}

	// Add opening hours if available
	if (place.hours) {
		schema.openingHours = place.hours;
	}

	// Add rating if available
	if (place.rating && place.reviewsCount) {
		schema.aggregateRating = {
			'@type': 'AggregateRating',
			ratingValue: place.rating,
			reviewCount: place.reviewsCount,
			bestRating: 5,
			worstRating: 1
		};
	}

	// Add reviews if provided
	if (reviews && reviews.length > 0) {
		schema.review = reviews.slice(0, 5).map((review) => ({
			'@type': 'Review',
			author: {
				'@type': 'Person',
				name: review.user?.name || 'Anonymous'
			},
			datePublished: review.createdAt,
			reviewRating: {
				'@type': 'Rating',
				ratingValue: review.rating,
				bestRating: 5,
				worstRating: 1
			},
			reviewBody: review.content
		}));
	}

	// Add pet-friendly amenities
	schema.amenityFeature = [
		{
			'@type': 'LocationFeatureSpecification',
			name: 'Pet Friendly',
			value: true
		}
	];

	if (place.indoorAllowed) {
		schema.amenityFeature.push({
			'@type': 'LocationFeatureSpecification',
			name: 'Dogs Allowed Indoors',
			value: true
		});
	}

	if (place.outdoorAllowed) {
		schema.amenityFeature.push({
			'@type': 'LocationFeatureSpecification',
			name: 'Dogs Allowed Outdoors',
			value: true
		});
	}

	return schema;
}

/**
 * Breadcrumb Schema
 */
export function getBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: item.url
		}))
	};
}

/**
 * Article Schema (for blog posts if you add them)
 */
export function getArticleSchema(article: {
	title: string;
	description: string;
	image: string;
	datePublished: string;
	dateModified?: string;
	author: string;
	url: string;
}) {
	return {
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: article.title,
		description: article.description,
		image: article.image,
		datePublished: article.datePublished,
		dateModified: article.dateModified || article.datePublished,
		author: {
			'@type': 'Person',
			name: article.author
		},
		publisher: {
			'@type': 'Organization',
			name: SITE_CONFIG.name,
			logo: {
				'@type': 'ImageObject',
				url: `${SITE_CONFIG.url}/logo.png`
			}
		},
		mainEntityOfPage: {
			'@type': 'WebPage',
			'@id': article.url
		}
	};
}

/**
 * FAQ Schema (for pages with FAQ sections)
 */
export function getFAQSchema(faqs: Array<{ question: string; answer: string }>) {
	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: faqs.map((faq) => ({
			'@type': 'Question',
			name: faq.question,
			acceptedAnswer: {
				'@type': 'Answer',
				text: faq.answer
			}
		}))
	};
}
