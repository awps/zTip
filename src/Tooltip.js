export default class Tooltip {
    constructor(selector, options = {}) {
        this.elem = selector

        if (typeof selector === 'string') {
            this.elem = document.querySelectorAll(selector)
        }

        if (this.elem instanceof NodeList) {
            for (let i = 0; i < this.elem.length; i++) {
                new Tooltip(this.elem[i], options);
            }

            return;
        }

        // Prepare options
        // ----------------------------------------------------------------------------
        this.options = {
            // Theme
            theme: 'default',

            // attr:title | > .child-elem | .dom-elem | function callback
            source: 'attr:title',

            // Tooltip position relative to element top | bottom
            position: 'top',

            ...options
        }

        const optionsKeys = Object.keys(this.options);

        for (let i = 0; i < optionsKeys.length; i++) {
            let option = optionsKeys[i]
            let newOptionValue = this.elem.dataset[option];

            if (newOptionValue) {
                this.options[option] = newOptionValue;
            }
        }

        this.holder = this.getHolder();

        this.events();
    }

    events() {
        this.elem.addEventListener('mouseover', () => {
            let tip = this.getElemTip();

            if (!tip) {
                return;
            }

            // Refresh holder theme if needed...
            // plugin.refreshHolderTheme();

            // Add the new tooltip text to holder
            this.holder.querySelector('.zt-text').innerHTML = tip;

            const coords = this.getElementCoordinates();

            // If the target elem is larger than the holder, allow the max-width to be equal to it
            // Window is larger than this element... Ya, that's it...
            if (this.holder.offsetWidth < coords.width) {
                this.holder.style.maxWidth = coords.width + 'px'
            }

            // The magic is here
            this.autoPosition(coords);

            // Finally show it to user.
            this.holder.classList.add('ztip-show');
        });


        // When the mouse leaves the container
        this.elem.addEventListener('mouseout', () => {
            if (this.holder) {
                this.holder.classList.remove('ztip-show');
                this.holder.style = {
                    'top': 0,
                    'right': '',
                    'bottom': '',
                    'left': '-110%',
                    'max-width': '',
                }
            }
        });

        // When the window is modified
        window.onscroll = () => this.hide();
        window.onresize = () => this.hide();
    }

    hide() {
        if (this.holder) {
            this.holder.classList.remove('ztip-show');
        }
    }

    getHolder() {
        const elem = document.querySelector('#ztip-holder');

        // Create the holder that will be used later to display the tooltip
        if (!elem) {
            document.querySelector('body').insertAdjacentHTML(
                'beforeend',
                `<div id="ztip-holder" class="ztip-holder ztip-position-top">
                    <span class="zt-text"></span><span class="zt-arrow"></span>
                </div>`
            )
        }

        return document.querySelector('#ztip-holder');
    }


    getElemTip() {
        // No misleading title buble. The tooltip acts like a replacer for title tag,
        // and even if the source is not the title tag, we must disabe it so only one
        // tip is displayed and that should be ours.
        if (this.elem.title) {
            this.elem.dataset.ztipTitle = this.elem.title
            this.elem.removeAttribute('title');
        }

        // It's a callback
        // if (typeof settings.source === "function") {
        //     return settings.source.call(this, elem);
        // }
        //
        // // The source is the title attribute
        // else if (plugin.stringStartsWith(settings.source, 'attr:title')) {
        return this.elem.getAttribute('data-ztip-title');
        // }
        //
        // // The source is another attribute
        // else if (plugin.stringStartsWith(settings.source, 'attr:')) {
        //     return elem.attr(settings.source.replace('attr:', ''));
        // }
        //
        // // The is a child of this element
        // else if (plugin.stringStartsWith(settings.source, '>')) {
        //     return elem.children(settings.source.replace('>', '')).html();
        // }
        //
        // // Its a DOM element? Probably...
        // else {
        //     return $(settings.source).html();
        // }
    }


    autoPosition(coords) {
        let _top = '',
            _left = '',
            viewport = this.getViewport();

        // It's not wider than current window?
        if (this.holder.offsetWidth > viewport.width) {
            this.holder.style.maxWidth = viewport.width
        }

        // Display on top or bottom?
        // TODO: DRY. The following if else needs improvements
        if ('bottom' === this.options.position) {
            if (this.holder.offsetHeight + 10 > coords.fromBottom) {
                _top = coords.top - this.holder.offsetHeight - 10;
                this.changeHolderPosition('top');
            } else {
                _top = coords.bottom + 10;
                this.changeHolderPosition('bottom');
            }
        } else {
            if (this.holder.offsetHeight + 10 < coords.top) {
                _top = coords.top - this.holder.offsetHeight - 10;
                this.changeHolderPosition('top');
            } else {
                _top = coords.bottom + 10;
                this.changeHolderPosition('bottom');
            }
        }

        // Center tooltip on X axis. If it gets out of viewport realign it.
        const half_holder = this.holder.offsetWidth / 2,
            is_small = this.holder.offsetWidth < viewport.width,
            maybe_left = (viewport.width - this.holder.offsetWidth) / 2;

        // Attempt to align the tooltip based element coordinates
        // We need only the distance from left.
        if (half_holder > coords.centerX) {
            _left = 0;

            if (is_small && maybe_left < coords.left) {
                _left = maybe_left;
            } else if (coords.fromRight + coords.width > this.holder.offsetWidth) {
                _left = coords.left;
            }
        } else if (half_holder < coords.centerX && viewport.width - coords.centerX < half_holder) {
            _left = viewport.width - this.holder.offsetWidth;

            if (is_small && maybe_left < coords.fromRight) {
                _left = maybe_left;
            } else if (coords.right > this.holder.offsetWidth) {
                _left = coords.right - this.holder.offsetWidth;
            }
        } else {
            _left = coords.centerX - this.holder.offsetWidth / 2;
        }

        // Align the tooltip in space
        this.holderCss({
            top: (_top !== '' ? _top + 'px' : ''),
            left: (_left !== '' ? _left + 'px' : ''),
        });

        const rec = this.holder.getBoundingClientRect(),
            arr = this.holder.querySelector('.zt-arrow');

        // Align the arrow
        arr.style.left = `${coords.centerX - rec.left}px`
        arr.marginLeft = -arr.offsetWidth / 2
    };

    holderCss(holderCss) {
        let css = {
            top: holderCss.top || '',
            right: holderCss.right || '',
            bottom: holderCss.bottom || '',
            left: holderCss.left || '',
        };

        let cssProps = Object.keys(css)

        for (let i = 0; i < cssProps.length; i++) {
            this.holder.style[cssProps[i]] = css[cssProps[i]]
        }
    };

    changeHolderPosition(position) {
        this.replaceClass(/\bztip-position-\S+/g, 'ztip-position-' + position);
    }

    replaceClass(searchFor, replaceWith) {
        if (this.holder.classList.contains(replaceWith)) {
            return;
        }

        let cssClasses = [...this.holder.classList]

        let cssClassesToRemove = cssClasses.filter((value, index) => {
            return value.match(searchFor) && typeof index === 'number';
        })

        if (cssClassesToRemove && cssClassesToRemove.length > 0) {
            this.holder.classList.remove(cssClassesToRemove)
        }

        this.holder.classList.add(replaceWith)
    }

    /**
     * Get element coordinates.
     *
     * @return {object} Element coordinates.
     */
    getElementCoordinates() {
        // Get top/left rectangular positions.
        const rec = this.elem.getBoundingClientRect();

        // Get element dimensions
        let width = rec.right - rec.left
        let height = rec.bottom - rec.top;

        // Return the coordinates of this element in current viewport
        return {
            width,
            height,
            top: rec.top,
            left: rec.left,
            bottom: rec.bottom,
            right: rec.right,

            fromTop: rec.top,
            fromLeft: rec.left,
            fromBottom: window.innerHeight - rec.bottom,
            fromRight: window.innerWidth - rec.right,

            centerX: rec.left + width / 2,
            centerY: rec.top + height / 2,
        };
    }

    getViewport() {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
        };
    }
}
