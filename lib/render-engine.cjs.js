'use strict';

var NodeType;
(function (NodeType) {
    NodeType[NodeType["Element"] = 1] = "Element";
    NodeType[NodeType["Text"] = 3] = "Text";
})(NodeType || (NodeType = {}));
function element(tagName) {
    return {
        tagName,
        attributes: {},
        children: [],
        nodeType: NodeType.Element
    };
}
function text(content) {
    return {
        nodeValue: content,
        nodeType: NodeType.Text
    };
}

class Parser {
    rawText = '';
    index = 0;
    length = 0;
    constructor() { }
    removeSpace() {
        while (this.notParseOver && [' ', '\n', '\t', '\r', '\r\n'].includes(this.rawText[this.index])) {
            this.index++;
        }
        this.sliceText();
    }
    sliceText() {
        this.rawText = this.rawText.slice(this.index);
        this.length = this.rawText.length;
        this.index = 0;
    }
    get notParseOver() {
        return this.index < this.length;
    }
    get firstChar() {
        if (this.index !== 0) {
            throw Error('某一步操作index未重置');
        }
        return this.currentChar;
    }
    get currentChar() {
        return this.rawText[this.index];
    }
}

class HtmlParser extends Parser {
    stack = [];
    parse(rawText) {
        // 初始化parser
        this.rawText = rawText.trim();
        this.length = this.rawText.length;
        this.index = 0;
        this.stack = [];
        return this.parseHTML();
    }
    parseHTML() {
        const root = element('root');
        this.stack.push(root);
        while (this.notParseOver) {
            this.removeSpace();
            if (this.rawText.startsWith('</')) {
                this.parseCloseTag();
            }
            else if (this.rawText.startsWith('<')) {
                this.parseElement();
            }
            else {
                this.parseText();
            }
            this.index++;
        }
        return root.children[0];
    }
    parseElement() {
        this.index++; // 消费 < 符号
        const tag = this.parseTag();
        const el = element(tag);
        // 将新的节点作为前一个解析出的非文本节点的子元素
        this.stack.at(-1)
            .children.push(el);
        this.parseAttrs(el);
        // 将新解析出来的节点压入栈中
        this.stack.push(el);
        this.removeSpace();
        // 一个标签内容结束
        if (this.notParseOver && this.rawText.startsWith('</')) { // 闭合标签
            this.parseCloseTag();
        }
        else if (this.notParseOver && this.currentChar === '<') { // 一个新的标签开始
            this.parseElement();
        }
        else { // 文本内容
            this.parseText();
        }
    }
    parseAttrs(element) {
        // parseAttrs 前一步 有进行slice操作，可以保证index = 0
        while (this.notParseOver && this.currentChar !== '>') {
            this.removeSpace();
            this.parseAttr(element);
            this.removeSpace();
        }
        // 这里说明遇到 > 符号
        this.index++; // 消费 > 符号
    }
    parseAttr(element) {
        let key = '', value = '';
        // 获取属性的key（parseAttrs 前一步 有进行slice操作，可以保证index = 0）
        while (this.notParseOver && !['>', '='].includes(this.currentChar)) {
            key += this.rawText[this.index++].trim();
        }
        this.sliceText();
        this.removeSpace();
        this.index++; // 消费 =
        this.removeSpace();
        let startSymbol = '';
        // 可能是单引号也可能是双引号
        if (['\'', '"'].includes(this.currentChar)) {
            startSymbol = this.currentChar;
            this.index++; // 消费开始引号
        }
        // 获取属性值
        while (this.notParseOver && ![startSymbol, '>'].includes(this.currentChar)) {
            value += this.rawText[this.index++];
        }
        this.index++; // 消费结束引号
        value = value.trim();
        element.attributes[key] = value;
    }
    parseTag() {
        this.removeSpace();
        let tag = '';
        while (![' ', '>'].includes(this.currentChar)) {
            tag += this.rawText[this.index++];
        }
        this.sliceText();
        return tag;
    }
    parseCloseTag() {
        this.index += 2; // 消费 </ 符号
        let tag = '';
        while (this.notParseOver && this.currentChar !== '>') {
            tag += this.rawText[this.index++];
        }
        this.index++; // 消费闭合标签的 > 符号
        const lastNode = this.stack.at(-1);
        if (tag === lastNode.tagName) {
            this.stack.pop();
            this.removeSpace();
            // 一轮结束后会执行最外层的while循环，这个while循环结束时会递增index，会跳过一个未消费的符号，所以在这里进行递减操作
            this.index--;
        }
        else {
            throw Error('错误的结束标签');
        }
    }
    parseText() {
        let content = '';
        // 在遇到 < 前，都是文本部分
        while (this.notParseOver && this.currentChar !== '<') {
            content += this.rawText[this.index++];
        }
        // Text 节点不会有子节点，因此parent 必然是 Element
        this.stack.at(-1)
            .children.push(text(content.trim()));
        this.removeSpace(); // 目的是为了切除已消费的html字符
        if (this.notParseOver && this.rawText.startsWith('</')) { // 遇到闭合标签
            this.parseCloseTag();
        }
        else { // 遇到一个新的开始标签
            // 一轮解析结束后会执行最外层的while循环，这个while循环结束时会递增index，会跳过一个未消费的符号，所以在这里进行递减操作
            this.index--;
            return; // 跳出重新执行最外层while循环
        }
    }
}

class CSSParser extends Parser {
    selectorReg = /\w|-/; // 匹配选择器
    parse(rawText) {
        this.rawText = rawText.trim();
        this.length = this.rawText.length;
        this.index = 0;
        return this.parseCSS();
    }
    parseCSS() {
        const rules = [];
        while (this.notParseOver) {
            this.removeSpace();
            rules.push(this.parseRule());
            this.index++;
        }
        return rules;
    }
    parseRule() {
        const rule = { selectors: [], declarations: [] };
        rule.selectors.push(...this.parseSelectors());
        rule.declarations.push(...this.parseDeclarations());
        return rule;
    }
    parseSelectors() {
        const symbols = ['*', '.', '#'];
        const selectors = [];
        while (this.notParseOver) {
            if (this.selectorReg.test(this.currentChar) || symbols.includes(this.currentChar)) {
                selectors.push(this.parseSelector());
                this.removeSpace();
            }
            else if (this.currentChar === ',') {
                this.index++; // 消费 ,
                this.removeSpace();
                selectors.push(this.parseSelector());
                this.removeSpace();
            }
            else if (this.currentChar === '{') {
                this.index++; // 消费 {
                this.removeSpace();
                break;
            }
        }
        return selectors;
    }
    parseSelector() {
        const selector = createSelector({});
        switch (this.currentChar) {
            case '.':
                this.index++; // 消费 .
                selector.class = this.parseIdentifier();
                break;
            case '#':
                this.index++; // 消费 #
                selector.id = this.parseIdentifier();
                break;
            case '*':
                this.index++; // 消费 *
                selector.tagName = '*';
                break;
            default:
                selector.tagName = this.parseIdentifier();
        }
        return selector;
    }
    parseIdentifier() {
        let identifier = '';
        while (this.notParseOver && this.selectorReg.test(this.currentChar)) {
            identifier += this.currentChar;
            this.index++;
        }
        return identifier;
    }
    parseDeclarations() {
        const declarationList = [];
        while (this.notParseOver && this.currentChar !== '}') {
            declarationList.push(this.parseDeclaration());
            this.removeSpace();
        }
        this.index++; // 消费 }
        return declarationList;
    }
    parseDeclaration() {
        const declaration = { name: '', value: '' };
        let name = '';
        while (this.notParseOver && this.currentChar !== ':') {
            name += this.currentChar;
            this.index++;
        }
        declaration.name = name;
        this.removeSpace();
        this.index++; // 消费 :
        let value = '';
        while (this.notParseOver && this.currentChar !== ';') {
            value += this.currentChar;
            this.index++;
        }
        declaration.value = value;
        this.index++; // 消费 ;
        return declaration;
    }
}
function createSelector({ className = '', id = '', tagName = '' }) {
    return {
        class: className,
        id,
        tagName
    };
}

var Display;
(function (Display) {
    Display["Inline"] = "inline";
    Display["Block"] = "block";
    Display["None"] = "none";
})(Display || (Display = {}));
const inheritableAttrs = ['color', 'font-size'];
function buildStyleTree(els, cssRules) {
    if (Array.isArray(els))
        return els.map(el => getStyleNode(el, cssRules));
    return getStyleNode(els, cssRules);
}
function getStyleNode(ele, cssRules, parent) {
    //  可以继承的样式
    const inheritStyle = getInheritableStyle(parent?.value);
    getGlobbingStyle(cssRules);
    const styleNode = {
        node: ele,
        // 文本节点直接使用可继承的样式 inheritStyle
        // 继承样式优先级比通配样式低 通配样式优先级比本身的低
        value: { ...inheritStyle, ...getGlobbingStyle(cssRules), ...styleByRules(ele, cssRules) },
        children: []
    };
    // 如果是Element，可能存在子节点和内联样式需要处理
    if (ele.nodeType === NodeType.Element) {
        // 内联样式优先级最高
        styleNode.value = { ...styleNode.value, ...inlineStyle(ele) };
        ele.children
            .forEach(child => styleNode.children.push(getStyleNode(child, cssRules, styleNode)));
    }
    removeSurplusSpace(styleNode.value);
    return styleNode;
}
// 获取元素的样式信息
function styleByRules(ele, cssRules) {
    const declarationList = [];
    // 元素上的所有标识（class、id、tagName）
    const nodeIdList = eleIdentifier(ele);
    cssRules.forEach(rule => {
        // 匹配该CSSRule的所有标识符（可能包含 class、id、tagName）
        const ruleIdList = ruleIdentifier(rule.selectors);
        for (let i = 0; i < nodeIdList.length; i++) {
            if (ruleIdList.includes(nodeIdList[i])) {
                declarationList.push(...rule.declarations);
                break;
            }
        }
    });
    return declarationList.reduce((preV, curV) => {
        preV[curV.name] = curV.value;
        return preV;
    }, {});
}
// 获取元素的标识
function eleIdentifier(ele) {
    // 文本节点没有任何标识，不会匹配到任何规则
    if (ele.nodeType === NodeType.Text)
        return [];
    const identifierList = [];
    if (ele.nodeType === NodeType.Element) {
        identifierList.push(ele.tagName);
        if (ele.attributes.class) {
            identifierList.push(...ele.attributes.class.split(' ').map(m => `.${m}`));
        }
        if (ele.attributes.id)
            identifierList.push(`#${ele.attributes.id}`);
    }
    return identifierList;
}
// 获取CSSRule对应的标识
function ruleIdentifier(selectors) {
    return selectors
        .map(m => {
        return {
            id: m.id ? `#${m.id}` : '',
            class: m.class ? `.${m.class}` : '',
            tagName: m.tagName
        };
    })
        .map(m => m.id + m.class + m.tagName);
}
// 获取元素的内联样式
function inlineStyle(el) {
    if (!el.attributes.style)
        return {};
    const styleStrList = el.attributes.style
        .split(';')
        .filter(Boolean); // 内联样式可能以 ; 结尾，split之后可能会多出一个空串，需要过滤掉
    return styleStrList.reduce((preV, curV) => {
        const [key, value] = curV.split(':');
        preV[key] = value;
        return preV;
    }, {});
}
function getInheritableStyle(style) {
    if (!style)
        return {};
    const inheritStyle = {};
    inheritableAttrs.forEach(attr => {
        if (attr in style) {
            inheritStyle[attr] = style[attr];
        }
    });
    return inheritStyle;
}
function removeSurplusSpace(styles) {
    for (const key in styles) {
        styles[key.trim()] = styles[key].trim();
        if (key.trim() !== key)
            delete styles[key];
    }
}
function getDisplayValue(styleNode) {
    return styleNode.value?.display || Display.Inline;
}
function getGlobbingStyle(cssRules) {
    const globbingDeclarations = [];
    for (const rule of cssRules) {
        const isGlobbing = rule.selectors.some(se => se.tagName === '*');
        if (isGlobbing)
            globbingDeclarations.push(...rule.declarations);
    }
    return globbingDeclarations.reduce((preV, curV) => {
        preV[curV.name] = curV.value;
        return preV;
    }, {});
}

class Rect {
    x;
    y;
    width;
    height;
    constructor() {
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
    }
    expandedBy(edge) {
        const rect = new Rect();
        rect.x = this.x - edge.left;
        rect.y = this.y - edge.top;
        rect.width = this.width + edge.left + edge.right;
        rect.height = this.height + edge.top + edge.bottom;
        return rect;
    }
}

// 封装尺寸相关属性的类
class Dimensions {
    content; // 内容区域尺寸
    padding; // 内边距尺寸
    border; // 边框尺寸
    margin; // 外边距尺寸
    // 构造函数，初始化属性并赋值为0
    constructor() {
        const initValue = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
        };
        // 初始化各个范围的尺寸
        this.content = new Rect();
        this.padding = { ...initValue };
        this.border = { ...initValue };
        this.margin = { ...initValue };
    }
    // 计算padding盒的尺寸
    paddingBox() {
        return this.content.expandedBy(this.padding);
    }
    // 计算border盒的尺寸
    borderBox() {
        return this.paddingBox().expandedBy(this.border);
    }
    // 计算margin盒的尺寸
    marginBox() {
        return this.borderBox().expandedBy(this.margin);
    }
}

var BoxType;
(function (BoxType) {
    BoxType["BlockNode"] = "BlockNode";
    BoxType["InlineNode"] = "InlineNode";
    BoxType["AnonymousBlock"] = "AnonymousBlock";
})(BoxType || (BoxType = {}));
class LayoutBox {
    dimensions;
    boxType;
    children;
    styleNode;
    constructor(styleNode) {
        this.boxType = getBoxType(styleNode);
        this.dimensions = new Dimensions();
        this.children = [];
        this.styleNode = styleNode;
    }
    layout(parentBlock) {
        if (this.boxType === BoxType.BlockNode) {
            this.calculateBlockWidth(parentBlock);
            this.calculateBlockPosition(parentBlock);
            this.layoutBlockChildren();
            this.calculateBlockHeight();
        }
    }
    /**
     * @description 计算当前块的宽度
     * @param parentBlock
     */
    calculateBlockWidth(parentBlock) {
        const styleValue = this.styleNode?.value || {};
        /* 计算内容区、边框、内边距、外边距尺寸 */
        let width = styleValue.width ?? 'auto'; // 值为auto时按 0 计算
        let marginLeft = styleValue['margin-left'] || styleValue.margin || 0;
        let marginRight = styleValue['margin-right'] || styleValue.margin || 0;
        const borderLeft = styleValue['border-left'] || styleValue.border || 0;
        const borderRight = styleValue['border-right'] || styleValue.border || 0;
        const paddingLeft = styleValue['padding-left'] || styleValue.padding || 0;
        const paddingRight = styleValue['padding-right'] || styleValue.padding || 0;
        // 当前块总宽度
        const totalWidth = sum(width, marginLeft, marginRight, borderLeft, borderRight, paddingLeft, paddingRight);
        const isWidthAuto = width === 'auto';
        const isMarginLeftAuto = marginLeft === 'auto';
        const isMarginRightAuto = marginRight === 'auto';
        // 根据父级元素的宽度，结合当前元素的外边距调整当前元素的宽度
        const parentWidth = parentBlock.content.width;
        // 当前块的宽度超过了父元素的宽度
        if (!isWidthAuto && totalWidth > parentWidth) {
            // 如果当前块的左右外边距是auto，那么将左右外边距都设置为0
            if (isMarginLeftAuto)
                marginLeft = 0;
            if (isMarginRightAuto)
                marginRight = 0;
        }
        // 根据父子元素宽度的差值，调整当前元素的宽度（可能为负值）
        const underflow = parentWidth - totalWidth;
        // 元素宽度&左外边距&右外边距都不是auto
        if (!isWidthAuto && !isMarginLeftAuto && !isMarginRightAuto) {
            // 如果underflow>0,空余宽度会被分配给右外边距，如果<0，优先从右边截断内容
            marginRight += underflow;
            // 只有右外边距是auto
        }
        else if (!isWidthAuto && !isMarginLeftAuto && isMarginRightAuto) {
            marginRight = underflow;
            // 只有左外边距是auto
        }
        else if (!isWidthAuto && isMarginLeftAuto && !isMarginRightAuto) {
            marginLeft = underflow;
            // 宽度是auto
        }
        else if (isWidthAuto) {
            // 当左右外边距是auto，那么将其设置为0
            if (isMarginLeftAuto)
                marginLeft = 0;
            if (isMarginRightAuto)
                marginRight = 0;
            // 父元素还有富裕空间（underflow>0），设置当前元素宽度为underflow
            if (underflow >= 0)
                width = underflow;
            else {
                // 宽度不可能为负
                width = 0;
                // 优先从右边截断内容
                marginRight += underflow;
            }
            // 宽度有值，左右外边距为auto时，左右外边距平分underflow
        }
        else if (!isWidthAuto && isMarginLeftAuto && isMarginRightAuto) {
            marginLeft = underflow / 2;
            marginRight = underflow / 2;
        }
        /* 设置块的尺寸信息 */
        this.dimensions.content.width = parseInt(width);
        this.dimensions.margin.left = parseInt(marginLeft);
        this.dimensions.margin.right = parseInt(marginRight);
        this.dimensions.border.left = parseInt(borderLeft);
        this.dimensions.border.right = parseInt(borderRight);
        this.dimensions.padding.left = parseInt(paddingLeft);
        this.dimensions.padding.right = parseInt(paddingRight);
    }
    /**
     * @description 计算当前块内容区的位置
     * @param parentBlock
     */
    calculateBlockPosition(parentBlock) {
        const styleValue = this.styleNode?.value || {};
        const { x, y, height } = parentBlock.content;
        this.dimensions.margin.top = transformValueSafe(styleValue['margin-top'] || styleValue.margin || 0);
        this.dimensions.margin.bottom = transformValueSafe(styleValue['margin-bottom'] || styleValue.margin || 0);
        this.dimensions.border.top = transformValueSafe(styleValue['border-top'] || styleValue.border || 0);
        this.dimensions.border.bottom = transformValueSafe(styleValue['border-bottom'] || styleValue.border || 0);
        this.dimensions.padding.top = transformValueSafe(styleValue['padding-top'] || styleValue.padding || 0);
        this.dimensions.padding.bottom = transformValueSafe(styleValue['padding-bottom'] || styleValue.padding || 0);
        this.dimensions.content.x = x + this.dimensions.margin.left + this.dimensions.border.left + this.dimensions.padding.left;
        this.dimensions.content.y = y + height + this.dimensions.margin.top + this.dimensions.border.top + this.dimensions.padding.top;
    }
    /**
     * @description 计算当前块的高度
     */
    calculateBlockHeight() {
        const height = this.styleNode?.value.height;
        if (height)
            this.dimensions.content.height = parseInt(height);
    }
    /**
     * @description 对当前块的子元素进行布局
     */
    layoutBlockChildren() {
        for (const child of this.children) {
            child.layout(this.dimensions);
            this.dimensions.content.height += child.dimensions.marginBox().height;
        }
    }
}
/**
 * @description 计算一组参数的总和
 * @param args 一组参数，可以是字符串或数字
 * @returns 返回参数的总和
 */
function sum(...args) {
    return args.reduce((preV, curV) => {
        if (curV === 'auto')
            return preV;
        return preV + parseInt(String(curV));
    }, 0);
}
/**
 * @description 安全转换数值或字符串值
 * @param value 数值或字符串值
 * @returns 转换后的整数值或0
 */
function transformValueSafe(value) {
    if (value === 'auto')
        return 0;
    return parseInt(String(value));
}
/**
 * @description 获取盒子类型
 * @param styleNode - 样式节点 (可选)
 * @returns BoxType
 */
function getBoxType(styleNode) {
    if (!styleNode)
        return BoxType.AnonymousBlock;
    const display = getDisplayValue(styleNode);
    if (display === Display.Block)
        return BoxType.BlockNode;
    return BoxType.InlineNode;
}

function getLayoutTree(styleNode, parentBlock) {
    parentBlock.content.height = 0;
    // 创建布局树
    const root = buildLayoutTree(styleNode);
    // 布局树创建完成后开始布局操作
    root.layout(parentBlock);
    return root;
}
function buildLayoutTree(styleNode) {
    // 如果该节点的display为none，直接抛出错误
    if (getDisplayValue(styleNode) === Display.None) {
        throw new Error('Root node has display: none');
    }
    // 为styleNode创建布局树
    const layoutBox = new LayoutBox(styleNode);
    let anonymousBlock;
    // 如果styleNode包含子节点
    for (const child of styleNode.children) {
        const childDisplay = getDisplayValue(child);
        // 跳过display为none的子节点
        if (childDisplay === Display.None)
            continue;
        if (childDisplay === Display.Block) {
            anonymousBlock = undefined;
            // 将子节点的布局树添加到父节点的children中
            layoutBox.children.push(buildLayoutTree(child));
        }
        else {
            // 这里针对的是文本节点（inline）
            if (!anonymousBlock) {
                anonymousBlock = new LayoutBox();
                layoutBox.children.push(anonymousBlock);
            }
            anonymousBlock.children.push(buildLayoutTree(child));
        }
    }
    return layoutBox;
}

function painting(layoutBox) {
    const { x, y, width, height } = layoutBox.dimensions.content;
    const canvas = createCanvas(width + x, height + y);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(x, y, width, height);
    renderLayoutBox(layoutBox, ctx);
    renderExportButton(canvas);
}
function createCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.style.border = '1px solid #000';
    document.body.append(canvas);
    return canvas;
}
function renderLayoutBox(layoutBox, ctx, parent) {
    // 开启新一轮的渲染时重置填充色
    ctx.fillStyle = 'transparent';
    renderBackground(layoutBox, ctx);
    renderBorder(layoutBox, ctx);
    renderText(layoutBox, ctx, parent);
    for (const child of layoutBox.children) {
        renderLayoutBox(child, ctx, layoutBox);
    }
}
function renderBackground(layoutBox, ctx) {
    const { x, y, width, height } = layoutBox.dimensions.content;
    ctx.fillStyle = layoutBox.styleNode?.value['background-color'];
    ctx.fillRect(x, y, width, height);
}
function renderBorder(layoutBox, ctx) {
    const { x, y, width, height } = layoutBox.dimensions.borderBox();
    const { left, top, right, bottom } = layoutBox.dimensions.border;
    const borderColor = layoutBox.styleNode?.value['border-color'];
    if (!borderColor)
        return;
    ctx.fillStyle = borderColor;
    // 上右下左
    ctx.fillRect(x, y, width, top);
    ctx.fillRect(x + width - right, y, right, height);
    ctx.fillRect(x, y + height - bottom, width, bottom);
    ctx.fillRect(x, y, left, height);
}
function renderText(layoutBox, ctx, parent) {
    if (layoutBox.styleNode?.node.nodeType === NodeType.Text) {
        const { x = 0, y = 0, width } = parent?.dimensions.content || {};
        const styles = layoutBox.styleNode?.value || {};
        const fontSize = styles['font-size'] || '14px';
        const fontFamily = styles['font-family'] || 'serif';
        const fontWeight = styles['font-weight'] || 'normal';
        const fontStyle = styles['font-style'] || 'normal';
        ctx.fillStyle = '#333';
        ctx.font = `${fontStyle} ${fontWeight} ${fontSize} ${fontFamily}`;
        ctx.fillText(layoutBox.styleNode.node.nodeValue, x, y + parseInt(fontSize), width);
    }
}
function renderExportButton(canvas) {
    const btn = document.createElement('button');
    btn.style.marginTop = '10px';
    btn.innerText = '导出图片';
    btn.onclick = () => {
        exportPNG(canvas);
    };
    document.body.append(btn);
}
function exportPNG(canvas) {
    canvas.toBlob(blob => {
        let downloadLink = document.createElement('a');
        downloadLink.download = '通过渲染引擎生成的图片.png';
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.click();
        downloadLink = null;
    });
}

exports.CSSParser = CSSParser;
exports.Dimensions = Dimensions;
exports.HTMLParser = HtmlParser;
exports.buildStyleTree = buildStyleTree;
exports.getLayoutTree = getLayoutTree;
exports.painting = painting;
