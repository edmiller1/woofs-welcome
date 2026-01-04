import { checkEmails } from './checkEmails';
import { welcome } from './welcome';
import { getFavourites } from './getFavourites';
import { updateProfile } from './updateProfile';
import { getProfileFavourites } from './getProfilefavourites';
import { getProfileReviews } from './getProfileReviews';
import { getProfileStats } from './getProfileStats';
import { updatePrivacy } from './updatePrivacy';
import { deleteAccount } from './deleteAccount';
import { switchContext } from './switchContext';

export const auth = {
	checkEmails,
	welcome,
	getFavourites,
	updateProfile,
	getProfileFavourites,
	getProfileReviews,
	getProfileStats,
	updatePrivacy,
	deleteAccount,
	switchContext
};
