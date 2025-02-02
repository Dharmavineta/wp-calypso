import { Tooltip } from '@automattic/components';

// We're in the process of migrating to @automattic/components. Because of this, we're using this wrapper
// component to point references to the old Tooltip component to the new one in @automattic/components.
// This allows us to transition in smaller pieces and without risking updates to the old Calypso component in the interim.

export default Tooltip;
