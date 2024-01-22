export default abstract class Parser {
	protected rawText = ''
	protected index = 0
	protected length = 0
	constructor() {}
	protected removeSpace() {
		while (this.notParseOver && [' ', '\n', '\t', '\r', '\r\n'].includes(this.rawText[this.index])) {
			this.index++
		}
		this.sliceText()
	}
	protected sliceText() {
		this.rawText = this.rawText.slice(this.index)
		this.length = this.rawText.length
		this.index = 0
	}
	protected get notParseOver() {
		return this.index < this.length
	}
	protected get firstChar() {
		if (this.index !== 0) {
			throw Error('某一步操作index未重置')
		}
		return this.currentChar
	}
	protected get currentChar() {
		return this.rawText[this.index]
	}
}
