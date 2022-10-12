import { build, emptyDir } from 'https://deno.land/x/dnt/mod.ts';

await emptyDir('./npm');

await build({
	entryPoints: ['./mod.ts'],
	outDir: './npm',
	shims: {
		// see JS docs for overview and more options
		deno: false,
	},

	typeCheck: false,
	test: false,
	skipSourceOutput: true,
	package: {
		// package.json properties
		name: '@wvbe/kreuzzeug-im-nagelhosen',
		version: Deno.args[0],
		private: true,
		repository: {
			type: 'git',
			url: 'git+https://github.com/wvbe/kreuzzeug-im-nagelhosen.git',
		},
		bugs: {
			url: 'https://github.com/wvbe/kreuzzeug-im-nagelhosen/issues',
		},
	},
});
