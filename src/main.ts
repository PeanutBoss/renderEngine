import HTMLParser from './htmlParser'
import CSSParser from './cssParser'
import { buildStyleTree, StyleNode } from './buildStyleTree'
import { getLayoutTree } from './layout'
import Dimensions from './layout/Dimensions'

const html = `
	<html class="root wrap" id="13579" style="padding: 10px">
		<body class="color-red">
			<div class =  " wrap box" id="container  "   >
				this is a text
				<div class=" child " data-index="2"  >
					<div class="grand-son" style="height: 20px">
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
	* {
		display: block;
	}
`
const cssParser = new CSSParser()
const cssRule = cssParser.parse(css)
console.log('------------------cssRules------------------')
console.log(
	JSON.stringify(cssRule, null, 2)
)

const styleTree = buildStyleTree(htmlTree, cssRule) as StyleNode
console.log('------------------styleTree------------------')
console.log(
	JSON.stringify(styleTree, null, 2)
)

const dimensions = new Dimensions()
dimensions.content.width = 600
dimensions.content.height = 800
console.log('------------------layoutTree------------------')
console.log(
	JSON.stringify(getLayoutTree(styleTree, dimensions))
)
