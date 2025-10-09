import type { DayOfWeek, DayOfWeekHours, Hours } from '$lib/types/models';

export const getNameFromSlug = (slug: string) => {
	return slug.split('-').join(' ');
};

export const orderHoursByDay = (hours: Hours) => {
	const dayOrder = [
		'Monday',
		'Tuesday',
		'Wednesday',
		'Thursday',
		'Friday',
		'Saturday',
		'Sunday'
	] as const;

	return dayOrder
		.map((day) => ({
			day,
			hours: hours[day] || null
		}))
		.filter((day) => day.hours !== null);
};

export const getCurrentDayStatus = (hours: DayOfWeekHours): string | null => {
	const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }) as DayOfWeek;
	const todayHours = hours[today];

	if (!todayHours) {
		return 'Closed today';
	}

	if (todayHours.toLowerCase() === 'closed') {
		return 'Closed today';
	}

	// Parse the hours (handles formats like "8am - 9pm", "9am - 8:30pm", "8:30am - 5:30pm")
	const timeMatch = todayHours.match(/(\d+(?::\d+)?)\s*([ap]m)\s*-\s*(\d+(?::\d+)?)\s*([ap]m)/i);

	if (!timeMatch) {
		return `Open today: ${todayHours}`;
	}

	const [, openTime, openPeriod, closeTime, closePeriod] = timeMatch;
	const now = new Date();
	const currentHour = now.getHours();
	const currentMinute = now.getMinutes();

	// Helper function to convert time string to 24-hour format
	const convertTo24Hour = (timeStr: string, period: string): { hour: number; minute: number } => {
		const [hourStr, minuteStr = '0'] = timeStr.split(':');
		let hour = parseInt(hourStr);
		const minute = parseInt(minuteStr);

		if (period.toLowerCase() === 'pm' && hour !== 12) {
			hour += 12;
		} else if (period.toLowerCase() === 'am' && hour === 12) {
			hour = 0;
		}

		return { hour, minute };
	};

	const openTime24 = convertTo24Hour(openTime, openPeriod);
	const closeTime24 = convertTo24Hour(closeTime, closePeriod);

	const currentTimeInMinutes = currentHour * 60 + currentMinute;
	const openTimeInMinutes = openTime24.hour * 60 + openTime24.minute;
	const closeTimeInMinutes = closeTime24.hour * 60 + closeTime24.minute;

	if (currentTimeInMinutes < openTimeInMinutes) {
		return `Opens at ${openTime}${openPeriod.toLowerCase()}`;
	} else if (currentTimeInMinutes >= closeTimeInMinutes) {
		return 'Closed now';
	} else {
		return `Open till ${closeTime}${closePeriod.toLowerCase()}`;
	}
};

export const calculateRatingStats = (reviews: number[]) => {
	const totalReviews = reviews.length;
	const ratingCounts: { [key: number]: number } = {
		1: 0,
		2: 0,
		3: 0,
		4: 0,
		5: 0
	};

	reviews.forEach((review) => {
		ratingCounts[review]++;
	});

	const averageRating = totalReviews
		? reviews.reduce((sum, review) => sum + review) / totalReviews
		: 0;

	return {
		averageRating: Math.round(averageRating * 10) / 10,
		totalReviews,
		distribution: Object.entries(ratingCounts)
			.map(([stars, count]) => ({
				stars: parseInt(stars),
				count,
				percentage: totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
			}))
			.reverse()
	};
};

export const formatDate = (dateString: string) => {
	const date = new Date(dateString);
	return date.toLocaleDateString('en-AU', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});
};

export const getTimeOfVisitEmoji = (time: string) => {
	switch (time) {
		case 'morning':
			return '🌅';
		case 'afternoon':
			return '☀️';
		case 'evening':
			return '🌕';
		default:
			return '';
	}
};

export function classNames(...classes: any) {
	return classes.filter(Boolean).join(' ');
}

export const generateUID = (): string => {
	let firstPart: number | string = (Math.random() * 46656) | 0;
	let secondPart: number | string = (Math.random() * 46656) | 0;
	firstPart = ('000' + firstPart.toString(36)).slice(-3);
	secondPart = ('000' + secondPart.toString(36)).slice(-3);
	return firstPart + secondPart;
};

export const getFileBase64 = (file: File): Promise<string> => {
	return new Promise((resolve, reject) => {
		try {
			const reader = new FileReader();

			reader.onload = () => {
				if (reader.result) {
					// Remove "data:*/*;base64," prefix from the result
					// const base64String = reader.result.toString().split(",")[1];
					resolve(reader.result as string);
				} else {
					reject(new Error('Failed to read file'));
				}
			};

			reader.onerror = () => {
				reject(new Error('Error reading file'));
			};

			reader.readAsDataURL(file);
		} catch (error) {
			reject(error);
		}
	});
};

export const getUserInitials = (name: string) => {
	const names = name.split(' ');
	const initials = names.map((n) => n.charAt(0).toUpperCase()).join('');
	return initials.slice(0, 2); // Limit to 2 characters
};
