module.exports = {
    multipass: true,
    js2svg: {
        indent: 2,
        pretty: true,
    },
    plugins: [
        'sortAttrs',
        'removeDimensions',
        {
            name: "removeAttrs",
            params: {
                attrs: "(stroke)"
            }
        },
        {
            name: 'addAttributesToSVGElement',
            params: {
                attributes: [
                    {
                        fill: "none",
                        stroke: "currentColor",
                        'aria-hidden': 'true'
                    }
                ]
            }
        },


    ],
};
