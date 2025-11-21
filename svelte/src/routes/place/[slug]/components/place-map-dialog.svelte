<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import type { GetPlaceResponse } from '$lib/types/responses';
	import { MapPin } from '@lucide/svelte';
	import mapboxgl from 'mapbox-gl';
	import 'mapbox-gl/dist/mapbox-gl.css';
	import { mount, onDestroy, tick, unmount } from 'svelte';
	import MapPopup from './map-popup.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { api } from '$lib/api';
	import { untrack } from 'svelte';
	import ErrorBoundary from '$lib/components/error-boundary.svelte';
	import { boundsToParams, debounce } from '$lib/helpers';
	import { DotLottieSvelte } from '@lottiefiles/dotlottie-svelte';

	interface Props {
		accessToken: string;
		open: boolean;
		placeName: string;
		lat: number;
		lng: number;
		zoom?: number;
		style?: string;
		markerLabel?: string;
		interactive?: boolean;
		onMapReady?: (map: mapboxgl.Map) => void;
		place: GetPlaceResponse;
	}

	let {
		open = $bindable(),
		placeName,
		lat,
		lng,
		accessToken,
		zoom = 13,
		style = 'mapbox://styles/woofs-welcome/cmelw4hbe008r01rke62c99p2',
		interactive = true,
		onMapReady,
		place
	}: Props = $props();

	let mapContainer = $state<HTMLDivElement>();
	let map = $state<mapboxgl.Map | null>(null);
	let mainMarker = $state<mapboxgl.Marker | null>(null);
	let mainPopup = $state<mapboxgl.Popup | null>(null);
	let mainPopupComponent = $state<any>(null);
	let isInitialized = $state<boolean>(false);
	let wasOpen = $state<boolean>(false);
	let currentBounds = $state<mapboxgl.LngLatBounds | null | undefined>(null);
	let isMapMoving = $state<boolean>(false);
	let isMapZooming = $state<boolean>(false);
	let currentZoom = $state<number>(zoom);
	let currentCenter = $state<{ lng: number; lat: number }>({ lng, lat });

	let nearbyMarkers: mapboxgl.Marker[] = [];
	let nearbyPopupComponents: any[] = [];
	let markersCreated = $state<boolean>(false);

	const nearbyPlaces = createQuery({
		queryKey: ['nearby-places', lat, lng, place.types, place.slug],
		queryFn: async () => {
			const params = boundsToParams(currentBounds);

			if (!params) {
				return api.place.getNearbyPlaces({
					slug: place.slug,
					lat,
					lng,
					radius: 5
				});
			}

			return api.place.getNearbyPlaces({
				slug: place.slug,
				lat: params.centerLat,
				lng: params.centerLng,
				radius: params.radius
			});
		},
		enabled: !!place.slug
	});

	// Watch for dialog closing and cleanup
	$effect(() => {
		if (wasOpen && !open && isInitialized) {
			console.log('🚪 Dialog closed, cleaning up...');
			// Use setTimeout to ensure dialog animation completes
			setTimeout(() => {
				cleanupMap();
			}, 300);
		}
		wasOpen = open;
	});

	// Handle nearby places when they load - ONLY ONCE
	$effect(() => {
		if ($nearbyPlaces.isSuccess && map && isInitialized && !markersCreated) {
			console.log('✅ Creating nearby markers:', $nearbyPlaces.data.places.length);

			untrack(() => {
				createNearbyMarkers($nearbyPlaces.data.places);
				markersCreated = true;
			});
		}
	});

	// Initialize map when dialog opens
	$effect(() => {
		if (open && mapContainer && !isInitialized) {
			console.log('🗺️ Initializing map...');
			// Wait for dialog to be fully rendered
			setTimeout(() => {
				initializeMap();
			}, 100);
		}
	});

	// Resize map when dialog opens (for subsequent opens)
	$effect(() => {
		if (open && map && isInitialized) {
			untrack(() => {
				setTimeout(() => {
					console.log('📏 Resizing map...');
					map?.resize();
				}, 150);
			});
		}
	});

	$effect(() => {
		if (map && isInitialized) {
			const handleMove = () => {
				isMapMoving = true;
				handleMapSettled();
			};

			const handleMoveEnd = () => {
				isMapMoving = false;
				handleMapSettled.flush(); // Immediately execute if pending
			};

			map.on('move', handleMove);
			map.on('moveend', handleMoveEnd);

			return () => {
				handleMapSettled.cancel();
				map?.off('move', handleMove);
				map?.off('moveend', handleMoveEnd);
			};
		}
	});

	$effect(() => {
		if ($nearbyPlaces.isSuccess && map && isInitialized) {
			console.log('✅ Updating nearby markers:', $nearbyPlaces.data.places.length);

			untrack(() => {
				createNearbyMarkers($nearbyPlaces.data.places);
			});
		}
	});

	const handleMapSettled = debounce(() => {
		console.log('Map has settled');

		if (map) {
			const bounds = map.getBounds();
			const center = map.getCenter();
			const zoom = map.getZoom();

			currentBounds = bounds;

			console.log('Current state:', { bounds, center, zoom });

			// You could trigger API calls here
			$nearbyPlaces.refetch();
		}
	}, 1000);

	function createNearbyMarkers(places: any[]) {
		if (!map || !places || places.length === 0) {
			console.log('⚠️ Cannot create markers - missing map or places');
			return;
		}

		cleanupNearbyMarkers();

		console.log(`📍 Creating ${places.length} markers...`);

		places.forEach((nearbyPlace, index) => {
			try {
				const popupNode = document.createElement('div');

				const popupComponent = mount(MapPopup, {
					target: popupNode,
					props: {
						activePlace: nearbyPlace,
						closePopup: () => {
							const marker = nearbyMarkers.find(
								(m) =>
									m.getLngLat().lng === parseFloat(nearbyPlace.longitude) &&
									m.getLngLat().lat === parseFloat(nearbyPlace.latitude)
							);
							marker?.getPopup()?.remove();
						}
					}
				});

				nearbyPopupComponents.push(popupComponent);

				const popup = new mapboxgl.Popup({
					offset: [0, -20],
					className: 'custom-popup',
					closeButton: false,
					closeOnClick: true,
					maxWidth: 'none'
				}).setDOMContent(popupNode);

				const markerElement = document.createElement('div');
				markerElement.className = 'custom-marker';
				markerElement.style.cursor = 'pointer';
				markerElement.innerHTML = `
					<svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24 24" fill="#3d8463" stroke="white" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
						<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
						<circle cx="12" cy="10" r="3"/>
					</svg>
				`;

				const lng = parseFloat(nearbyPlace.longitude);
				const lat = parseFloat(nearbyPlace.latitude);

				if (isNaN(lng) || isNaN(lat)) {
					console.error('❌ Invalid coordinates for:', nearbyPlace.name);
					return;
				}

				const marker = new mapboxgl.Marker(markerElement)
					.setLngLat([lng, lat])
					.setPopup(popup)
					.addTo(map!);

				markerElement.addEventListener('click', (e) => {
					e.stopPropagation();
					nearbyMarkers.forEach((m) => m.getPopup()?.remove());
					mainPopup?.remove();
					popup.addTo(map!);
				});

				nearbyMarkers.push(marker);
			} catch (error) {
				console.error('❌ Error creating marker:', error);
			}
		});

		console.log(`🎯 Total nearby markers created: ${nearbyMarkers.length}`);
	}

	async function initializeMap() {
		if (!mapContainer) {
			console.error('❌ No map container!');
			return;
		}

		await tick();

		console.log('🎨 Creating map instance...');

		mapboxgl.accessToken = accessToken;

		map = new mapboxgl.Map({
			container: mapContainer,
			style: style,
			center: [lng, lat],
			zoom: zoom,
			interactive: interactive
		});

		const mainPopupNode = document.createElement('div');

		mainPopupComponent = mount(MapPopup, {
			target: mainPopupNode,
			props: {
				activePlace: place,
				closePopup: closeMainPopup
			}
		});

		mainPopup = new mapboxgl.Popup({
			offset: [0, -20],
			className: 'custom-popup',
			closeButton: false,
			closeOnClick: true,
			maxWidth: 'none'
		}).setDOMContent(mainPopupNode);

		const mainMarkerElement = document.createElement('div');
		mainMarkerElement.className = 'custom-marker';
		mainMarkerElement.style.cursor = 'pointer';
		mainMarkerElement.innerHTML = `
			<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#f2936f" stroke="white" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
				<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
				<circle cx="12" cy="10" r="3"/>
			</svg>
		`;

		mainMarker = new mapboxgl.Marker(mainMarkerElement)
			.setLngLat([lng, lat])
			.setPopup(mainPopup)
			.addTo(map);

		mainMarkerElement.addEventListener('click', (e) => {
			e.stopPropagation();
			nearbyMarkers.forEach((m) => m.getPopup()?.remove());
			if (mainPopup && map) {
				mainPopup.addTo(map);
			}
		});

		map.addControl(new mapboxgl.NavigationControl(), 'top-right');

		map.on('load', () => {
			console.log('✅ Map loaded successfully');
			isInitialized = true;
			map?.resize();
			onMapReady?.(map!);
			setTimeout(() => showMainPopup(), 500);
		});
	}

	function cleanupNearbyMarkers() {
		console.log('🧹 Cleaning up nearby markers:', nearbyMarkers.length);
		nearbyMarkers.forEach((marker) => {
			marker.getPopup()?.remove();
			marker.remove();
		});
		nearbyMarkers = [];

		nearbyPopupComponents.forEach((component) => {
			unmount(component);
		});
		nearbyPopupComponents = [];
	}

	function cleanupMap() {
		console.log('🗑️ Cleaning up entire map...');

		// Clean up main popup
		if (mainPopupComponent) {
			unmount(mainPopupComponent);
			mainPopupComponent = null;
		}
		if (mainPopup) {
			mainPopup.remove();
			mainPopup = null;
		}
		if (mainMarker) {
			mainMarker.remove();
			mainMarker = null;
		}

		// Clean up nearby markers and popups
		cleanupNearbyMarkers();

		// Remove map
		if (map) {
			map.remove();
			map = null;
		}

		// Reset state flags
		isInitialized = false;
		markersCreated = false;

		console.log('✅ Map cleanup complete');
	}

	onDestroy(() => {
		console.log('🗑️ Component destroying...');
		cleanupMap();
	});

	const flyTo = (options: { center: [number, number]; zoom?: number }) => {
		if (map) {
			map.flyTo({ duration: 1000, ...options });
		}
	};

	const setMarkerLocation = (newLng: number, newLat: number) => {
		if (mainMarker) {
			mainMarker.setLngLat([newLng, newLat]);
		}
	};

	const getMapInstance = () => map;

	const showMainPopup = () => {
		if (mainPopup && map) {
			mainPopup.addTo(map);
		}
	};

	const closeMainPopup = () => {
		if (mainPopup && map) {
			mainPopup.remove();
		}
	};

	export { flyTo, setMarkerLocation, getMapInstance, showMainPopup };
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="z-[99] !h-[95vh] !w-[95vw] !max-w-[95vw] p-0">
		<div class="flex h-full flex-col p-4">
			<Dialog.Header class="shrink-0 pb-3">
				<Dialog.Title class="flex items-center gap-2">
					<MapPin class="size-5" />
					{placeName}
				</Dialog.Title>
			</Dialog.Header>
			<ErrorBoundary error={$nearbyPlaces.error}>
				{#if $nearbyPlaces.isFetching && !$nearbyPlaces.isLoading}
					<div
						class="absolute left-1/2 top-16 z-10 h-[50px] w-[80px] -translate-x-1/2 overflow-hidden rounded-full bg-white shadow-md"
					>
						<div class="lottie-container flex h-full w-full items-center justify-center">
							<DotLottieSvelte src="/moody-dog.json" loop autoplay />
						</div>
					</div>
				{/if}
				<div bind:this={mapContainer} class="map-container w-full flex-1 rounded-lg"></div>
			</ErrorBoundary>
		</div>
	</Dialog.Content>
</Dialog.Root>

<style>
	/* Make sure the canvas inside scales */
	.lottie-container :global(canvas) {
		width: 100% !important;
		height: 100% !important;
		object-fit: contain;
	}
</style>
