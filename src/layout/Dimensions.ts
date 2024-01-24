import Rect, { EdgeSizes } from './Rect'

// 封装尺寸相关属性的类
export default class Dimensions {
    content: Rect // 内容区域尺寸
    padding: EdgeSizes // 内边距尺寸
    border: EdgeSizes // 边框尺寸
    margin: EdgeSizes // 外边距尺寸

    // 构造函数，初始化属性并赋值为0
    constructor() {
        const initValue = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
        }
				// 初始化各个范围的尺寸
        this.content = new Rect()
        this.padding = { ...initValue }
        this.border = { ...initValue }
        this.margin = { ...initValue }
    }

    // 计算padding盒的尺寸
    paddingBox() {
        return this.content.expandedBy(this.padding)
    }

    // 计算border盒的尺寸
    borderBox() {
        return this.paddingBox().expandedBy(this.border)
    }

    // 计算margin盒的尺寸
    marginBox() {
        return this.borderBox().expandedBy(this.margin)
    }
}


