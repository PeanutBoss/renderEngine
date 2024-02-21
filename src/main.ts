import HTMLParser from './htmlParser'
import CSSParser from './cssParser'
import { buildStyleTree } from './buildStyleTree'

const html = `
	<html class="root wrap" id="13579" style="padding: 10px">
		<body class="color-red">
			<div class =  " wrap box" id="container  "   >
				this is a text
				<div class=" child " data-index="2"  style="background: aqua;">
					<div class="grand-son">
						这是一段文本
					</div>
				</div>
			</div>
		</body>
	</html>
`
const htmlParser = new HTMLParser()
const htmlTree = htmlParser.parse(html)
console.log('------------------htmlTree------------------')
console.log(
	JSON.stringify(htmlTree, null, 2)
)

const css = `
	.box,
	.wrap,
	li,
	#container {
		color: #999;
		font-size : 15px;
		border: 1px solid #666;
	}
	body, .grand-son {
		background-color: rgba(247, 247, 247, 0.7);
	}
	.color-red {
		color: red;
	}
`
const cssParser = new CSSParser()
const cssRule = cssParser.parse(css)
console.log('------------------cssRules------------------')
console.log(
	JSON.stringify(cssRule, null, 2)
)

const styleTree = buildStyleTree(htmlTree, cssRule)
console.log('------------------styleTree------------------')
console.log(
	JSON.stringify(styleTree, null, 2)
)
