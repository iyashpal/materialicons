module.exports = {
    multipass: true,
    js2svg: {
        indent: 2,
        pretty: true,
    },
    plugins: [
        'sortAttrs',
        // 'removeXMLNS',
        'removeDimensions',
        {
            name: "removeAttrs",
            params: {
                attrs: "(fill)"
            }
        },
        {
            name: 'addAttributesToSVGElement',
            params: {
                attributes: [
                    {
                        fill: "currentColor",
                        'aria-hidden': 'true'
                    }
                ]
            }
        },

    ],
};
