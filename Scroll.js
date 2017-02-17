require('./scroll.less');

export default {
    data() {
        return {
            scrollerStyle: {
                transform: 'translate(0px, 0px) translateZ(0px)',
                transitionDuration: '0ms'
            },
            timer: null,
            maxScrollX: 0,
            maxScrollY: 0,
            startX: 0,
            startY: 0,
            distX: 0,
            distY: 0,
            x: 0,
            y: 0,
            directionX: 0,
            directionY: 0,
            endTime: 0,
            ircular: {
                style: 'cubic-bezier(0.1, 0.57, 0.1, 1)',	// Not properly "circular" but this looks better, it should be (0.075, 0.82, 0.165, 1)
                fn: function (k) {
                    return Math.sqrt(1 - (--k * k));
                }
            }
            // quadratic: {
            //     style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            //     fn: function (k) {
            //         return k * (2 - k);
            //     }
            // }
        };
    },
    props: {
        scrollDirection: {
            type: String,
            default: 'horizontal'  // 滑动方向  h为水平， v为垂直方向
        },
        activeTargetPos: {
            type: String,
            default: 'center'  // active dom位置
        },
        moreShadow: {
            type: Boolean,
            default: false  // 阴影部分展示
        },
        activeEvent: {
            // active dom
            type: Event,
            default: undefined
        },
        moveCallback: {
            // 滚动时回调
            type: Function,
            default: i => 0
        },
        beyondCallback: {
            // 滚动时超出更多时回调
            type: Function,
            default: i => 0
        },
        cancelBeyondCallback: {
            // 滚动时取消超出更多时回调
            type: Function,
            default: i => 0
        },
        afterRelease: {
            // 列表尾部滚动完成回调
            type: Function,
            default: i => 0
        },
        beforeRelease: {
            // 列表头部滚动完成回调
            type: Function,
            default: i => 0
        }
    },
    watch: {
        activeEvent() {
            const {activeEvent, wrapperWidth, wrapperHeight, maxScrollX, maxScrollY, activeTargetPos} = this;
            const activeTarget = activeEvent.target;
            const actPW = Math.min(wrapperWidth, document.body.clientWidth); // 滚动块的显示区域
            const actW = activeTarget.clientWidth; // 当前元素内容
            const actPH = Math.min(wrapperHeight, document.body.clientHeight); // 滚动块的显示区域
            const actH = activeTarget.clientHeight; // 当前元素内容
            let newX = activeTarget.offsetLeft - actPW / 2;
            let newY = activeTarget.offsetTop - actPH / 2;
            switch (activeTargetPos) {
                case 'left':case 'top':
                    newX = activeTarget.offsetLeft - actPW / 5;
                    newY = activeTarget.offsetTop - actPH / 5;
                    break;
                case 'right':case 'bottom':
                    newX = activeTarget.offsetLeft - actPW * 2 / 3;
                    newY = activeTarget.offsetTop - actPH * 2 / 3;
                    break;
                case 'center':
                    newX = activeTarget.offsetLeft - actPW / 2;
                    newY = activeTarget.offsetTop - actPH / 2;
                    break;
                default:
                    newX = activeTarget.offsetLeft - actPW / 2;
                    newY = activeTarget.offsetTop - actPH / 2;
            }
            newX = newX < 0 ? 0 : (newX > actW - maxScrollX ? -this.x : newX);
            newY = newY < 0 ? 0 : (newY > actH - maxScrollY ? -this.y : newY);
            this.translateTo(-newX, -newY, 300);
        }
    },
    methods: {
        momentum(current, start, time, lowerMargin, wrapperSize, deceleration) {
            let distance = current - start;
            const speed = Math.abs(distance) / time;
            // 减速变量
            deceleration = deceleration === undefined ? 0.0006 : deceleration;
            // 减速路程
            let destination = current + (speed * speed) / (2 * deceleration) * (distance < 0 ? -1 : 1);
            // 持续时间
            let duration = speed / deceleration;
            if (destination < lowerMargin) {
                destination = wrapperSize ? lowerMargin - (wrapperSize / 2.5 * (speed / 8)) : lowerMargin;
                destination = Math.max(destination, lowerMargin);
                distance = Math.abs(destination - current);
                duration = distance / speed;
            }
            else if (destination > 0) {
                // 向右
                // destination = wrapperSize ? wrapperSize / 2.5 * (speed / 8) : 0;
                destination = 0;
                distance = Math.abs(current) + destination;
                duration = distance / speed;
            }
            return {
                destination: Math.floor(destination),
                duration: Math.min(Math.round(duration), 300)
            };
        },
        refresh() {
            const scroller = this.$refs.scroll;
            const wrapper = this.$refs.scroll.parentElement;
            this.scroller = scroller;
            this.wrapper = wrapper;
            // wrapper
            this.wrapperWidth = wrapper.clientWidth;
            this.wrapperHeight = wrapper.clientHeight;
            // scroller
            this.scrollerWidth = scroller.clientWidth;
            this.scrollerHeight = scroller.clientHeight;
            // maxScroll
            this.maxScrollX	= this.wrapperWidth - this.scrollerWidth;
            this.maxScrollY = this.wrapperHeight - this.scrollerHeight;

            this.endTime = 0;
            this.directionX = 0;
            this.directionY = 0;
            this.hasHorizontalScroll = this.maxScrollX < 0;
            this.hasVerticalScroll = this.maxScrollY < 0;
            this.translateTo(0, 0);
            // reset moreShadow
            if (this.scrollDirection === 'vertical') {
                this.moreShadow = false;
            }
        },
        calcPath(x) {
            x = x < 0 ? Math.max(Math.floor(100 + (x - this.maxScrollX) / 5), 94) : 100;
            return `M100 0 C ${x} 5, ${x} 95, 100 100`;
        },
        translateTo(x = 0, y = 0, time = 0) {
            x = Math.round(x);
            y = Math.round(y);
            this.scrollerStyle = {
                transform: `translate(${x}px, ${y}px) translateZ(0px)`,
                transitionDuration: `${time}ms`
            };
            this.x = x;
            this.y = y;
        },
        rAF(callback) {
            this.timer = setTimeout(callback, 1000 / 60);
        },
        animateTo(destX, destY, duration) {
            const that = this;
            const startX = this.x;
            const startY = this.y;
            const startTime = this.getCurrentTime();
            const destTime = startTime + duration;
            // 缓动
            function step() {
                let now = that.getCurrentTime();
                if (now >= destTime) {
                    that.isAnimating = false;
                    that.translateTo(destX, destY);
                    return;
                }
                now = (now - startTime) / duration;
                const easing = Math.sqrt(1 - (--now * now));
                const newX = (destX - startX) * easing + startX;
                const newY = (destY - startY) * easing + startY;
                that.translateTo(newX, newY, duration);
                if (that.isAnimating) {
                    that.rAF(step);
                }
            }
            this.isAnimating = true;
            step();
        },
        scrollTo(x, y, time) {
            if (!time) {
                this.translateTo(x, y);
            }
            else {
                this.animateTo(x, y, time);
            }
        },
        getCurrentTime() {
            // 获取当前时间
            return Date.now() || new Date().getTime();
        },
        // calcPos(e) {
        //     // point 触点
        //     const point = e.changedTouches ? e.changedTouches[0] : e;
        //     const deltaX = point.clientX - this.pointX; // 当前触点的clientX - 开始时的clientX = 触点档次增量x
        //     const deltaY = point.clientY - this.pointY;    // 触点增量y
        //     const absX = Math.abs(deltaX);
        //     const absY = Math.abs(deltaY);
        //     return {
        //         deltaX,
        //         deltaY,
        //         absX,
        //         absY
        //     };
        // },
        onTouchstart(e) {
            const point = e.touches ? e.touches[0] : e;
            // 初始化数据
            // this.moved = false;    // 是否移动的标志
            this.distX = 0;        //
            this.distY = 0;        //
            this.directionX = 0;    // x方向移动数
            this.directionY = 0;    // y方向移动数
            // this.directionLocked = 0;    // 方向锁
            // 开始时间
            this.startTime = this.getCurrentTime();
            // scroller开始位置x开始位置
            this.startX = this.x || 0;
            this.startY = this.y || 0;
            // 触点
            this.pointX = point.clientX;
            this.pointY = point.clientY;
            this.translateTo(this.x, this.y);
            clearTimeout(this.timer);
        },
        onTouchmove(e) {
            // const pos = this.calcPos(e);
            // point 触点
            const point = e.changedTouches ? e.changedTouches[0] : e;
            let deltaX = point.clientX - this.pointX; // 当前触点的clientX - 开始时的clientX = 触点档次增量x
            let deltaY = point.clientY - this.pointY;    // 触点增量y
            // const absX = Math.abs(deltaX);
            // const absY = Math.abs(deltaY);
            const timestamp = this.getCurrentTime();
            // 最近上一次的触点位置
            this.pointX = point.clientX;
            this.pointY = point.clientY;
            // 触点移动的距离
            this.distX += deltaX;
            this.distY += deltaY;
            const absDistX = Math.abs(this.distX);
            const absDistY = Math.abs(this.distY);
            if (this.scrollDirection === 'horizontal') {
                if (absDistY > absDistX) {
                    return;
                }
            }
            if (this.scrollDirection === 'vertical') {
                e.preventDefault();
                if (absDistY < absDistX) {
                    return;
                }
            }
            // 触点至少移动10px才会触发scroll的move 并且 移动大于300ms

            if (timestamp - this.endTime > 300 && (absDistX < 10 && absDistY < 10)) {
                return;
            }
            deltaX = this.hasHorizontalScroll ? deltaX : 0;
            deltaY = this.hasVerticalScroll ? deltaY : 0;
            // // this.x this.y 是最近上一次的scroller位置
            let newX = this.x + deltaX;
            let newY = this.y + deltaY;
            if (newX > 0 || newX < this.maxScrollX) {
                newX = this.x + deltaX / 3;
            }
            if (newY > 0 || newY < this.maxScrollY) {
                newY = this.y + deltaY / 3;
            }
            this.directionX = deltaX > 0 ? 1 : deltaX < 0 ? -1 : 0;    // -1 手势向左   1 手势向右
            this.directionY = deltaY > 0 ? 1 : deltaY < 0 ? -1 : 0; // -1 手势向上   1 手势向下
            //
            // this.moved = true;
            if (this.scrollDirection === 'horizontal') {
                newY = 0;
            }
            else {
                newX = 0;
            }
            this.translateTo(newX, newY);
            if (timestamp - this.startTime > 300) {
                // 300ms更新一次
                this.startTime = timestamp;
                this.startX = this.x;
                this.startY = this.y;
            }
            // 回弹阴影效果大小
            if (this.moreShadow && this.scrollDirection === 'horizontal') {
                this.path = this.calcPath(newX);
            }
            // 滚动时回调
            if (typeof this.moveCallback === 'function') {
                this.moveCallback();
            }
            // 滚动超出时回调
            if (typeof this.beyondCallback === 'function') {
                const beyondStatus = this.scrollDirection === 'horizontal'
                ? this.x <= this.maxScrollX : this.y <= this.maxScrollY;
                beyondStatus && this.beyondCallback();
            }
            // 滚动超出取消时回调
            if (typeof this.cancelBeyondCallback === 'function') {
                const cancelBeyondStatus = this.scrollDirection === 'horizontal'
                ? (newX > this.maxScrollX || this.directionX === 1)
                : (newY > this.maxScrollY || this.directionY === 1);
                cancelBeyondStatus && this.cancelBeyondCallback();
            }
        },
        onTouchend(e) {
            this.path = this.calcPath(0);
            this.endTime = this.getCurrentTime();
            const duration = this.endTime - this.startTime;
            const absDistX = Math.abs(this.distX);
            const absDistY = Math.abs(this.distY);
            // 触点至少移动10px才会触发scroll的move 并且 移动大于300ms
            // if (duration < 300 && (absDistX < 10 && absDistY < 10)) {
            //     return;
            // }
            if (this.scrollDirection === 'horizontal') {
                if (absDistY >= absDistX) {
                    return;
                }
            }
            if (this.scrollDirection === 'vertical') {
                if (absDistY <= absDistX) {
                    return;
                }
            }
            let newX = Math.round(this.x);
            let newY = Math.round(this.y);
            // let distanceX = Math.abs(newX - this.startX);    // 单次移动过程的x轴移动距离
            // let distanceY = Math.abs(newY - this.startY);
            const momentumX = this.hasHorizontalScroll
            ? this.momentum(this.x, this.startX, duration, this.maxScrollX, this.wrapperWidth)
            : {destination: newX, duration: 0};
            const momentumY = this.hasVerticalScroll
            ? this.momentum(this.y, this.startY, duration, this.maxScrollY, this.wrapperHeight)
            : {destination: newY, duration: 0};
            newX = momentumX.destination;
            newY = momentumY.destination;
            const time = Math.max(momentumX.duration, momentumY.duration);
            if (newX !== this.x || newY !== this.y) {
                this.scrollTo(newX, newY, time);
            }
            // 滚动完成时尾部回调
            if (typeof this.afterRelease === 'function') {
                if ((newX <= this.maxScrollX && !~this.directionX) || (newY <= this.maxScrollY && !~this.directionY)) {
                    this.afterRelease();
                }
            }
            // 滚动完成时头部回调
            if (typeof this.beforeRelease === 'function') {
                if ((newX >= 0 && this.directionX === 1) || (newY >= 0 && this.directionY === 1)) {
                    this.beforeRelease();
                }
            }
        }
    },
    render(h) {
        const shadowSvgEle = this.moreShadow && (
            <svg class="scroll-shadow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                <path d={this.path} stroke="transparent" fill="#e7e7e7" />
            </svg>
        );
        const scrollClass = {
            inner: `scroll-${this.scrollDirection}-inner`,
            item: `scroll-${this.scrollDirection}-item`
        };
        return this.$slots.default && (
            <div class='scroll-wrap'>
                <div
                    class={scrollClass.inner}
                    ref="scroll"
                    style={this.scrollerStyle}
                    on-touchstart={this.onTouchstart}
                    on-touchmove={this.onTouchmove}
                    on-touchend={this.onTouchend}
                >
                    {
                        this.$slots.default.map(vnode => {
                            const vnodeEle = vnode.tag ? vnode : null;
                            return vnodeEle && (
                                <div class={scrollClass.item}>
                                    {vnodeEle}
                                </div>
                            );
                        })
                    }
                </div>
                {shadowSvgEle}
            </div>
        );
    },
    mounted() {
        this.$nextTick(() => {
            this.refresh();
        });
    }
};
