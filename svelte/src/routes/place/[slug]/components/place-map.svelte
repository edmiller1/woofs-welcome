<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import mapboxgl from 'mapbox-gl';
	import 'mapbox-gl/dist/mapbox-gl.css';

	interface Props {
		accessToken: string;
		lng: number;
		lat: number;
		zoom?: number;
		style?: string;
		markerLabel?: string;
		className?: string;
		interactive?: boolean;
		onMapReady?: (map: mapboxgl.Map) => void;
	}

	let {
		accessToken,
		lng,
		lat,
		zoom = 12,
		style = 'mapbox://styles/woofs-welcome/cmelw4hbe008r01rke62c99p2',
		markerLabel = 'hello',
		className = '',
		interactive = true,
		onMapReady
	}: Props = $props();

	let mapContainer = $state<HTMLDivElement>();
	let map = $state<mapboxgl.Map>();
	let marker = $state<mapboxgl.Marker>();

	// Reactive effect for coordinate changes
	$effect(() => {
		if (marker && lng !== undefined && lat !== undefined) {
			marker.setLngLat([lng, lat]);
			if (map) {
				map.flyTo({ center: [lng, lat], duration: 1000 });
			}
		}
	});

	// Reactive effect for zoom changes
	$effect(() => {
		if (map && zoom !== undefined) {
			map.setZoom(zoom);
		}
	});

	onMount(() => {
		if (!mapContainer) return;

		mapboxgl.accessToken = accessToken;

		map = new mapboxgl.Map({
			container: mapContainer,
			style: style,
			center: [lng, lat],
			zoom: zoom,
			interactive: interactive
		});

		// Create custom marker element
		const markerElement = document.createElement('div');
		markerElement.className = 'custom-marker';
		markerElement.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#3d8463" stroke="white" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin-icon lucide-map-pin"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
    `;

		marker = new mapboxgl.Marker(markerElement).setLngLat([lng, lat]).addTo(map);

		// Add popup if label provided
		if (markerLabel) {
			const popup = new mapboxgl.Popup({
				offset: [0, 0],
				className: 'custom-popup'
			}).setHTML(`<div class="p-2 font-medium">${markerLabel}</div>`);
			marker.setPopup(popup);
		}

		// Add controls
		map.addControl(new mapboxgl.NavigationControl(), 'top-right');

		map.on('load', () => {
			onMapReady?.(map!);
		});
	});

	onDestroy(() => {
		marker?.remove();
		map?.remove();
	});

	// Exposed methods using runes
	const flyTo = (options: { center: [number, number]; zoom?: number }) => {
		if (map) {
			map.flyTo({ duration: 1000, ...options });
		}
	};

	const setMarkerLocation = (newLng: number, newLat: number) => {
		if (marker) {
			marker.setLngLat([newLng, newLat]);
		}
	};

	const getMapInstance = () => map;

	// Export functions for parent component access
	export { flyTo, setMarkerLocation, getMapInstance };
</script>

<div bind:this={mapContainer} class="map-container {className}"></div>

<style>
	.map-container {
		height: 350px;
		width: 100%;
		border-radius: 0.75rem;
	}

	:global(.custom-marker) {
		cursor: pointer;
		transition: transform 0.2s ease;
	}

	:global(.custom-marker:hover) {
		transform: scale(1.1);
	}

	:global(.custom-popup .mapboxgl-popup-content) {
		padding: 0;
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	:global(.custom-popup .mapboxgl-popup-tip) {
		border-top-color: white;
	}
</style>
