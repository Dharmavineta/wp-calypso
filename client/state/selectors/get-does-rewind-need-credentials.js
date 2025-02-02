import getRewindState from 'calypso/state/selectors/get-rewind-state';

/**
 * Get the entire Rewind state object.
 * @param {Object} state Global state tree
 * @param {?number|string} siteId the site ID
 * @returns {Object} Rewind state object
 */
export default function getDoesRewindNeedCredentials( state, siteId ) {
	return [ 'awaitingCredentials' ].includes( getRewindState( state, siteId ).state );
}
