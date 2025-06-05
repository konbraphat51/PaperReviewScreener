// Handles parsing of BibTeX strings and extracting metadata
import bibtexParse from "bibtex-parse-js" // no types available

export interface BibTeXEntry {
	title: string
	abstract: string
	raw: string
}

export class BibTeXReader {
	static parse(bibtex: string): BibTeXEntry {
		const entries = bibtexParse.toJSON(bibtex)
		if (!entries.length) throw new Error("No BibTeX entry found")
		const entry = entries[0]
		return {
			title: entry.entryTags?.title || "",
			abstract: entry.entryTags?.abstract || "",
			raw: bibtex,
		}
	}
}
