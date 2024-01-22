import HTMLParser from './htmlParser'

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
