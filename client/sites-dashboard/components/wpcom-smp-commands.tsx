import {
	plus as addNewSiteIcon,
	globe as domainsIcon,
	commentAuthorAvatar as profileIcon,
	settings as accountSettingsIcon,
	payment as creditCardIcon,
	home as dashboardIcon,
	chartBar as statsIcon,
	alignJustify as acitvityLogIcon,
	backup as backupIcon,
	cog as hostingConfigIcon,
	tool as toolIcon,
	page as pageIcon,
	key as keyIcon,
} from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useTranslate } from 'i18n-calypso';
import { CommandCallBackParams } from 'calypso/components/command-pallette/use-command-pallette';
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';
import { navigate } from 'calypso/lib/navigate';
import { useAddNewSiteUrl } from 'calypso/lib/paths/use-add-new-site-url';
import wpcom from 'calypso/lib/wp';
import { useDispatch } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { isCustomDomain, isNotAtomicJetpack, isP2Site } from '../utils';

interface useCommandsArrayWpcomOptions {
	setSelectedCommandName: ( name: string ) => void;
}

export const useCommandsArrayWpcom = ( {
	setSelectedCommandName,
}: useCommandsArrayWpcomOptions ) => {
	const translate = useTranslate();
	const setStateCallback =
		( actionName: string ) =>
		( { setSearch, setPlaceholderOverride }: CommandCallBackParams ) => {
			setSearch( '' );
			setSelectedCommandName( actionName );
			setPlaceholderOverride( translate( 'Search for a site' ) );
		};

	const { __ } = useI18n();
	const dispatch = useDispatch();
	const displaySuccessNotice = ( message: string ) =>
		dispatch( successNotice( message, { duration: 5000 } ) );
	const createSiteUrl = useAddNewSiteUrl( {
		source: 'sites-dashboard-command-palette',
		ref: 'topbar',
	} );

	const fetchSshUser = async ( siteId: number ) => {
		const response = await wpcom.req.get( {
			path: `/sites/${ siteId }/hosting/ssh-users`,
			apiNamespace: 'wpcom/v2',
		} );

		const sshUserResponse = response?.users;

		if ( ! sshUserResponse?.length ) {
			return null;
		}

		return sshUserResponse[ 0 ];
	};

	const copySshSftpDetails = async (
		siteId: number,
		copyType: 'username' | 'connectionString',
		siteSlug: string
	) => {
		const sshUser = await fetchSshUser( siteId );

		if ( ! sshUser ) {
			return navigate( `/hosting-config/${ siteSlug }` );
		}

		const textToCopy = copyType === 'username' ? sshUser : `ssh ${ sshUser }@sftp.wp.com`;
		navigator.clipboard.writeText( textToCopy );
		const successMessage =
			copyType === 'username' ? __( 'Copied username' ) : __( 'Copied SSH connection string' );
		displaySuccessNotice( successMessage );
	};

	const resetSshSftpPassword = async ( siteId: number, siteSlug: string ) => {
		const sshUser = await fetchSshUser( siteId );

		if ( ! sshUser ) {
			return navigate( `/hosting-config/${ siteSlug }` );
		}

		const response = await wpcom.req.post( {
			path: `/sites/${ siteId }/hosting/ssh-user/${ sshUser }/reset-password`,
			apiNamespace: 'wpcom/v2',
			body: {},
		} );
		const sshPassword = response?.password;

		if ( ! sshPassword ) {
			return navigate( `/hosting-config/${ siteSlug }` );
		}

		navigator.clipboard.writeText( sshPassword );
		displaySuccessNotice( __( 'Copied new password' ) );
	};

	const openPHPmyAdmin = async ( siteId: number ) => {
		try {
			const { token } = await wpcom.req.post( {
				path: `/sites/${ siteId }/hosting/pma/token`,
				apiNamespace: 'wpcom/v2',
			} );

			if ( token ) {
				window.open( `https://wordpress.com/pma-login?token=${ token }` );
			}
		} catch {
			dispatch( errorNotice( translate( 'Could not open phpMyAdmin. Please try again.' ) ) );
		}
	};

	const commands = [
		{
			name: 'addNewSite',
			label: __( 'Add new site' ),
			searchLabel: __( 'add new site' ),
			context: 'Adding a new website',
			callback: ( { close }: { close: () => void } ) => {
				close();
				navigate( createSiteUrl );
			},
			icon: addNewSiteIcon,
		},
		{
			name: 'openProfile',
			label: __( 'Open my profile' ),
			searchLabel: __( 'open my profile' ),
			context: 'Opening my profile',
			callback: ( { close }: { close: () => void } ) => {
				close();
				navigate( `/me` );
			},
			icon: profileIcon,
		},
		{
			name: 'openAccountSettings',
			label: __( 'Open account settings' ),
			searchLabel: __( 'open account settings' ),
			context: 'Openining account settings',
			callback: ( { close }: { close: () => void } ) => {
				close();
				navigate( `/me/account` );
			},
			icon: accountSettingsIcon,
		},
		{
			name: 'acessPurchases',
			label: __( 'Open my purchases' ),
			searchLabel: __( 'open my purchases' ),
			context: 'Openining my purchases',
			callback: ( { close }: { close: () => void } ) => {
				close();
				navigate( `me/purchases` );
			},
			icon: creditCardIcon,
		},
		{
			name: 'manageDomains',
			label: __( 'Manage domains' ),
			searchLabel: __( 'manage domains' ),
			context: 'Managing domains',
			callback: ( { close }: { close: () => void } ) => {
				close();
				navigate( `domains/manage` );
			},
			icon: domainsIcon,
		},
		{
			name: 'manageDns',
			label: __( 'Manage DNS records' ),
			searchLabel: __( 'manage dns records' ),
			context: 'Managing DNS records',
			callback: setStateCallback( 'manageDns' ),
			siteFunctions: {
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					navigate( `/domains/manage/${ site.slug }/dns/${ site.slug }` );
				},
				filter: ( site: SiteExcerptData ) =>
					isCustomDomain( site.slug ) && ! isNotAtomicJetpack( site ),
			},
			icon: domainsIcon,
		},
		{
			name: 'copySshConnectionString',
			label: __( 'Copy SSH connection string' ),
			searchLabel: __( 'copy ssh connection string' ),
			context: 'Copying SSH connection string',
			callback: setStateCallback( 'copySshConnectionString' ),
			siteFunctions: {
				onClick: async ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					await copySshSftpDetails( site.ID, 'connectionString', site.slug );
				},
				filter: ( site: SiteExcerptData ) => site?.is_wpcom_atomic,
			},
			icon: keyIcon,
		},
		{
			name: 'openSshCredentials',
			label: __( 'Open SFTP/SSH credentials' ),
			searchLabel: __( 'open SFTP/SSH credentials' ),
			context: 'Opening SFTP/SSH credentials',
			callback: setStateCallback( 'openSshCredentials' ),
			siteFunctions: {
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					navigate( `/hosting-config/${ site.slug }` );
				},
				filter: ( site: SiteExcerptData ) => site?.is_wpcom_atomic,
			},
			icon: keyIcon,
		},
		{
			name: 'resetSshSftpPassword',
			label: __( 'Reset SSH/SFTP password' ),
			searchLabel: __( 'reset ssh/sftp password' ),
			context: 'Resetting SSH/SFTP password',
			callback: setStateCallback( 'resetSshSftpPassword' ),
			siteFunctions: {
				onClick: async ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					resetSshSftpPassword( site.ID, site.slug );
				},
				filter: ( site: SiteExcerptData ) => site?.is_wpcom_atomic,
			},
			icon: keyIcon,
		},
		{
			name: 'openSiteDashboard',
			label: __( 'Open site dashboard' ),
			searchLabel: __( 'open site dashboard' ),
			context: 'Opening site dashboard',
			callback: setStateCallback( 'openSiteDashboard' ),
			siteFunctions: {
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					navigate( `/home/${ site.slug }` );
				},
			},
			icon: dashboardIcon,
		},
		{
			name: 'openSiteStats',
			label: __( 'Open site stats' ),
			searchLabel: __( 'open site stats' ),
			context: 'Opening site stats',
			callback: setStateCallback( 'openSiteStats' ),
			siteFunctions: {
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					navigate( `/stats/${ site.slug }` );
				},
			},
			icon: statsIcon,
		},
		{
			name: 'registerDomain',
			label: __( 'Register domain' ),
			searchLabel: __( 'register domain' ),
			context: 'Registering domain',
			callback: ( { close }: { close: () => void } ) => {
				close();
				navigate( `/start/domain/domain-only` );
			},
			icon: domainsIcon,
		},
		{
			name: 'openActivityLog',
			label: __( 'Open activity log' ),
			searchLabel: __( 'open activity log' ),
			context: 'Opening activity log',
			callback: setStateCallback( 'openActivityLog' ),
			siteFunctions: {
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					navigate( `/activity-log/${ site.slug }` );
				},
				filter: ( site: SiteExcerptData ) => ! isP2Site( site ) && ! isNotAtomicJetpack( site ),
			},
			icon: acitvityLogIcon,
		},
		{
			name: 'openBackups',
			label: __( 'Open backups' ),
			searchLabel: __( 'open backups' ),
			context: 'Opening backups',
			callback: setStateCallback( 'openBackups' ),
			siteFunctions: {
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					navigate( `/backup/${ site.slug }` );
				},
				filter: ( site: SiteExcerptData ) => ! isP2Site( site ) && ! isNotAtomicJetpack( site ),
			},
			icon: backupIcon,
		},
		{
			name: 'viewSiteMetrics',
			label: __( 'View site metrics' ),
			searchLabel: __( 'view site metrics' ),
			context: 'Viewing site metrics',
			callback: setStateCallback( 'viewSiteMetrics' ),
			siteFunctions: {
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					navigate( `/site-monitoring/${ site.slug }` );
				},
				filter: ( site: SiteExcerptData ) => site?.is_wpcom_atomic,
			},
			icon: statsIcon,
		},
		{
			name: 'openPHPLogs',
			label: __( 'Open PHP logs' ),
			searchLabel: __( 'open PHP logs' ),
			context: 'Opening PHP logs',
			callback: setStateCallback( 'openPHPLogs' ),
			siteFunctions: {
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					navigate( `/site-monitoring/${ site.slug }/php` );
				},
				filter: ( site: SiteExcerptData ) => site?.is_wpcom_atomic,
			},
			icon: acitvityLogIcon,
		},
		{
			name: 'openWebServerLogs',
			label: __( 'Open web server logs' ),
			searchLabel: __( 'open web server logs' ),
			context: 'Opening web server logs',
			callback: setStateCallback( 'openWebServerLogs' ),
			siteFunctions: {
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					navigate( `/site-monitoring/${ site.slug }/web` );
				},
				filter: ( site: SiteExcerptData ) => site?.is_wpcom_atomic,
			},
			icon: acitvityLogIcon,
		},
		{
			name: 'openHostingConfiguration',
			label: __( 'Open hosting configuration' ),
			searchLabel: __( 'open hosting configuration' ),
			context: 'Opening hosting configuration',
			callback: setStateCallback( 'openHostingConfiguration' ),
			siteFunctions: {
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					navigate( `/hosting-config/${ site.slug }#sftp-credentials` );
				},
				filter: ( site: SiteExcerptData ) => ! isP2Site( site ) && ! isNotAtomicJetpack( site ),
			},
			icon: hostingConfigIcon,
		},
		{
			name: 'openPHPmyAdmin',
			label: __( 'Open database in phpMyAdmin' ),
			searchLabel: __( 'open database in phpMyAdmin' ),
			context: 'Opening phpMyAdmin',
			callback: setStateCallback( 'openPHPmyAdmin' ),
			siteFunctions: {
				onClick: async ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					await openPHPmyAdmin( site.ID );
				},
				filter: ( site: SiteExcerptData ) => site?.is_wpcom_atomic,
			},
			icon: pageIcon,
		},
		{
			name: 'manageStagingSites',
			label: __( 'Manage staging sites' ),
			searchLabel: __( 'manage staging sites' ),
			context: 'Managing staging sites',
			callback: setStateCallback( 'manageStagingSites' ),
			siteFunctions: {
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					navigate( `/hosting-config/${ site.slug }#staging-site` );
				},
				filter: ( site: SiteExcerptData ) => site?.is_wpcom_atomic,
			},
			icon: toolIcon,
		},
		{
			name: 'managePHPVersion',
			label: __( 'Manage PHP version' ),
			searchLabel: __( 'manage PHP issue' ),
			context: 'Managing PHP version',
			callback: setStateCallback( 'managePHPVersion' ),
			siteFunctions: {
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					navigate( `/hosting-config/${ site.slug }#web-server-settings` );
				},
				filter: ( site: SiteExcerptData ) => site?.is_wpcom_atomic,
			},
			icon: toolIcon,
		},
		{
			name: 'manageCacheSettings',
			label: __( 'Manage cache settings' ),
			searchLabel: __( 'manage cache settings' ),
			context: 'Managing cache settings',
			callback: setStateCallback( 'manageCacheSettings' ),
			siteFunctions: {
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					navigate( `/hosting-config/${ site.slug }#cache` );
				},
				filter: ( site: SiteExcerptData ) => site?.is_wpcom_atomic,
			},
			icon: toolIcon,
		},
		{
			name: 'manageAdminInterfaceStyle',
			label: __( 'Manage admin interface style' ),
			searchLabel: __( 'manage admin interface style' ),
			context: 'Managing admin interface style',
			callback: setStateCallback( 'manageAdminInterfaceStyle' ),
			siteFunctions: {
				onClick: ( { site, close }: { site: SiteExcerptData; close: () => void } ) => {
					close();
					navigate( `/hosting-config/${ site.slug }#admin-interface-style` );
				},
				filter: ( site: SiteExcerptData ) => site?.is_wpcom_atomic,
			},
			icon: pageIcon,
		},
	];

	return commands;
};
