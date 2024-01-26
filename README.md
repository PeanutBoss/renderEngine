# renderEngine

## HTMLParser

```ts
enum NodeType {
	Element = 1,
	Text = 3
}

interface Element {
	tagName: string
	attributes: Record<string, string>
	children: Node[]
	nodeType: NodeType.Element
}

interface Text {
	nodeValue: string
	nodeType: NodeType.Text
}

type Node = Element | Text
```


## CSSRule

```ts
export interface Rule {
	selectors: Selector[]
	declarations: Declaration[]
}

interface Selector {
	id: string
	class: string
	tagName: string
}

interface Declaration {
	name: string
	value: string | number
}
```

## StyleTree

```ts
interface StyleNode {
	node: Node
	value: Record<string, any>
	children: StyleNode[]
}

enum Display {
	Inline = 'inline',
	Block = 'block',
	None = 'none'
}
```

## LayoutTree

```ts
enum BoxType {
	BlockNode = 'BlockNode',
	InlineNode = 'InlineNode',
	AnonymousBlock = 'AnonymousBlock'
}

interface EdgeSizes {
	left: number
	top: number
	right: number
	bottom: number
}

class Rect {
	x: number
	y: number
	width: number
	height: number
}

class Dimensions {
	content: Rect
	padding: EdgeSizes
	border: EdgeSizes
	margin: EdgeSizes
}
```

## Painting
**绘制**

