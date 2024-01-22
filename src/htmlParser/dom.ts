export enum NodeType {
	Element = 1,
	Text = 3
}

export interface Element {
	tagName: string
	attributes: Record<string, string>
	children: Node[]
	nodeType: NodeType.Element
}

export interface Text {
	nodeValue: string
	nodeType: NodeType.Text
}

export type Node = Element | Text

export function element(tagName: string): Element {
	return {
		tagName,
		attributes: {},
		children: [],
		nodeType: NodeType.Element
	}
}

export function text(content: string): Text {
	return {
		nodeValue: content,
		nodeType: NodeType.Text
	}
}
