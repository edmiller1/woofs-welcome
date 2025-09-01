import type { Review } from '$lib/types/models';

export const dummyReviews: Review[] = [
	{
		id: '1',
		user: {
			name: 'Sarah Johnson',
			image:
				'https://images.unsplash.com/photo-1627995902989-4aeccec53370?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
		},
		rating: 5,
		content:
			'Absolutely loved this place! The staff was incredibly welcoming to my golden retriever Max. They brought out a water bowl without us even asking and had some delicious dog treats at the counter. The outdoor seating area was perfect for dining with dogs.',
		visitDate: '2024-01-15T10:30:00.000Z',
		staffFriendlinessRating: 5,
		hadWaterBowls: true,
		hadDogTreats: true,
		hadDogArea: false,
		hadDogMenu: true,
		numDogs: 1,
		dogBreeds: ['Golden Retriever'],
		timeOfVisit: 'morning',
		wouldRecommendForDogs: true,
		isFirstVisit: true,
		createdAt: '2024-01-15T14:30:00.000Z',
		updatedAt: '2024-01-15T14:30:00.000Z',
		photos: [
			'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=200&fit=crop',
			'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=200&fit=crop'
		],
		userId: 'user1'
	},
	{
		id: '2',
		user: {
			name: 'Mike Chen',
			image:
				'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
		},
		rating: 4,
		content:
			'Great experience overall! Brought both my dogs here - a German Shepherd and a Beagle. The space was clean and the staff was friendly, though it took a while for them to notice we had dogs with us. The outdoor area could use more shade, but otherwise perfect for a dog-friendly meal.',
		visitDate: '2024-01-08T18:45:00.000Z',
		staffFriendlinessRating: 4,
		hadWaterBowls: true,
		hadDogTreats: false,
		hadDogArea: true,
		hadDogMenu: false,
		numDogs: 2,
		dogBreeds: ['German Shepherd', 'Beagle'],
		timeOfVisit: 'evening',
		wouldRecommendForDogs: true,
		isFirstVisit: false,
		createdAt: '2024-01-08T20:15:00.000Z',
		updatedAt: '2024-01-08T20:15:00.000Z',
		photos: [],
		userId: 'user2'
	},
	{
		id: '3',
		user: {
			name: 'Emma Rodriguez',
			image:
				'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
		},
		rating: 3,
		content:
			"Decent place but could be more dog-friendly. My French Bulldog was allowed in, but there weren't any specific amenities for dogs. The food was good and the location is convenient, but I've been to more welcoming places for pets.",
		visitDate: '2024-01-03T13:20:00.000Z',
		staffFriendlinessRating: 3,
		hadWaterBowls: false,
		hadDogTreats: false,
		hadDogArea: false,
		hadDogMenu: false,
		numDogs: 1,
		dogBreeds: ['French Bulldog'],
		timeOfVisit: 'afternoon',
		wouldRecommendForDogs: true,
		isFirstVisit: true,
		createdAt: '2024-01-03T15:45:00.000Z',
		updatedAt: '2024-01-03T15:45:00.000Z',
		photos: [],
		userId: 'user3'
	},
	{
		id: '4',
		user: {
			name: 'Jake Wilson',
			image:
				'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
		},
		rating: 5,
		content:
			'Perfect spot for my Border Collie mix! They have a dedicated dog area in the back, and the staff even offered to refill the water bowl multiple times. The food was great too. Will definitely be back!',
		visitDate: '2024-01-20T12:15:00.000Z',
		staffFriendlinessRating: 5,
		hadWaterBowls: true,
		hadDogTreats: true,
		hadDogArea: true,
		hadDogMenu: false,
		numDogs: 1,
		dogBreeds: ['Border Collie Mix'],
		timeOfVisit: 'afternoon',
		wouldRecommendForDogs: true,
		isFirstVisit: true,
		createdAt: '2024-01-20T15:30:00.000Z',
		updatedAt: '2024-01-20T15:30:00.000Z',
		photos: [],
		userId: 'user4'
	},
	{
		id: '5',
		user: {
			name: 'Lisa Park',
			image:
				'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
		},
		rating: 2,
		content:
			"Not the best experience with my Husky. The staff seemed annoyed that I brought my dog, and there were no amenities for pets. The food was okay, but I felt unwelcome. Won't be returning with my dog.",
		visitDate: '2024-01-12T16:30:00.000Z',
		staffFriendlinessRating: 2,
		hadWaterBowls: false,
		hadDogTreats: false,
		hadDogArea: false,
		hadDogMenu: false,
		numDogs: 1,
		dogBreeds: ['Siberian Husky'],
		timeOfVisit: 'afternoon',
		wouldRecommendForDogs: false,
		isFirstVisit: true,
		createdAt: '2024-01-12T18:45:00.000Z',
		updatedAt: '2024-01-12T18:45:00.000Z',
		photos: [],
		userId: 'user5'
	},
	{
		id: '6',
		user: {
			name: 'Carlos Rivera',
			image:
				'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
		},
		rating: 4,
		content:
			'Good place overall. My two Labradors enjoyed the visit. Staff was helpful and the outdoor area worked well. Only downside was it got quite busy and loud, which made my younger dog a bit anxious.',
		visitDate: '2024-01-18T11:00:00.000Z',
		staffFriendlinessRating: 4,
		hadWaterBowls: true,
		hadDogTreats: false,
		hadDogArea: true,
		hadDogMenu: false,
		numDogs: 2,
		dogBreeds: ['Labrador Retriever', 'Labrador Retriever'],
		timeOfVisit: 'morning',
		wouldRecommendForDogs: true,
		isFirstVisit: false,
		createdAt: '2024-01-18T13:15:00.000Z',
		updatedAt: '2024-01-18T13:15:00.000Z',
		photos: [],
		userId: 'user6'
	}
];
