export const getNameFromSlug = (slug: string) => {
	return slug.split('-').join(' ');
};
