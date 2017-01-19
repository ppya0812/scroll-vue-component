# 水平垂直滚动公用组件 （for vue2.0)
    使用方法： import scroll from 'xxx路径/scroll.js'
    支持功能：
        1. 水平、垂直滚动（默认是水平滚动horizontal）
        2. 滚动元素定位到某一项（居左，居中，居右，居上、居下）
        3. 滚动至尾部回弹阴影效果
        4. 滚动时回调
        5. 滚动完成回调

## 需传入props参数：
        1. 滚动方向： scrollDirection: horizontal （可不传)
            scrollDirection: {
                type: String,
                default: 'horizontal'
            }

        2. 当前列表特定元素的dom： activeEvent： ''
            activeEvent: {
                type: Event,
                default: undefined
            }

        3. 所传入的DOM的位置： activeTargetPos： center/left/right (默认center)
            activeTargetPos: {
                type: String,
                default: 'center'
            }

        4. 滚动过程中的回调函数
                moveCallback: {
                    type: Function,
                    default: i => 0
                }

        5. 滚动完成释放touch的回调函数
                afterRelease: {
                    type: Function,
                    default: i => 0
                }
                
        6. 滚动至尾部是否展示阴影效果（仅对水平滑动有效）
                moreShadow: {
                    type: Boolean,
                    default: false
                }
