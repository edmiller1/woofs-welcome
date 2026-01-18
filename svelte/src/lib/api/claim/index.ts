import { checkClaimEligibility } from './checkEligibility';
import { getBusinessClaims } from './getBusinessClaims';
import { getClaimById } from './getClaimById';
import { submitClaim } from './submitClaim';
import { updateClaim } from './updateClaim';
import { uploadClaimDocuments } from './uploadDocuments';

export const claim = {
	checkClaimEligibility,
	submitClaim,
	updateClaim,
	uploadClaimDocuments,
	getBusinessClaims,
	getClaimById
};
