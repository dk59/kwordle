import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

import css from 'rollup-plugin-css-only';
import livereload from 'rollup-plugin-livereload';
import svelte from 'rollup-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';

// Define `require` since it won't exist in our ES module
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const production = !process.env.ROLLUP_WATCH;

function serve() {
	let server;

	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;

			server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true,
			});

			process.on('SIGTERM', toExit);
			process.on('exit', toExit);
		}
	};
}

export default {
	input: 'src/main.ts',
	output: {
		format: 'iife',
		name: 'app',
		file: 'public/build/bundle.js',
		sourcemap: !production,
	},
	plugins: [
		svelte({
			preprocess: sveltePreprocess({ sourceMap: !production }),
			compilerOptions: { dev: !production },
		}),

		// Extract component CSS out into a separate file for better performance
		css({ output: 'bundle.css' }),

		// If you have external dependencies installed from npm, you'll most likely need these plugins. In some cases
		// you'll need additional configuration. Consult the documentation for details:
		// https://github.com/rollup/plugins/tree/master/packages/commonjs

		resolve({
			browser: true,
			dedupe: ['svelte'],
		}),

		typescript({
			sourceMap: !production,
			inlineSources: !production,
		}),

		// In dev mode, call `npm run start` once the bundle has been generated
		!production && serve(),

		// Watch the `public` directory and refresh the browser on changes when not in production
		!production && livereload('public'),

		// If we're building for production (npm run build instead of npm run dev), minify
		production && terser()
	],
	watch: { clearScreen: false }
};
