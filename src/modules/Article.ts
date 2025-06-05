// Represents an academic article and its screening/tagging state
export interface ScreenResult {
	rule: string
	passed: boolean
	comment?: string
}

export class Article {
	bibtex: string
	screens: ScreenResult[]
	tags: string[]

	constructor(
		bibtex: string,
		screens: ScreenResult[] = [],
		tags: string[] = [],
	) {
		this.bibtex = bibtex
		this.screens = screens
		this.tags = tags
	}
}
