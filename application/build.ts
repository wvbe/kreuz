import * as esbuild from 'esbuild';
import { denoPlugins } from 'esbuild-deno-loader';
import postcss from 'npm:postcss';
import postcssImport from 'npm:postcss-import';
import postcssMinify from 'npm:postcss-minify';
import { fromFileUrl } from 'path';
import fs from 'npm:fs-extra';

async function buildJavascriptFiles(): Promise<string> {
	const result = await esbuild.build({
		plugins: [
			...denoPlugins({
				loader: 'portable',
				importMapURL: import.meta.resolve('../imports.json'),
			}),
		],
		entryPoints: [import.meta.resolve('./application.tsx')],
		bundle: true,
		minify: true,
		sourcemap: 'inline',
		write: false,
		outdir: 'out',
		logLevel: 'silent',
	});

	esbuild.stop();

	return result.outputFiles[0].text;
}

async function buildCssFile(): Promise<string> {
	const css = await Deno.readTextFile(fromFileUrl(import.meta.resolve('./application.css')));
	const result = await postcss()
		.use(postcssImport())
		.use(postcssMinify())
		.process(css, {
			from: fromFileUrl(import.meta.resolve('./application.css')),
		});
	return result.css;
}

export async function createPage() {
	return `
		<?xml version="1.0" encoding="utf-8"?>
		<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
		<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en">
			<head>
				<style type="text/css">${await buildCssFile()}</style>
			</head>
			<body>
				<div id="root"/>

				<script type="text/javascript">
					// <![CDATA[
						${(await buildJavascriptFiles())
							.replace(/"<!\[CDATA\["/g, `"<![CDA" + "TA["`)
							.replace(/"]]>"/g, `"]" + "]>"`)}
					// ]]>
				</script>
			</body>
		</html>
	`.trim();
}

const page = await createPage();
if (Deno.args[0]) {
	await fs.outputFile(Deno.args[0], page, 'utf8');
} else {
	console.log(page);
}
