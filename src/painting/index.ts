import type LayoutBox from '../layout/LayoutBox'
import { NodeType } from '../htmlParser/dom'
import type { Canvas, CanvasRenderingContext2D } from 'canvas'
import { createCanvas } from 'canvas'
import fs from 'fs'

// 用 import 会报错
// const { createCanvas } = require('canvas')

function painting(layoutBox: LayoutBox, outputPath = '') {
	const { x, y, width, height } = layoutBox.dimensions.content
	const canvas = createCanvas(width, height)
	const ctx = canvas.getContext('2d')

	ctx.fillStyle = '#fff'
	ctx.fillRect(x, y, width, height)

	renderLayoutBox(layoutBox, ctx)
	createPNG(canvas, outputPath)
}

function renderLayoutBox(layoutBox: LayoutBox, ctx: CanvasRenderingContext2D) {

	renderBackground(layoutBox, ctx)
	renderBorder(layoutBox, ctx)
	renderText(layoutBox, ctx)
}
function renderBackground(layoutBox: LayoutBox, ctx: CanvasRenderingContext2D) {}
function renderBorder(layoutBox: LayoutBox, ctx: CanvasRenderingContext2D) {}
function renderText(layoutBox: LayoutBox, ctx: CanvasRenderingContext2D) {}

function createPNG(canvas: Canvas, outputPath: string) {
	canvas.createPNGStream().pipe(fs.createWriteStream(outputPath))
}
