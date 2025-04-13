module.exports = {
	// This is the line width that Prettier will try to wrap at -- but a line may be shorter or
	// longer, depending on its contents.
	printWidth: 100,
	// You can set the tab display width yourself, but this'll help Prettier estimate how far into
	// the printWidth a line with tabs is.
	tabWidth: 4,
	// Using tabs instead of spaces allows everyone to set their tab width to whatever they prefer,
	// without causing a code change
	useTabs: true,
	semi: true,
	// Using single quotes makes it easier to write strings that themselves contain double quotes,
	// for example because a phrase is being quoted.
	singleQuote: true,
	jsxSingleQuote: true,
	// Using quoted props only when needed limits a diff to only the affected object properties if
	// a property name is changed in such a way that quotes are needed.
	quoteProps: 'as-needed',
	// Always including a trailing comma in arrays and objects avoids a diff of 2 lines if only 1
	// item/property is added later.
	trailingComma: 'all',
	bracketSpacing: true,
	bracketSameLine: false,
	// Always using parenthesis, instead of only when necessary. This makes it easier to add a second
	// function argument later, type annotations, or a default value.
	arrowParens: 'always',
	proseWrap: 'always',
	htmlWhitespaceSensitivity: 'css',
	embeddedLanguageFormatting: 'auto',
	singleAttributePerLine: false,
};
