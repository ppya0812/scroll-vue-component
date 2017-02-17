# 水平垂直滚动公用组件 （for vue2.0)
    * 支持功能：
        1. 水平、垂直滚动（默认是水平滚动horizontal）
        2. 滚动元素定位到某一项（居左，居中，居右，居上、居下）
        3. 滚动至尾部回弹阴影效果
        4. 滚动时回调
        5. 滚动完成回调 （支持列表头部和列表尾部滚动完成的回调）

# 使用方法 (xxx.vue)
    <template>
        <div class="XXX">
            <scroll :activeEvent="activeEvent" :moreShadow="moreShadow" :afterRelease="afterRelease" :beforeRelease="beforeRelease">
                <div class="category-inner">
                    <div v-for="(v, i) in category" :key="v.id" @click="activeIndex" :class="['category-item', { active: v.id === activedCategory }]">
                        {{ v.name }}
                    </div>
                </div>
            </scroll>
        </div>
    </template>
    <script>
        // * 引入
        import Scroll from 'xxx/components/Scroll';
        data() {
            return {
                activeEvent: null,
                moreShadow: true, // 滚动至尾部是否展示阴影效果（仅对水平滑动有效）
                scrollDirection: 'horizontal' // (horizontal/vertical, 默认horizontal)
            };
        },
        methods: {
            activeIndex(e) {
                this.activeEvent = e;
            },
            afterRelease() {
                console.log('afterRelease');
                // TODO: afterRelease
            },
            beforeRelease() {
                console.log('beforeRelease');
                // TODO: beforeRelease
            }
        }
    </script>

## 需传入props参数：

    1. 滚动方向： scrollDirection: horizontal/vertical (默认horizontal)
            scrollDirection: {
                type: String,
                default: 'horizontal'
            }

    2. 滚动列表特定元素的domevent： activeEvent： ''
            activeEvent: {
                type: Event,
                default: undefined
            }

    3. 所传入的滚动DOM的位置：
            水平滚动支持：activeTargetPos： center/left/right (默认center)
            垂直滚动支持：activeTargetPos： center/top/bottom (默认center)
            activeTargetPos: {
                type: String,
                default: 'center'
            }

    4. 滚动过程中的回调函数
                moveCallback: {
                    type: Function,
                    default: i => 0
                }

    5. 列表尾部滚动完成释放touch的回调函数
                afterRelease: {
                    type: Function,
                    default: i => 0
                }
    6. 列表头部滚动完成释放touch的回调函数
                beforeRelease: {
                    type: Function,
                    default: i => 0
                }

    7. 滚动至尾部是否展示阴影效果（仅对水平滑动有效）
                moreShadow: {
                    type: Boolean,
                    default: false
                }
