// Handles import/export of screening data as JSON
import {Article} from "./Article"

export interface ScreeningData {
	articles: Article[]
	screens: string[] // List of screening rule names
	tags: TagNode[]
}

export interface TagNode {
	label: string
	value: string
	children?: TagNode[]
}

export class JSONHandler {
	static export(data: ScreeningData): string {
		return JSON.stringify(data, null, 2)
	}

	static import(json: string): ScreeningData {
		return JSON.parse(json)
	}
}
