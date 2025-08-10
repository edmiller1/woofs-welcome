import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { imagePreprocessor } from 'svimg';

const config = {
	preprocess: [
		imagePreprocessor({
		inputDir: 'static',
            outputDir: 'static/g',
            webp: true,
            avif: true
		}),
		vitePreprocess()],
	kit: { adapter: adapter(), 
		alias: {
      "@/*": "./path/to/lib/*",
    }, }
};

export default config;
