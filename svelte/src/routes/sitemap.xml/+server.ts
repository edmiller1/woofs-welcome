import { PUBLIC_BASE_URL } from '$env/static/public';

export async function GET() {
	try {
		const response = await fetch(`${PUBLIC_BASE_URL}/sitemap.xml`);

		if (!response.ok) {
			throw new Error('Failed to fetch sitemap');
		}

		const sitemap = await response.text();

		return new Response(sitemap, {
			headers: {
				'Content-Type': 'application/xml',
				'Cache-Control': 'max-age=3600'
			}
		});
	} catch (error) {
		console.error('Error proxying sitemap:', error);
		return new Response('Error generating sitemap', { status: 500 });
	}
}
