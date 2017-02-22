# 水平垂直滚动公用组件 （for vue)

```
* 支持功能：
    1\. 水平、垂直滚动（默认是水平滚动horizontal）
    2\. 滚动元素定位到某一项（居左，居中，居右，居上、居下）
    3\. 滚动至尾部回弹阴影效果
    4\. 滚动时回调
    5\. 滚动完成回调 （支持列表头部和列表尾部滚动完成的回调）
    6\. 滚动超出边界时回调
    7\. 滚动回归边界内部时回调
```

# 使用示例 (xxx.vue)

```
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
```

## 支持功能(API -- props参数):

name                 |     type |  default   |                        description
-------------------- | -------: | :--------: | :--------------------------------------------------------:
scrollDirection      |   string | horizontal |                 滚动方向(horizontal/vertical)
activeEvent          |    Event | undefined  |             滚动列表特定元素的domevent(activeEvent： '')
activeTargetPos      |   String |   center   | 所传入的滚动DOM的位置(水平滚动center/left/right, 垂直滚动center/top/bottom)
moveCallback         | Function |   i => 0   |                         滚动过程中的回调函数
afterRelease         | Function |   i => 0   |                    列表尾部滚动完成释放touch的回调函数
beforeRelease        | Function |   i => 0   |                    列表头部滚动完成释放touch的回调函数
beyondCallback       | Function |   i => 0   |                         滚动时超出更多时回调
cancelBeyondCallback | Function |   i => 0   |                        滚动时取消超出更多时回调
moreShadow           |  Boolean |   false    |                  滚动至尾部是否展示阴影效果（仅对水平滑动有效）
