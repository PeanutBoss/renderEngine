import type { StyleNode } from '../buildStyleTree'
import { getDisplayValue, Display } from '../buildStyleTree'
import Dimensions from './Dimensions'

enum BoxType {
	BlockNode = 'BlockNode',
	InlineNode = 'InlineNode',
	AnonymousBlock = 'AnonymousBlock'
}

export default class LayoutBox {
	dimensions: Dimensions
	boxType: BoxType
	children: LayoutBox[]
	styleNode: StyleNode | undefined
	constructor(styleNode?: StyleNode) {
		this.boxType = getBoxType(styleNode)
		this.dimensions = new Dimensions()
		this.children = []
		this.styleNode = styleNode
	}
	layout(parentBlock: Dimensions) {
		if (this.boxType === BoxType.BlockNode) {
			this.calculateBlockWidth(parentBlock)
			this.calculateBlockPosition(parentBlock)
			this.layoutBlockChildren()
			this.calculateBlockHeight()
		}
	}

	/**
	 * @description 计算当前块的宽度
	 * @param parentBlock
	 */
	calculateBlockWidth(parentBlock: Dimensions) {
		const styleValue = this.styleNode?.value || {}
		const parentWidth = parentBlock.content.width

		/* 计算内容区、边框、内边距、外边距尺寸 */
		let width = styleValue.width ?? 'auto' // 值为auto时按 0 计算
		let marginLeft = styleValue['margin-left'] || styleValue.margin || 0
		let marginRight = styleValue['margin-right'] || styleValue.margin || 0

		const borderLeft = styleValue['border-left'] || styleValue.border || 0
		const borderRight = styleValue['border-right'] || styleValue.border || 0

		const paddingLeft = styleValue['padding-left'] || styleValue.padding || 0
		const paddingRight = styleValue['padding-right'] || styleValue.padding || 0

		// 当前块总宽度
		const totalWidth = sum(width, marginLeft, marginRight, borderLeft, borderRight, paddingLeft, paddingRight)

		const isWidthAuto = width === 'auto'
		const isMarginLeftAuto = marginLeft === 'auto'
		const isMarginRightAuto = marginRight === 'auto'

		// 当前块的宽度超过了父元素的宽度
		if (!isWidthAuto && totalWidth > parentWidth) {
			// 如果当前块的左右外边距是auto，那么将左右外边距都设置为0
			if (isMarginLeftAuto) marginLeft = 0
			if (isMarginRightAuto) marginRight = 0
		}

		// 根据父子元素宽度的差值，调整当前元素的宽度（可能为负值）
		const underflow = parentWidth - totalWidth
		// 元素宽度&左外边距&右外边距都不是auto
		if (!isWidthAuto && !isMarginLeftAuto && !isMarginRightAuto) {
			// 如果underflow>0,空余宽度会被分配给右外边距，如果<0，优先从右边截断内容
			marginRight += underflow

			// 只有右外边距是auto
		} else if (!isWidthAuto && !isMarginLeftAuto && isMarginRightAuto) {
			marginRight = underflow

			// 只有左外边距是auto
		} else if (!isWidthAuto && isMarginLeftAuto && !isMarginRightAuto) {
			marginLeft = underflow

			// 宽度是auto
		} else if (isWidthAuto) {
			// 当左右外边距是auto，那么将其设置为0
			if (isMarginLeftAuto) marginLeft = 0
			if (isMarginRightAuto) marginRight = 0
			// 父元素还有富裕空间（underflow>0），设置当前元素宽度为underflow
			if (underflow >= 0) width = underflow
			else {
				// 宽度不可能为负
				width = 0
				// 优先从右边截断内容
				marginRight += underflow
			}

			// 宽度有值，左右外边距为auto时，左右外边距平分underflow
		} else if (!isWidthAuto && isMarginLeftAuto && isMarginRightAuto) {
			marginLeft = underflow / 2
			marginRight = underflow / 2
		}

		/* 设置块的尺寸信息 */
		this.dimensions.content.width = parseInt(width)

		this.dimensions.margin.left = parseInt(marginLeft)
		this.dimensions.margin.right = parseInt(marginRight)

		this.dimensions.border.left = parseInt(borderLeft)
		this.dimensions.border.right = parseInt(borderRight)

		this.dimensions.padding.left = parseInt(paddingLeft)
		this.dimensions.padding.right = parseInt(paddingRight)
	}

	/**
	 * @description 计算当前块内容区的位置
	 * @param parentBlock
	 */
	calculateBlockPosition(parentBlock: Dimensions) {
		const styleValue = this.styleNode?.value || {}

		const { x, y, height } = parentBlock.content

		this.dimensions.margin.top = transformValueSafe(styleValue['margin-top'] || styleValue.margin || 0)
		this.dimensions.margin.bottom = transformValueSafe(styleValue['margin-bottom'] || styleValue.margin || 0)

		this.dimensions.border.top = transformValueSafe(styleValue['border-top'] || styleValue.border || 0)
		this.dimensions.border.bottom = transformValueSafe(styleValue['border-bottom'] || styleValue.border || 0)

		this.dimensions.padding.top = transformValueSafe(styleValue['padding-top'] || styleValue.padding || 0)
		this.dimensions.padding.bottom = transformValueSafe(styleValue['padding-bottom'] || styleValue.padding || 0)

		this.dimensions.content.x = x + this.dimensions.margin.left + this.dimensions.border.left + this.dimensions.padding.left
		this.dimensions.content.y = y + height + this.dimensions.margin.top + this.dimensions.border.top + this.dimensions.padding.top
	}

	/**
	 * @description 计算当前块的高度
	 */
	calculateBlockHeight() {
		const height = this.styleNode?.value.height
		if (height) this.dimensions.content.height = parseInt(height)
	}

	/**
	 * @description 对当前块的子元素进行布局
	 */
	layoutBlockChildren() {
		for (const child of this.children) {
			child.layout(this.dimensions)
			this.dimensions.content.height += child.dimensions.marginBox().height
		}
	}
}

/**
 * @description 计算一组参数的总和
 * @param args 一组参数，可以是字符串或数字
 * @returns 返回参数的总和
 */
function sum(...args: (string|number)[]): number {
	return args.reduce((preV: number, curV) => {
		if (curV === 'auto') return preV
		return preV + parseInt(String(curV))
	}, 0) as number
}


/**
 * @description 安全转换数值或字符串值
 * @param value 数值或字符串值
 * @returns 转换后的整数值或0
 */
function transformValueSafe(value: number | string) {
    if (value === 'auto') return 0
    return parseInt(String(value))
}


/**
 * @description 获取盒子类型
 * @param styleNode - 样式节点 (可选)
 * @returns BoxType
 */
function getBoxType(styleNode?: StyleNode) {
    if (!styleNode) return BoxType.AnonymousBlock

    const display = getDisplayValue(styleNode)
    if (display === Display.Block) return BoxType.BlockNode

    return BoxType.InlineNode
}

