// Handles tree-structured tags for articles
import type {TagNode} from "./JSONHandler"

export class TagManager {
	tags: TagNode[]

	constructor(tags: TagNode[] = []) {
		this.tags = tags
	}

	addTag(path: string[], label: string, value: string) {
		let current = this.tags
		for (const segment of path) {
			let node = current.find((t) => t.value === segment)
			if (!node) {
				node = {label: segment, value: segment, children: []}
				current.push(node)
			}
			if (!node.children) node.children = []
			current = node.children
		}
		current.push({label, value})
	}
}
