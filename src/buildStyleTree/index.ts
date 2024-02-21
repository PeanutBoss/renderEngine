import type { Node, Element } from '../htmlParser/dom'
import {NodeType} from '../htmlParser/dom'
import type {Rule} from '../cssParser'

interface StyleNode {
	node: Node
	value: Record<string, any>
	children: StyleNode[]
}

/*
* TODO
*  xxx 1.继承 xxx
*  xxx 2.文本节点 xxx
*  xxx 3.添加本身的style xxx
*  xxx 4.删除多余空格 xxx
* */

export const inheritableAttrs = ['color', 'font-size']

export function buildStyleTree(els: Node | Node[], cssRules: Rule[]) {
	if (Array.isArray(els)) return []
	return getStyleNode(els, cssRules)
}

function getStyleNode(ele: Node, cssRules: Rule[], parent?: StyleNode) {
	//  可以继承的样式
	const inheritStyle = getInheritableStyle(parent?.value)

	const styleNode = {
		node: ele,
		// 文本节点直接使用可继承的样式 inheritStyle
		// 继承样式优先级比本身的低
		value: { ...inheritStyle, ...styleByRules(ele, cssRules) },
		children: []
	}

	// 如果是Element，可能存在子节点和内联样式需要处理
	if (ele.nodeType === NodeType.Element) {
		// 内联样式优先级最高
		styleNode.value = { ...styleNode.value, ...inlineStyle(ele) }

		ele.children
			.forEach(child => styleNode.children.push(
				getStyleNode(child, cssRules, styleNode)
			))
	}

	removeSurplusSpace(styleNode.value)

	return styleNode
}

// 获取元素的样式信息
function styleByRules(ele: Node, cssRules: Rule[]) {
	const declarationList = []

	// 元素上的所有标识（class、id、tagName）
	const nodeIdList = eleIdentifier(ele)

	cssRules.forEach(rule => {

		// 匹配该CSSRule的所有标识符（可能包含 class、id、tagName）
		const ruleIdList = ruleIdentifier(rule.selectors)

		for (let i = 0; i < nodeIdList.length; i++) {
			if (ruleIdList.includes(nodeIdList[i])) {
				declarationList.push(...rule.declarations)
				break
			}
		}

	})

	return declarationList.reduce((preV, curV) => {
		preV[curV.name] = curV.value
		return preV
	}, {})
}

// 获取元素的标识
function eleIdentifier(ele) {
	// 文本节点没有任何标识，不会匹配到任何规则
	if (ele.nodeType === NodeType.Text) return []

	const identifierList = []
	if (ele.nodeType === NodeType.Element) {
		identifierList.push(ele.tagName)
		if (ele.attributes.class) {
			identifierList.push(...ele.attributes.class.split(' ').map(m => `.${m}`))
		}
		if (ele.attributes.id) identifierList.push(`#${ele.attributes.id}`)
	}
	return identifierList
}

// 获取CSSRule对应的标识
function ruleIdentifier(selectors: Rule['selectors']) {
	return selectors
		.map(m => {
			return {
				id: m.id ? `#${m.id}` : '',
				class: m.class ? `.${m.class}` : '',
				tagName: m.tagName
			}
		})
		.map(m => m.id + m.class + m.tagName)
}

// 获取元素的内联样式
function inlineStyle(el: Element) {
	if (!el.attributes.style) return {}

	const styleStrList = el.attributes.style
		.split(';')
		.filter(Boolean) // 内联样式可能以 ; 结尾，split之后可能会多出一个空串，需要过滤掉

	return styleStrList.reduce((preV, curV) => {
		const [key, value] = curV.split(':')
		preV[key] = value
		return preV
	}, {})
}

function getInheritableStyle(style: StyleNode['value']) {
	if (!style) return {}
	const inheritStyle = {}
	inheritableAttrs.forEach(attr => {
		if (attr in style) {
			inheritStyle[attr] = style[attr]
		}
	})
	return inheritStyle
}

function removeSurplusSpace(styles: StyleNode['value']) {
	const newStyle = {}
	for (const key in styles) {
		newStyle[key.trim()] = styles[key].trim()
	}
	return newStyle
}
