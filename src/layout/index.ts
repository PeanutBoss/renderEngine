import { Display, getDisplayValue, StyleNode } from '../buildStyleTree'
import Dimensions from './Dimensions'
import LayoutBox from './LayoutBox'

export function getLayoutTree(styleNode: StyleNode, parentBlock: Dimensions) {
	parentBlock.content.height = 0
	// 创建布局树
	const root = buildLayoutTree(styleNode)
	// 布局树创建完成后开始布局操作
	root.layout(parentBlock)
	return root
}

function buildLayoutTree(styleNode: StyleNode) {
	// 如果该节点的display为none，直接抛出错误
	if (getDisplayValue(styleNode) === Display.None) {
		throw new Error('Root node has display: none')
	}

	// 为styleNode创建布局树
	const layoutBox = new LayoutBox(styleNode)
	let anonymousBlock: LayoutBox | undefined

	// 如果styleNode包含子节点
	for (const child of styleNode.children) {
		const childDisplay = getDisplayValue(child)
		// 跳过display为none的子节点
		if (childDisplay === Display.None) continue

		if (childDisplay === Display.Block) {
			anonymousBlock = undefined
			// 将子节点的布局树添加到父节点的children中
			layoutBox.children.push(buildLayoutTree(child))
		} else {
			// 这里针对的是文本节点（inline）
			if (!anonymousBlock) {
				anonymousBlock = new LayoutBox()
				layoutBox.children.push(anonymousBlock)
			}
			anonymousBlock.children.push(buildLayoutTree(child))
		}
	}
	return layoutBox
}
