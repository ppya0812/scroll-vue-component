require('./scroll.less');
let defaultDuration = 300;

export default {
    data() {
        return {
            trackStyle: {
                transform: 'translate(0px, 0px) translateZ(0px)',
                transitionDuration: 0
            },
            oldScroll: 0,
            transitionDuration: defaultDuration,
            maxScrollDis: 0
        };
    },
    props: {
        scrollDirection: {
            type: String,
            // default: 'vertical'
            default: 'horizontal'
        },
        activeTargetPos: {
            // 当前dom位置
            type: String,
            default: 'center'
        },
        activeEvent: {
            // 当前dom位置
            type: Event,
            default: undefined
        },
        moveCallback: {
            // 滚动时回调
            type: Function,
            default: i => 0
        },
        afterRelease: {
            // 滚动完成回调
            type: Function,
            default: i => 0
        },
        moreShadow: {
            // 阴影效果
            type: Boolean,
            default: false
        }
    },
    watch: {
        activeEvent() {
            const {activeEvent, scrollDirection, activeTargetPos, maxScrollDis} = this;
            if (activeEvent) {
                const scrollData = this.calcScroll();
                const {L, pleft, cpLDis, actW, actPW, T, ptop, cpTDis, actH, actPH} = scrollData;
                if (scrollDirection === 'horizontal') {
                    let actDis;
                    let translateX;
                    switch (activeTargetPos) {
                        case 'left':
                            actDis = 0;
                            translateX = Math.floor(cpLDis - actDis - actW);
                            break;
                        case 'right':
                            actDis = actPW - actW;
                            translateX = Math.floor(cpLDis - actDis + actW);
                            break;
                        case 'center':
                            actDis = Math.floor(actPW * .5);
                            translateX = Math.floor(L - actDis - pleft);
                            break;
                        default:
                            actDis = Math.floor(actPW * .5);
                            translateX = Math.floor(actDis - L + pleft);
                    }
                    if (pleft > 0 || translateX < 0) {
                        return;
                    }
                    translateX = -Math.min(maxScrollDis + actW, translateX);
                    this.scrollTo(translateX, 0);
                }
                else if (scrollDirection === 'vertical') {
                    let actDis;
                    let translateY;
                    switch (activeTargetPos) {
                        case 'top':
                            actDis = 0;
                            translateY = Math.floor(cpTDis - actDis - actH);
                            break;
                        case 'bottom':
                            actDis = actPH - actH;
                            translateY = Math.floor(cpTDis - actDis + actH);
                            break;
                        case 'center':
                            actDis = Math.floor(actPH * .5);
                            translateY = Math.floor(T - actDis - ptop);
                            break;
                        default:
                            actDis = Math.floor(actPH * .5);
                            translateY = Math.floor(T - actDis - ptop);
                    }
                    if (ptop > 0 || translateY < 0) {
                        return;
                    }
                    translateY = -Math.min(maxScrollDis + actPH, translateY);
                    this.scrollTo(0, translateY);
                }
            }
        }
    },
    methods: {
        calcPos(e) {
            const x = e.changedTouches[0].clientX;
            const y = e.changedTouches[0].clientY;
            const xd = this.x - x;
            const yd = this.y - y;
            const axd = Math.abs(xd);
            const ayd = Math.abs(yd);
            // const sqrtAbs = Math.floor(Math.sqrt(xd * xd + yd * yd));
            return {
                deltaX: xd,
                deltaY: yd,
                absX: axd,
                absY: ayd
                // sqrtAbs: sqrtAbs
            };
        },
        calcScroll() {
            const activeTarget = this.activeEvent.target;
            const scrollEle = this.$refs.scroll;
            const actW = activeTarget.clientWidth; // 当前元素内容
            const actH = activeTarget.clientHeight;
            const actPW = Math.min(scrollEle.parentElement.clientWidth, document.body.clientWidth); // 滚动块的显示区域
            const actPH = Math.min(scrollEle.parentElement.clientHeight, document.body.clientHeight);
            const L = Math.floor(activeTarget.getBoundingClientRect().left); // 当前元素距视口距离
            const T = Math.floor(activeTarget.getBoundingClientRect().top);
            const pleft = Math.floor(scrollEle.getBoundingClientRect().left); // 滚动块距视口距离
            const ptop = Math.floor(scrollEle.getBoundingClientRect().top);
            const cpLDis = activeTarget.offsetLeft - scrollEle.offsetLeft; // 当前元素距滚动块距离
            const cpTDis = activeTarget.offsetTop - scrollEle.offsetTop;
            return {
                actW,
                actH,
                actPW,
                actPH,
                L,
                T,
                pleft,
                ptop,
                cpLDis,
                cpTDis
            };
        },
        calcPath(scrollX) {
            let x = scrollX < 0 ? Math.max(Math.floor(90 + scrollX / 30), 92) : 100;
            return `M100 0 C ${x} 5, ${x} 95, 100 100`;
        },
        scrollTo(translateX = 0, translateY = 0) {
            this.trackStyle = {
                transform: 'translate(' + translateX + 'px, ' + translateY + 'px) translateZ(0px) translate3d(0, 0, 0)',
                transitionDuration: this.transitionDuration + 'ms'
            };
        },
        onTouchstart(e) {
            if (e.touches.length > 1) {
                return;
            }
            this.x = e.touches[0].clientX;
            this.y = e.touches[0].clientY;
        },
        onTouchmove(e) {
            const pos = this.calcPos(e);
            if ((this.scrollDirection === 'horizontal' && pos.absX <= pos.absY)
                || (this.scrollDirection === 'vertical' && pos.absX >= pos.absY)) {
                    return;
                }
            e.preventDefault();
            if (this.scrollDirection === 'horizontal') {
                // 水平
                const X = pos.deltaX + this.oldScroll;
                let scrollX;
                if (X > 0) {
                    scrollX = -Math.min(X, Math.abs(this.maxScrollDis) * 1.1);
                }
                else {
                    scrollX = Math.min(Math.abs(X),  Math.abs(this.maxScrollDis) * 0.5);
                }
                this.scrollTo(scrollX, 0);
                // 回弹阴影效果大小
                if (this.moreShadow) {
                    this.path = this.calcPath(scrollX);
                }
            }
            else if (this.scrollDirection === 'vertical') {
                // 垂直
                const Y = pos.deltaY + this.oldScroll;
                let scrollY;
                if (Y > 0) {
                    scrollY = -Math.min(Y, Math.abs(this.maxScrollDis) * 1.5);
                }
                else {
                    scrollY = Math.min(Math.abs(Y),  Math.abs(this.maxScrollDis) * 0.5);
                }
                this.scrollTo(0, scrollY);
                // 回弹阴影效果大小
                // if (this.moreShadow) {
                //     this.path = this.calcPath(scrollY);
                // }
            }
            // 滚动时回调
            if (typeof this.moveCallback === 'function') {
                this.moveCallback();
            }
        },
        onTouchend(e) {
            const pos = this.calcPos(e);
            if ((this.scrollDirection === 'horizontal' && pos.absX <= pos.absY)
                || (this.scrollDirection === 'vertical' && pos.absX >= pos.absY)) {
                    return;
                }
            e.preventDefault();
            if (this.scrollDirection === 'horizontal') {
                const X = pos.deltaX + this.oldScroll;
                let scrollX;
                if (X > 0) {
                    scrollX = -Math.min(X, Math.max(this.maxScrollDis, 0));
                }
                else {
                    scrollX = Math.min(Math.abs(X), 0);
                }
                this.oldScroll = -scrollX;
                this.scrollTo(scrollX, 0);
                this.path = this.calcPath(0);
                // 滚动完成回调
                if (typeof this.afterRelease === 'function'
                    && (-scrollX === this.maxScrollDis || (X > 0 && this.maxScrollDis < 0))) {
                    this.afterRelease();
                }
            }
            else if (this.scrollDirection === 'vertical') {
                // 垂直
                const Y = pos.deltaY + this.oldScroll;
                let scrollY;
                if (Y > 0) {
                    scrollY = -Math.min(Y, Math.max(this.maxScrollDis, 0));
                }
                else {
                    scrollY = Math.min(Math.abs(Y), 0);
                }
                this.oldScroll = -scrollY;
                this.scrollTo(0, scrollY);
                // this.path = this.calcPath(0);
                // 滚动完成回调
                if (typeof this.afterRelease === 'function'
                    && (-scrollY === this.maxScrollDis || (Y > 0 && this.maxScrollDis < 0))) {
                    this.afterRelease();
                }
            }
        },
        onTouchcancel(e) {
            console.log('onTouchcancel', e.touches[0]);
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
                    style={this.trackStyle}
                    on-touchstart={this.onTouchstart}
                    on-touchmove={this.onTouchmove}
                    on-touchend={this.onTouchend}
                    on-touchcancel={this.onTouchcancel}
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
        const scrollEle = this.$refs.scroll;
        if (scrollEle) {
            if (this.scrollDirection === 'vertical') {
                // 垂直滚动
                this.maxScrollDis = scrollEle.clientHeight - scrollEle.parentElement.clientHeight;
            }
            else {
                // 水平滚动
                this.maxScrollDis = scrollEle.clientWidth - scrollEle.parentElement.clientWidth;
            }
        }
    }
};
