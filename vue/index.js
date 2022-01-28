import { h, resolveDynamicComponent } from 'vue'

export default {
    install: function (app, options = {}) {

        let _defaults = {

            componentName: 'Icon',

            icons: {
                Filled: {},
                Outline: {},
                Round: {},
                Sharp: {},
                Twotone: {}
            }
        };

        Object.assign(_defaults, options)


        if (typeof _defaults.icons !== 'object') {
            throw `icons property should be a object type. You passed a ${typeof _defaults.icons} type.`
        }


        for (let iconSet in _defaults.icons) {

            let icons = _defaults.icons[iconSet];


            if (typeof icons !== 'object') {
                throw `${iconSet} should be a valid object of icons. ${typeof icons} received.`
            }

            for (let componentName in icons) {
                app.component(`${componentName}${iconSet}`, icons[componentName]);
            }

        }

        if (typeof _defaults.componentName !== 'string') {
            throw `componentName field should be string in type. ${typeof _defaults.componentName} received.`
        }

        // Register icon renderer component globally.
        app.component(_defaults.componentName, {

            name: _defaults.componentName,

            props: {
                // Icon name without icon sufix
                name: { required: true, type: String },

                // enable/disable the solid type of icon
                type: { required: false, type: String, default: "Round" }

            },

            render() {

                // Name of resolved icon
                let resolvedIconName = [this.name, 'Icon', this.type]


                // check if the name has dashed convention or not
                if (/^[a-z]+[-]?.*/g.test(this.name)) {

                    resolvedIconName = resolvedIconName.join('-').toLowerCase();

                } else {

                    resolvedIconName = resolvedIconName.join('');

                }

                // Resolve the Heroicon based on name prop
                return h(resolveDynamicComponent(resolvedIconName))
            },
        })


    }
}
