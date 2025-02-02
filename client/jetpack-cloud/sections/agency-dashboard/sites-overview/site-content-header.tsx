import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import MissingPaymentNotification from 'calypso/jetpack-cloud/components/missing-payment-notification';
import useDetectWindowBoundary from 'calypso/lib/detect-window-boundary';
import type { ReactNode } from 'react';

interface Props {
	pageTitle: string;
	showStickyContent: boolean;
	content: ReactNode;
}

export default function SiteContentHeader( { content, pageTitle, showStickyContent }: Props ) {
	const [ divRef, hasCrossed ] = useDetectWindowBoundary();

	const outerDivProps = divRef ? { ref: divRef as React.RefObject< HTMLDivElement > } : {};

	const translate = useTranslate();
	return (
		<>
			<MissingPaymentNotification />

			<div className="sites-overview__viewport" { ...outerDivProps }>
				<div
					className={ classNames( 'sites-overview__page-title-container', {
						'is-sticky': showStickyContent && hasCrossed,
					} ) }
				>
					<div className="sites-overview__page-heading">
						<h2 className="sites-overview__page-title">{ pageTitle }</h2>
						<div className="sites-overview__page-subtitle">
							{ translate( 'Manage all your Jetpack sites from one location' ) }
						</div>
					</div>

					{ content }
				</div>
			</div>
		</>
	);
}
