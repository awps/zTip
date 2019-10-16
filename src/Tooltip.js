export default class Tooltip {
    constructor(selector, options = {}) {

        this.options = {
            // Theme
            theme: 'default',

            // attr:title | > .child-elem | .dom-elem | function callback
            source: 'attr:title',

            // Tooltip position relative to element top | bottom
            position: 'top',

            ...options
        }

        console.log(this.options);

        this.events()
    }

    events() {

    }
}
