import type { Element } from './dom'
import { element, text } from './dom'
import Parser from '../Parser'

export default class HtmlParser extends Parser {
	private stack: Element[] = []
	parse(rawText: string) {
		// 初始化parser
		this.rawText = rawText.trim()
		this.length = this.rawText.length
		this.index = 0
		this.stack = []

		return this.parseHTML()
	}

	parseHTML() {
		const root = element('root')
		this.stack.push(root)

		while (this.notParseOver) {
			this.removeSpace()
			if (this.rawText.startsWith('</')) {
				this.parseCloseTag()
			} else if (this.rawText.startsWith('<')) {
				this.parseElement()
			} else {
				this.parseText()
			}
			this.index++
		}
		return root.children[0]
	}
	private parseElement() {
		this.index++ // 消费 < 符号

		const tag = this.parseTag()

		const el = element(tag)

		// 将新的节点作为前一个解析出的非文本节点的子元素
		this.stack.at(-1)
			.children.push(el)

		this.parseAttrs(el)

		// 将新解析出来的节点压入栈中
		this.stack.push(el)

		this.removeSpace()

		// 一个标签内容结束
		if (this.notParseOver && this.rawText.startsWith('</')) { // 闭合标签
			this.parseCloseTag()
		} else if (this.notParseOver && this.currentChar === '<') { // 一个新的标签开始
			this.parseElement()
		} else { // 文本内容
			this.parseText()
		}
	}
	private parseAttrs(element: Element) {
		// parseAttrs 前一步 有进行slice操作，可以保证index = 0
		while (this.notParseOver && this.currentChar !== '>') {
			this.removeSpace()
			this.parseAttr(element)
			this.removeSpace()
		}
		// 这里说明遇到 > 符号
		this.index++ // 消费 > 符号
	}
	private parseAttr(element: Element) {
		let key = '', value = ''
		// 获取属性的key（parseAttrs 前一步 有进行slice操作，可以保证index = 0）
		while (this.notParseOver && !['>', '='].includes(this.currentChar)) {
			key += this.rawText[this.index++].trim()
		}

		this.sliceText()

		this.removeSpace()
		this.index++ // 消费 =
		this.removeSpace()
		let startSymbol = ''
		// 可能是单引号也可能是双引号
		if (['\'', '"'].includes(this.currentChar)) {
			startSymbol = this.currentChar
			this.index++ // 消费开始引号
		}

		// 获取属性值
		while (this.notParseOver && ![startSymbol, '>'].includes(this.currentChar)) {
			value += this.rawText[this.index++]
		}
		this.index++ // 消费结束引号
		value = value.trim()

		element.attributes[key] = value
	}
	private parseTag() {
		this.removeSpace()
		let tag = ''
		while (![' ', '>'].includes(this.currentChar)) {
			tag += this.rawText[this.index++]
		}
		this.sliceText()
		return tag
	}
	private parseCloseTag() {
		this.index += 2 // 消费 </ 符号
		let tag = ''
		while (this.notParseOver && this.currentChar !== '>') {
			tag += this.rawText[this.index++]
		}
		this.index++ // 消费闭合标签的 > 符号

		const lastNode = this.stack.at(-1)
		if (tag === lastNode.tagName) {
			this.stack.pop()
			this.removeSpace()
			// 一轮结束后会执行最外层的while循环，这个while循环结束时会递增index，会跳过一个未消费的符号，所以在这里进行递减操作
			this.index--
		} else {
			throw Error('错误的结束标签')
		}
	}
	private parseText() {
		let content = ''
		// 在遇到 < 前，都是文本部分
		while (this.notParseOver && this.currentChar !== '<') {
			content += this.rawText[this.index++]
		}

		// Text 节点不会有子节点，因此parent 必然是 Element
		this.stack.at(-1)
			.children.push(text(content.trim()))

		this.removeSpace() // 目的是为了切除已消费的html字符

		if (this.notParseOver && this.rawText.startsWith('</')) { // 遇到闭合标签
			this.parseCloseTag()
		} else { // 遇到一个新的开始标签
			// 一轮解析结束后会执行最外层的while循环，这个while循环结束时会递增index，会跳过一个未消费的符号，所以在这里进行递减操作
			this.index--
			return // 跳出重新执行最外层while循环
		}
	}
}
