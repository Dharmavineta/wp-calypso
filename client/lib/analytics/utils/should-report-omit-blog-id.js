import { withScope, captureMessage } from '@automattic/calypso-sentry';
import { getSiteFragment } from 'calypso/lib/route';

const SITE_FRAGMENT_REGEX = /\/(:site|:site_id|:siteid|:blogid|:blog_id|:siteslug)(\/|$|\?)/i;

/**
 * Check if a path should report the currently selected site ID.
 *
 * Some paths should never report it because it's used
 * to tell general admin and site-specific activities apart.
 * @param {string} path The tracked path.
 * @returns {boolean} If the report should null `blog_id`.
 */
export default ( path ) => {
	if ( ! path ) {
		return true;
	}

	if ( SITE_FRAGMENT_REGEX.test( path ) ) {
		return false;
	}

	if ( typeof path !== 'string' ) {
		withScope( ( scope ) => {
			scope.setTag( 'path', path );
			captureMessage( 'Path is not a string' );
		} );
	}

	// Stepper routes start with /setup/, and might contain site slug or ID via URL parameters.
	if ( path.startsWith( '/setup/' ) ) {
		return false;
	}

	return ! getSiteFragment( path );
};
