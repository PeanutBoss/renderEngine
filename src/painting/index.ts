import type LayoutBox from '../layout/LayoutBox'
import {NodeType} from '../htmlParser/dom'

export default function painting(layoutBox: LayoutBox, canvas?: HTMLCanvasElement) {
	const { x, y, width, height } = layoutBox.dimensions.content
	const canvasEl = canvas || createCanvas(width + x, height + y)
	const ctx: CanvasRenderingContext2D = canvasEl.getContext('2d')

	ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)

	ctx.fillStyle = '#fff'
	ctx.fillRect(x, y, width, height)

	renderLayoutBox(layoutBox, ctx)
}

function createCanvas(width, height): HTMLCanvasElement {
	const canvas = document.createElement('canvas')
	canvas.width = width
	canvas.height = height
	canvas.style.border = '1px solid #000'
	document.body.append(canvas)
	return canvas
}

function renderLayoutBox(layoutBox: LayoutBox, ctx: CanvasRenderingContext2D, parent?: LayoutBox) {
	// 开启新一轮的渲染时重置填充色
	ctx.fillStyle = 'transparent'

	renderBackground(layoutBox, ctx)
	renderBorder(layoutBox, ctx)
	renderText(layoutBox, ctx, parent)

	for (const child of layoutBox.children) {
		renderLayoutBox(child, ctx, layoutBox)
	}
}
function renderBackground(layoutBox: LayoutBox, ctx: CanvasRenderingContext2D) {
	const { x, y, width, height } = layoutBox.dimensions.content
	ctx.fillStyle = layoutBox.styleNode?.value['background-color']
	ctx.fillRect(x, y, width, height)
}
function renderBorder(layoutBox: LayoutBox, ctx: CanvasRenderingContext2D) {
	const { x, y, width, height } = layoutBox.dimensions.borderBox()
	const { left, top, right, bottom } = layoutBox.dimensions.border
	const borderColor = layoutBox.styleNode?.value['border-color']
	if (!borderColor) return

	ctx.fillStyle = borderColor

	// 上右下左
	ctx.fillRect(x, y, width, top)
	ctx.fillRect(x + width - right, y, right, height)
	ctx.fillRect(x, y + height - bottom, width, bottom)
	ctx.fillRect(x, y, left, height)
}
function renderText(layoutBox: LayoutBox, ctx: CanvasRenderingContext2D, parent?: LayoutBox) {
	if (layoutBox.styleNode?.node.nodeType === NodeType.Text) {
		const { x = 0, y = 0, width } = parent?.dimensions.content || {}
		const styles = layoutBox.styleNode?.value || {}
		const fontSize = styles['font-size'] || '14px'
		const fontFamily = styles['font-family'] || 'serif'
		const fontWeight = styles['font-weight'] || 'normal'
		const fontStyle = styles['font-style'] || 'normal'

		ctx.fillStyle = '#333'
		ctx.font = `${fontStyle} ${fontWeight} ${fontSize} ${fontFamily}`
		ctx.fillText(layoutBox.styleNode.node.nodeValue, x, y + parseInt(fontSize), width)
	}
}

export function renderExportButton(canvas: HTMLCanvasElement) {
	const btn = document.createElement('button')
	btn.style.marginTop = '10px'
	btn.innerText = '导出图片'
	btn.onclick = () => {
		exportPNG(canvas)
	}
	document.body.append(btn)
}

function exportPNG(canvas: HTMLCanvasElement) {
	canvas.toBlob(blob => {
		let downloadLink: HTMLAnchorElement | null = document.createElement('a')
		downloadLink.download = '通过渲染引擎生成的图片.png'
		downloadLink.href = URL.createObjectURL(blob)
		downloadLink.click()

		downloadLink = null
	})
}
