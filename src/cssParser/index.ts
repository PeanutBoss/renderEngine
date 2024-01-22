import Parser from '../Parser'

interface Rule {
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

export default class CSSParser extends Parser {
	private selectorReg = /\w|-/ // 匹配选择器
	parseCSS(cssText: string): Rule[] {
		const rules: Rule[] = []
		this.rawText = cssText.trim()
		this.length = this.rawText.length
		this.index = 0

		while (this.notParseOver) {
			this.removeSpace()
			rules.push(this.parseRule())
			this.index++
		}

		return rules
	}
	private parseRule() {
		const rule: Rule = { selectors: [], declarations: [] }

		rule.selectors.push(
			...this.parseSelectors()
		)
		rule.declarations.push(
			...this.parseDeclarations()
		)

		return rule
	}
	parseSelectors() {
		const symbols = ['*', '.', '#']
		const selectors = []

		while (this.notParseOver) {
			if (this.selectorReg.test(this.currentChar) || symbols.includes(this.currentChar)) {
				selectors.push(this.parseSelector())
				this.removeSpace()
			} else if (this.currentChar === ',') {
				this.index++ // 消费 ,
				this.removeSpace()
				selectors.push(this.parseSelector())
				this.removeSpace()
			} else if (this.currentChar === '{') {
				this.index++ // 消费 {
				this.removeSpace()
				break
			}
		}

		return selectors
	}
	parseSelector() {
		const selector = createSelector({})
		switch (this.currentChar) {
			case '.':
				this.index++ // 消费 .
				selector.class = this.parseIdentifier()
				break
			case '#':
				this.index++ // 消费#
				selector.id = this.parseIdentifier()
				break
			default:
				selector.tagName = this.parseIdentifier()
		}
		return selector
	}
	parseIdentifier() {
		let identifier = ''
		while (this.notParseOver && this.selectorReg.test(this.currentChar)) {
			identifier += this.currentChar
			this.index++
		}
		return identifier
	}

	parseDeclarations() {
		const declarationList = []

		while (this.notParseOver && this.currentChar !== '}') {
			declarationList.push(this.parseDeclaration())
			this.removeSpace()
		}
		this.index++ // 消费 }

		return declarationList
	}
	parseDeclaration() {
		const declaration: Declaration = { name: '', value: '' }

		let name = ''
		while (this.notParseOver && this.currentChar !== ':') {
			name += this.currentChar
			this.index++
		}
		declaration.name = name
		this.removeSpace()
		this.index++ // 消费 :

		let value = ''
		while (this.notParseOver && this.currentChar !== ';') {
			value += this.currentChar
			this.index++
		}
		declaration.value = value
		this.index++ // 消费 ;

		return declaration
	}
}

function createSelector({ className = '', id = '', tagName = '' }) {
	return {
		class: className,
		id,
		tagName
	}
}
