import { createUser } from './createUser';
import { checkEmails } from './checkEmails';
import { welcome } from './welcome';
import { getFavourites } from './getFavourites';
import { updateProfile } from './updateProfile';
import { getProfileFavourites } from './getProfilefavourites';

export const auth = {
	createUser,
	checkEmails,
	welcome,
	getFavourites,
	updateProfile,
	getProfileFavourites
};
