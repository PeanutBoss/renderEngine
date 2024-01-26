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

interface Rect {
	x: number
	y: number
	width: number
	height: number
   expandedBy(sizes: EdgeSizes): Rect
}

interface Dimensions {
	content: Rect
	padding: EdgeSizes
	border: EdgeSizes
	margin: EdgeSizes
    paddingBox(): Rect
    borderBox(): Rect
    marginBox(): Rect
}
```

### 构建流程

#### Rect

#### Dimensions
 - 初始化各范围盒子（marginBox、borderBox、paddingBox、contentBox）的尺寸size（left、top、right、bottom）信息
 - 通过Rect实例的expandedBy计算出各范围盒子的Rect信息
 - 各范围盒子的Rect信息计算出来后就可以供layoutBox进行布局

#### LayoutBox
 - 通过styleNode初始化一个LayoutBox实例
 - 开始布局（如果是块元素）
   - 计算宽度（结合margin）
   - 计算内容区的位置（结合margin、border、padding）
   - 计算高度
   - 递归处理子元素

## Painting
**绘制**

