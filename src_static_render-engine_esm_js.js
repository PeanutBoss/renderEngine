"use strict";
/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunkgithub_io_demo"] = self["webpackChunkgithub_io_demo"] || []).push([["src_static_render-engine_esm_js"],{

/***/ "./src/static/render-engine.esm.js":
/*!*****************************************!*\
  !*** ./src/static/render-engine.esm.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   CSSParser: () => (/* binding */ CSSParser),\n/* harmony export */   Dimensions: () => (/* binding */ Dimensions),\n/* harmony export */   HTMLParser: () => (/* binding */ HtmlParser),\n/* harmony export */   buildStyleTree: () => (/* binding */ buildStyleTree),\n/* harmony export */   getLayoutTree: () => (/* binding */ getLayoutTree),\n/* harmony export */   painting: () => (/* binding */ painting),\n/* harmony export */   renderExportButton: () => (/* binding */ renderExportButton)\n/* harmony export */ });\nvar NodeType;\n(function (NodeType) {\n    NodeType[NodeType[\"Element\"] = 1] = \"Element\";\n    NodeType[NodeType[\"Text\"] = 3] = \"Text\";\n})(NodeType || (NodeType = {}));\nfunction element(tagName) {\n    return {\n        tagName,\n        attributes: {},\n        children: [],\n        nodeType: NodeType.Element\n    };\n}\nfunction text(content) {\n    return {\n        nodeValue: content,\n        nodeType: NodeType.Text\n    };\n}\n\nclass Parser {\n    rawText = '';\n    index = 0;\n    length = 0;\n    constructor() { }\n    removeSpace() {\n        while (this.notParseOver && [' ', '\\n', '\\t', '\\r', '\\r\\n'].includes(this.rawText[this.index])) {\n            this.index++;\n        }\n        this.sliceText();\n    }\n    sliceText() {\n        this.rawText = this.rawText.slice(this.index);\n        this.length = this.rawText.length;\n        this.index = 0;\n    }\n    get notParseOver() {\n        return this.index < this.length;\n    }\n    get firstChar() {\n        if (this.index !== 0) {\n            throw Error('某一步操作index未重置');\n        }\n        return this.currentChar;\n    }\n    get currentChar() {\n        return this.rawText[this.index];\n    }\n}\n\nclass HtmlParser extends Parser {\n    stack = [];\n    parse(rawText) {\n        // 初始化parser\n        this.rawText = rawText.trim();\n        this.length = this.rawText.length;\n        this.index = 0;\n        this.stack = [];\n        return this.parseHTML();\n    }\n    parseHTML() {\n        const root = element('root');\n        this.stack.push(root);\n        while (this.notParseOver) {\n            this.removeSpace();\n            if (this.rawText.startsWith('</')) {\n                this.parseCloseTag();\n            }\n            else if (this.rawText.startsWith('<')) {\n                this.parseElement();\n            }\n            else {\n                this.parseText();\n            }\n            this.index++;\n        }\n        return root.children[0];\n    }\n    parseElement() {\n        this.index++; // 消费 < 符号\n        const tag = this.parseTag();\n        const el = element(tag);\n        // 将新的节点作为前一个解析出的非文本节点的子元素\n        this.stack.at(-1)\n            .children.push(el);\n        this.parseAttrs(el);\n        // 将新解析出来的节点压入栈中\n        this.stack.push(el);\n        this.removeSpace();\n        // 一个标签内容结束\n        if (this.notParseOver && this.rawText.startsWith('</')) { // 闭合标签\n            this.parseCloseTag();\n        }\n        else if (this.notParseOver && this.currentChar === '<') { // 一个新的标签开始\n            this.parseElement();\n        }\n        else { // 文本内容\n            this.parseText();\n        }\n    }\n    parseAttrs(element) {\n        // parseAttrs 前一步 有进行slice操作，可以保证index = 0\n        while (this.notParseOver && this.currentChar !== '>') {\n            this.removeSpace();\n            this.parseAttr(element);\n            this.removeSpace();\n        }\n        // 这里说明遇到 > 符号\n        this.index++; // 消费 > 符号\n    }\n    parseAttr(element) {\n        let key = '', value = '';\n        // 获取属性的key（parseAttrs 前一步 有进行slice操作，可以保证index = 0）\n        while (this.notParseOver && !['>', '='].includes(this.currentChar)) {\n            key += this.rawText[this.index++].trim();\n        }\n        this.sliceText();\n        this.removeSpace();\n        this.index++; // 消费 =\n        this.removeSpace();\n        let startSymbol = '';\n        // 可能是单引号也可能是双引号\n        if (['\\'', '\"'].includes(this.currentChar)) {\n            startSymbol = this.currentChar;\n            this.index++; // 消费开始引号\n        }\n        // 获取属性值\n        while (this.notParseOver && ![startSymbol, '>'].includes(this.currentChar)) {\n            value += this.rawText[this.index++];\n        }\n        this.index++; // 消费结束引号\n        value = value.trim();\n        element.attributes[key] = value;\n    }\n    parseTag() {\n        this.removeSpace();\n        let tag = '';\n        while (![' ', '>'].includes(this.currentChar)) {\n            tag += this.rawText[this.index++];\n        }\n        this.sliceText();\n        return tag;\n    }\n    parseCloseTag() {\n        this.index += 2; // 消费 </ 符号\n        let tag = '';\n        while (this.notParseOver && this.currentChar !== '>') {\n            tag += this.rawText[this.index++];\n        }\n        this.index++; // 消费闭合标签的 > 符号\n        const lastNode = this.stack.at(-1);\n        if (tag === lastNode.tagName) {\n            this.stack.pop();\n            this.removeSpace();\n            // 一轮结束后会执行最外层的while循环，这个while循环结束时会递增index，会跳过一个未消费的符号，所以在这里进行递减操作\n            this.index--;\n        }\n        else {\n            throw Error('错误的结束标签');\n        }\n    }\n    parseText() {\n        let content = '';\n        // 在遇到 < 前，都是文本部分\n        while (this.notParseOver && this.currentChar !== '<') {\n            content += this.rawText[this.index++];\n        }\n        // Text 节点不会有子节点，因此parent 必然是 Element\n        this.stack.at(-1)\n            .children.push(text(content.trim()));\n        this.removeSpace(); // 目的是为了切除已消费的html字符\n        if (this.notParseOver && this.rawText.startsWith('</')) { // 遇到闭合标签\n            this.parseCloseTag();\n        }\n        else { // 遇到一个新的开始标签\n            // 一轮解析结束后会执行最外层的while循环，这个while循环结束时会递增index，会跳过一个未消费的符号，所以在这里进行递减操作\n            this.index--;\n            return; // 跳出重新执行最外层while循环\n        }\n    }\n}\n\nclass CSSParser extends Parser {\n    selectorReg = /\\w|-/; // 匹配选择器\n    parse(rawText) {\n        this.rawText = rawText.trim();\n        this.length = this.rawText.length;\n        this.index = 0;\n        return this.parseCSS();\n    }\n    parseCSS() {\n        const rules = [];\n        while (this.notParseOver) {\n            this.removeSpace();\n            rules.push(this.parseRule());\n            this.index++;\n        }\n        return rules;\n    }\n    parseRule() {\n        const rule = { selectors: [], declarations: [] };\n        rule.selectors.push(...this.parseSelectors());\n        rule.declarations.push(...this.parseDeclarations());\n        return rule;\n    }\n    parseSelectors() {\n        const symbols = ['*', '.', '#'];\n        const selectors = [];\n        while (this.notParseOver) {\n            if (this.selectorReg.test(this.currentChar) || symbols.includes(this.currentChar)) {\n                selectors.push(this.parseSelector());\n                this.removeSpace();\n            }\n            else if (this.currentChar === ',') {\n                this.index++; // 消费 ,\n                this.removeSpace();\n                selectors.push(this.parseSelector());\n                this.removeSpace();\n            }\n            else if (this.currentChar === '{') {\n                this.index++; // 消费 {\n                this.removeSpace();\n                break;\n            }\n        }\n        return selectors;\n    }\n    parseSelector() {\n        const selector = createSelector({});\n        switch (this.currentChar) {\n            case '.':\n                this.index++; // 消费 .\n                selector.class = this.parseIdentifier();\n                break;\n            case '#':\n                this.index++; // 消费 #\n                selector.id = this.parseIdentifier();\n                break;\n            case '*':\n                this.index++; // 消费 *\n                selector.tagName = '*';\n                break;\n            default:\n                selector.tagName = this.parseIdentifier();\n        }\n        return selector;\n    }\n    parseIdentifier() {\n        let identifier = '';\n        while (this.notParseOver && this.selectorReg.test(this.currentChar)) {\n            identifier += this.currentChar;\n            this.index++;\n        }\n        return identifier;\n    }\n    parseDeclarations() {\n        const declarationList = [];\n        while (this.notParseOver && this.currentChar !== '}') {\n            declarationList.push(this.parseDeclaration());\n            this.removeSpace();\n        }\n        this.index++; // 消费 }\n        return declarationList;\n    }\n    parseDeclaration() {\n        const declaration = { name: '', value: '' };\n        let name = '';\n        while (this.notParseOver && this.currentChar !== ':') {\n            name += this.currentChar;\n            this.index++;\n        }\n        declaration.name = name;\n        this.removeSpace();\n        this.index++; // 消费 :\n        let value = '';\n        while (this.notParseOver && this.currentChar !== ';') {\n            value += this.currentChar;\n            this.index++;\n        }\n        declaration.value = value;\n        this.index++; // 消费 ;\n        return declaration;\n    }\n}\nfunction createSelector({ className = '', id = '', tagName = '' }) {\n    return {\n        class: className,\n        id,\n        tagName\n    };\n}\n\nvar Display;\n(function (Display) {\n    Display[\"Inline\"] = \"inline\";\n    Display[\"Block\"] = \"block\";\n    Display[\"None\"] = \"none\";\n})(Display || (Display = {}));\nconst inheritableAttrs = ['color', 'font-size'];\nfunction buildStyleTree(els, cssRules) {\n    if (Array.isArray(els))\n        return els.map(el => getStyleNode(el, cssRules));\n    return getStyleNode(els, cssRules);\n}\nfunction getStyleNode(ele, cssRules, parent) {\n    //  可以继承的样式\n    const inheritStyle = getInheritableStyle(parent?.value);\n    getGlobbingStyle(cssRules);\n    const styleNode = {\n        node: ele,\n        // 文本节点直接使用可继承的样式 inheritStyle\n        // 继承样式优先级比通配样式低 通配样式优先级比本身的低\n        value: { ...inheritStyle, ...getGlobbingStyle(cssRules), ...styleByRules(ele, cssRules) },\n        children: []\n    };\n    // 如果是Element，可能存在子节点和内联样式需要处理\n    if (ele.nodeType === NodeType.Element) {\n        // 内联样式优先级最高\n        styleNode.value = { ...styleNode.value, ...inlineStyle(ele) };\n        ele.children\n            .forEach(child => styleNode.children.push(getStyleNode(child, cssRules, styleNode)));\n    }\n    removeSurplusSpace(styleNode.value);\n    return styleNode;\n}\n// 获取元素的样式信息\nfunction styleByRules(ele, cssRules) {\n    const declarationList = [];\n    // 元素上的所有标识（class、id、tagName）\n    const nodeIdList = eleIdentifier(ele);\n    cssRules.forEach(rule => {\n        // 匹配该CSSRule的所有标识符（可能包含 class、id、tagName）\n        const ruleIdList = ruleIdentifier(rule.selectors);\n        for (let i = 0; i < nodeIdList.length; i++) {\n            if (ruleIdList.includes(nodeIdList[i])) {\n                declarationList.push(...rule.declarations);\n                break;\n            }\n        }\n    });\n    return declarationList.reduce((preV, curV) => {\n        preV[curV.name] = curV.value;\n        return preV;\n    }, {});\n}\n// 获取元素的标识\nfunction eleIdentifier(ele) {\n    // 文本节点没有任何标识，不会匹配到任何规则\n    if (ele.nodeType === NodeType.Text)\n        return [];\n    const identifierList = [];\n    if (ele.nodeType === NodeType.Element) {\n        identifierList.push(ele.tagName);\n        if (ele.attributes.class) {\n            identifierList.push(...ele.attributes.class.split(' ').map(m => `.${m}`));\n        }\n        if (ele.attributes.id)\n            identifierList.push(`#${ele.attributes.id}`);\n    }\n    return identifierList;\n}\n// 获取CSSRule对应的标识\nfunction ruleIdentifier(selectors) {\n    return selectors\n        .map(m => {\n        return {\n            id: m.id ? `#${m.id}` : '',\n            class: m.class ? `.${m.class}` : '',\n            tagName: m.tagName\n        };\n    })\n        .map(m => m.id + m.class + m.tagName);\n}\n// 获取元素的内联样式\nfunction inlineStyle(el) {\n    if (!el.attributes.style)\n        return {};\n    const styleStrList = el.attributes.style\n        .split(';')\n        .filter(Boolean); // 内联样式可能以 ; 结尾，split之后可能会多出一个空串，需要过滤掉\n    return styleStrList.reduce((preV, curV) => {\n        const [key, value] = curV.split(':');\n        preV[key] = value;\n        return preV;\n    }, {});\n}\nfunction getInheritableStyle(style) {\n    if (!style)\n        return {};\n    const inheritStyle = {};\n    inheritableAttrs.forEach(attr => {\n        if (attr in style) {\n            inheritStyle[attr] = style[attr];\n        }\n    });\n    return inheritStyle;\n}\nfunction removeSurplusSpace(styles) {\n    for (const key in styles) {\n        styles[key.trim()] = styles[key].trim();\n        if (key.trim() !== key)\n            delete styles[key];\n    }\n}\nfunction getDisplayValue(styleNode) {\n    return styleNode.value?.display || Display.Inline;\n}\nfunction getGlobbingStyle(cssRules) {\n    const globbingDeclarations = [];\n    for (const rule of cssRules) {\n        const isGlobbing = rule.selectors.some(se => se.tagName === '*');\n        if (isGlobbing)\n            globbingDeclarations.push(...rule.declarations);\n    }\n    return globbingDeclarations.reduce((preV, curV) => {\n        preV[curV.name] = curV.value;\n        return preV;\n    }, {});\n}\n\nclass Rect {\n    x;\n    y;\n    width;\n    height;\n    constructor() {\n        this.x = 0;\n        this.y = 0;\n        this.width = 0;\n        this.height = 0;\n    }\n    expandedBy(edge) {\n        const rect = new Rect();\n        rect.x = this.x - edge.left;\n        rect.y = this.y - edge.top;\n        rect.width = this.width + edge.left + edge.right;\n        rect.height = this.height + edge.top + edge.bottom;\n        return rect;\n    }\n}\n\n// 封装尺寸相关属性的类\nclass Dimensions {\n    content; // 内容区域尺寸\n    padding; // 内边距尺寸\n    border; // 边框尺寸\n    margin; // 外边距尺寸\n    // 构造函数，初始化属性并赋值为0\n    constructor() {\n        const initValue = {\n            top: 0,\n            right: 0,\n            bottom: 0,\n            left: 0,\n        };\n        // 初始化各个范围的尺寸\n        this.content = new Rect();\n        this.padding = { ...initValue };\n        this.border = { ...initValue };\n        this.margin = { ...initValue };\n    }\n    // 计算padding盒的尺寸\n    paddingBox() {\n        return this.content.expandedBy(this.padding);\n    }\n    // 计算border盒的尺寸\n    borderBox() {\n        return this.paddingBox().expandedBy(this.border);\n    }\n    // 计算margin盒的尺寸\n    marginBox() {\n        return this.borderBox().expandedBy(this.margin);\n    }\n}\n\nvar BoxType;\n(function (BoxType) {\n    BoxType[\"BlockNode\"] = \"BlockNode\";\n    BoxType[\"InlineNode\"] = \"InlineNode\";\n    BoxType[\"AnonymousBlock\"] = \"AnonymousBlock\";\n})(BoxType || (BoxType = {}));\nclass LayoutBox {\n    dimensions;\n    boxType;\n    children;\n    styleNode;\n    constructor(styleNode) {\n        this.boxType = getBoxType(styleNode);\n        this.dimensions = new Dimensions();\n        this.children = [];\n        this.styleNode = styleNode;\n    }\n    layout(parentBlock) {\n        if (this.boxType === BoxType.BlockNode) {\n            this.calculateBlockWidth(parentBlock);\n            this.calculateBlockPosition(parentBlock);\n            this.layoutBlockChildren();\n            this.calculateBlockHeight();\n        }\n    }\n    /**\n     * @description 计算当前块的宽度\n     * @param parentBlock\n     */\n    calculateBlockWidth(parentBlock) {\n        const styleValue = this.styleNode?.value || {};\n        /* 计算内容区、边框、内边距、外边距尺寸 */\n        let width = styleValue.width ?? 'auto'; // 值为auto时按 0 计算\n        let marginLeft = styleValue['margin-left'] || styleValue.margin || 0;\n        let marginRight = styleValue['margin-right'] || styleValue.margin || 0;\n        const borderLeft = styleValue['border-left'] || styleValue.border || 0;\n        const borderRight = styleValue['border-right'] || styleValue.border || 0;\n        const paddingLeft = styleValue['padding-left'] || styleValue.padding || 0;\n        const paddingRight = styleValue['padding-right'] || styleValue.padding || 0;\n        // 当前块总宽度\n        const totalWidth = sum(width, marginLeft, marginRight, borderLeft, borderRight, paddingLeft, paddingRight);\n        const isWidthAuto = width === 'auto';\n        const isMarginLeftAuto = marginLeft === 'auto';\n        const isMarginRightAuto = marginRight === 'auto';\n        // 根据父级元素的宽度，结合当前元素的外边距调整当前元素的宽度\n        const parentWidth = parentBlock.content.width;\n        // 当前块的宽度超过了父元素的宽度\n        if (!isWidthAuto && totalWidth > parentWidth) {\n            // 如果当前块的左右外边距是auto，那么将左右外边距都设置为0\n            if (isMarginLeftAuto)\n                marginLeft = 0;\n            if (isMarginRightAuto)\n                marginRight = 0;\n        }\n        // 根据父子元素宽度的差值，调整当前元素的宽度（可能为负值）\n        const underflow = parentWidth - totalWidth;\n        // 元素宽度&左外边距&右外边距都不是auto\n        if (!isWidthAuto && !isMarginLeftAuto && !isMarginRightAuto) {\n            // 如果underflow>0,空余宽度会被分配给右外边距，如果<0，优先从右边截断内容\n            marginRight += underflow;\n            // 只有右外边距是auto\n        }\n        else if (!isWidthAuto && !isMarginLeftAuto && isMarginRightAuto) {\n            marginRight = underflow;\n            // 只有左外边距是auto\n        }\n        else if (!isWidthAuto && isMarginLeftAuto && !isMarginRightAuto) {\n            marginLeft = underflow;\n            // 宽度是auto\n        }\n        else if (isWidthAuto) {\n            // 当左右外边距是auto，那么将其设置为0\n            if (isMarginLeftAuto)\n                marginLeft = 0;\n            if (isMarginRightAuto)\n                marginRight = 0;\n            // 父元素还有富裕空间（underflow>0），设置当前元素宽度为underflow\n            if (underflow >= 0)\n                width = underflow;\n            else {\n                // 宽度不可能为负\n                width = 0;\n                // 优先从右边截断内容\n                marginRight += underflow;\n            }\n            // 宽度有值，左右外边距为auto时，左右外边距平分underflow\n        }\n        else if (!isWidthAuto && isMarginLeftAuto && isMarginRightAuto) {\n            marginLeft = underflow / 2;\n            marginRight = underflow / 2;\n        }\n        /* 设置块的尺寸信息 */\n        this.dimensions.content.width = parseInt(width);\n        this.dimensions.margin.left = parseInt(marginLeft);\n        this.dimensions.margin.right = parseInt(marginRight);\n        this.dimensions.border.left = parseInt(borderLeft);\n        this.dimensions.border.right = parseInt(borderRight);\n        this.dimensions.padding.left = parseInt(paddingLeft);\n        this.dimensions.padding.right = parseInt(paddingRight);\n    }\n    /**\n     * @description 计算当前块内容区的位置\n     * @param parentBlock\n     */\n    calculateBlockPosition(parentBlock) {\n        const styleValue = this.styleNode?.value || {};\n        const { x, y, height } = parentBlock.content;\n        this.dimensions.margin.top = transformValueSafe(styleValue['margin-top'] || styleValue.margin || 0);\n        this.dimensions.margin.bottom = transformValueSafe(styleValue['margin-bottom'] || styleValue.margin || 0);\n        this.dimensions.border.top = transformValueSafe(styleValue['border-top'] || styleValue.border || 0);\n        this.dimensions.border.bottom = transformValueSafe(styleValue['border-bottom'] || styleValue.border || 0);\n        this.dimensions.padding.top = transformValueSafe(styleValue['padding-top'] || styleValue.padding || 0);\n        this.dimensions.padding.bottom = transformValueSafe(styleValue['padding-bottom'] || styleValue.padding || 0);\n        this.dimensions.content.x = x + this.dimensions.margin.left + this.dimensions.border.left + this.dimensions.padding.left;\n        this.dimensions.content.y = y + height + this.dimensions.margin.top + this.dimensions.border.top + this.dimensions.padding.top;\n    }\n    /**\n     * @description 计算当前块的高度\n     */\n    calculateBlockHeight() {\n        const height = this.styleNode?.value.height;\n        if (height)\n            this.dimensions.content.height = parseInt(height);\n    }\n    /**\n     * @description 对当前块的子元素进行布局\n     */\n    layoutBlockChildren() {\n        for (const child of this.children) {\n            child.layout(this.dimensions);\n            this.dimensions.content.height += child.dimensions.marginBox().height;\n        }\n    }\n}\n/**\n * @description 计算一组参数的总和\n * @param args 一组参数，可以是字符串或数字\n * @returns 返回参数的总和\n */\nfunction sum(...args) {\n    return args.reduce((preV, curV) => {\n        if (curV === 'auto')\n            return preV;\n        return preV + parseInt(String(curV));\n    }, 0);\n}\n/**\n * @description 安全转换数值或字符串值\n * @param value 数值或字符串值\n * @returns 转换后的整数值或0\n */\nfunction transformValueSafe(value) {\n    if (value === 'auto')\n        return 0;\n    return parseInt(String(value));\n}\n/**\n * @description 获取盒子类型\n * @param styleNode - 样式节点 (可选)\n * @returns BoxType\n */\nfunction getBoxType(styleNode) {\n    if (!styleNode)\n        return BoxType.AnonymousBlock;\n    const display = getDisplayValue(styleNode);\n    if (display === Display.Block)\n        return BoxType.BlockNode;\n    return BoxType.InlineNode;\n}\n\nfunction getLayoutTree(styleNode, parentBlock) {\n    parentBlock.content.height = 0;\n    // 创建布局树\n    const root = buildLayoutTree(styleNode);\n    // 布局树创建完成后开始布局操作\n    root.layout(parentBlock);\n    return root;\n}\nfunction buildLayoutTree(styleNode) {\n    // 如果该节点的display为none，直接抛出错误\n    if (getDisplayValue(styleNode) === Display.None) {\n        throw new Error('Root node has display: none');\n    }\n    // 为styleNode创建布局树\n    const layoutBox = new LayoutBox(styleNode);\n    let anonymousBlock;\n    // 如果styleNode包含子节点\n    for (const child of styleNode.children) {\n        const childDisplay = getDisplayValue(child);\n        // 跳过display为none的子节点\n        if (childDisplay === Display.None)\n            continue;\n        if (childDisplay === Display.Block) {\n            anonymousBlock = undefined;\n            // 将子节点的布局树添加到父节点的children中\n            layoutBox.children.push(buildLayoutTree(child));\n        }\n        else {\n            // 这里针对的是文本节点（inline）\n            if (!anonymousBlock) {\n                anonymousBlock = new LayoutBox();\n                layoutBox.children.push(anonymousBlock);\n            }\n            anonymousBlock.children.push(buildLayoutTree(child));\n        }\n    }\n    return layoutBox;\n}\n\nfunction painting(layoutBox, canvas) {\n    const { x, y, width, height } = layoutBox.dimensions.content;\n    const canvasEl = createCanvas(canvas, width + x, height + y);\n    const ctx = canvasEl.getContext('2d');\n    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);\n    ctx.fillStyle = '#fff';\n    ctx.fillRect(x, y, width, height);\n    renderLayoutBox(layoutBox, ctx);\n}\nfunction createCanvas(canvas, width, height) {\n    if (canvas) {\n        canvas.width = width\n        canvas.height = height\n        return canvas\n    }\n    const canvasEl = document.createElement('canvas');\n    canvasEl.width = width;\n    canvasEl.height = height;\n    canvasEl.style.border = '1px solid #000';\n    document.body.append(canvas);\n    return canvasEl;\n}\nfunction renderLayoutBox(layoutBox, ctx, parent) {\n    // 开启新一轮的渲染时重置填充色\n    ctx.fillStyle = 'transparent';\n    renderBackground(layoutBox, ctx);\n    renderBorder(layoutBox, ctx);\n    renderText(layoutBox, ctx, parent);\n    for (const child of layoutBox.children) {\n        renderLayoutBox(child, ctx, layoutBox);\n    }\n}\nfunction renderBackground(layoutBox, ctx) {\n    const { x, y, width, height } = layoutBox.dimensions.content;\n    ctx.fillStyle = layoutBox.styleNode?.value['background-color'];\n    ctx.fillRect(x, y, width, height);\n}\nfunction renderBorder(layoutBox, ctx) {\n    const { x, y, width, height } = layoutBox.dimensions.borderBox();\n    const { left, top, right, bottom } = layoutBox.dimensions.border;\n    const borderColor = layoutBox.styleNode?.value['border-color'];\n    if (!borderColor)\n        return;\n    ctx.fillStyle = borderColor;\n    // 上右下左\n    ctx.fillRect(x, y, width, top);\n    ctx.fillRect(x + width - right, y, right, height);\n    ctx.fillRect(x, y + height - bottom, width, bottom);\n    ctx.fillRect(x, y, left, height);\n}\nfunction renderText(layoutBox, ctx, parent) {\n    if (layoutBox.styleNode?.node.nodeType === NodeType.Text) {\n        const { x = 0, y = 0, width } = parent?.dimensions.content || {};\n        const styles = layoutBox.styleNode?.value || {};\n        const fontSize = styles['font-size'] || '14px';\n        const fontFamily = styles['font-family'] || 'serif';\n        const fontWeight = styles['font-weight'] || 'normal';\n        const fontStyle = styles['font-style'] || 'normal';\n        ctx.fillStyle = '#333';\n        ctx.font = `${fontStyle} ${fontWeight} ${fontSize} ${fontFamily}`;\n        ctx.fillText(layoutBox.styleNode.node.nodeValue, x, y + parseInt(fontSize), width);\n    }\n}\nfunction renderExportButton(canvas) {\n    const btn = document.createElement('button');\n    btn.style.marginTop = '10px';\n    btn.innerText = '导出图片';\n    btn.onclick = () => {\n        exportPNG(canvas);\n    };\n    document.body.append(btn);\n}\nfunction exportPNG(canvas) {\n    canvas.toBlob(blob => {\n        let downloadLink = document.createElement('a');\n        downloadLink.download = '通过渲染引擎生成的图片.png';\n        downloadLink.href = URL.createObjectURL(blob);\n        downloadLink.click();\n        downloadLink = null;\n    });\n}\n\n\n\n\n//# sourceURL=webpack://github.io.demo/./src/static/render-engine.esm.js?");

/***/ })

}]);