import HTMLParser from './htmlParser'
import CSSParser from './cssParser'

const html = `
	<div class =  " wrap box" id="container  "   >
		this is a text
		<div class=" child " data-index="2"  >
			<div class="grand-son">
				这是一段文本
			</div>
		</div>
  </div>
`
const htmlParser = new HTMLParser()
const htmlTree = htmlParser.parseHTML(html)
console.log('------------------htmlTree------------------')
console.log(
	JSON.stringify(htmlTree, null, 2)
)

const css = `
	.box,
	.warp,
	li,
	#container {
		color: #999;
		font-size: 15px;
		border: 1px solid #666;
	}
	body, .grand-son {
		background-color: rgba(247, 247, 247, 0.7);
	}
`
const cssParser = new CSSParser()
const cssRule = cssParser.parseCSS(css)
console.log('------------------cssRules------------------')
console.log(
	JSON.stringify(cssRule, null, 2)
)
