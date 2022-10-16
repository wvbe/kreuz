import { serve } from 'aleph/react-server';

import * as $0 from '~/routes/_404.tsx';
import * as $1 from '~/routes/_app.tsx';
import * as $2 from '~/routes/index.tsx';

serve({
	router: {
		routes: {
			'/_404': $0,
			'/_app': $1,
			'/': $2,
		},
	},
	ssr: true,
});
