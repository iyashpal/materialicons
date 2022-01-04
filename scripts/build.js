
const fs = require('fs/promises')

const babel = require('@babel/core')

const { promisify } = require('util')

const camelcase = require('camelcase')

const svgr = require('@svgr/core').default

const RmRf = promisify(require('rimraf'))

const { compile: compileVue } = require('@vue/compiler-dom')



let transform = {
    react: async (svg, componentName, format) => {

        let component = await svgr(svg, {}, { componentName })

        let { code } = await babel.transformAsync(component, {
            plugins: [[require('@babel/plugin-transform-react-jsx'), { useBuiltIns: true }]],
        })

        if (format === 'esm') {
            return code
        }

        return code
            .replace('import * as React from "react"', 'const React = require("react")')
            .replace('export default', 'module.exports =')
    },



    vue: (svg, componentName, format) => {
        let { code } = compileVue(svg, { mode: 'module' })

        if (format === 'esm') {
            return code.replace('export function', 'export default function')
        }

        return code
            .replace(
                /import\s+\{\s*([^}]+)\s*\}\s+from\s+(['"])(.*?)\2/,
                (_match, imports, _quote, mod) => {
                    let newImports = imports
                        .split(',')
                        .map((i) => i.trim().replace(/\s+as\s+/, ': '))
                        .join(', ')

                    return `const { ${newImports} } = require("${mod}")`
                }
            )
            .replace('export function render', 'module.exports = function render')
    },
}


async function getIcons(style) {


    let files = await fs.readdir(`./src/${style}`)


    return Promise.all(files.map(async (file) => ({

        svg: await fs.readFile(`./src/${style}/${file}`, 'utf8'),

        componentName: `${camelcase(file.replace(/\.svg$/, ''), { pascalCase: true })}Icon`,

    })))
}

async function generateIcons(package, style, format) {

    let outDir = `./${package}/${style}/${format === 'esm' ? '/esm' : ''}`;


    await fs.mkdir(outDir, { recursive: true }, (error) => {
        if (error) throw error;
    });

    let icons = await getIcons(style)


    await Promise.all(icons.flatMap(async ({ componentName, svg }) => {

        let content = await transform[package](svg, componentName, format)


        let types = ``;

        if (package === 'react') {
            types = `import * as React from 'react';\ndeclare function ${componentName}(props: React.ComponentProps<'svg'>): JSX.Element;\nexport default ${componentName};\n`;
        }

        if (package === 'vue') {
            types = `import { RenderFunction } from 'vue';\ndeclare const ${componentName}: RenderFunction;\nexport default ${componentName};\n`;
        }



        return [

            fs.writeFile(`${outDir}/${componentName}.js`, content, 'utf8'),

            ...(types ? [fs.writeFile(`${outDir}/${componentName}.d.ts`, types, 'utf8')] : []),
        ]


    }));




    await fs.writeFile(`${outDir}/index.js`, exportAll(icons, format), 'utf8')

    await fs.writeFile(`${outDir}/index.d.ts`, exportAll(icons, 'esm', false), 'utf8')


}


function exportAll(icons, format, includeExtension = true) {
    return icons
        .map(({ componentName }) => {
            let extension = includeExtension ? '.js' : ''
            if (format === 'esm') {
                return `export { default as ${componentName} } from './${componentName}${extension}'`
            }
            return `module.exports.${componentName} = require("./${componentName}${extension}")`
        })
        .join('\n')
}

function build(package, style) {
    console.log(`Building ${package} package...`)


    Promise.all([RmRf(`./${package}/${style}/*`)])

        .then(() => Promise.all([
            generateIcons(package, style, 'cjs'),
            generateIcons(package, style, 'esm'),


            fs.writeFile(`./${package}/${style}/package.json`, `{"module": "./esm/index.js"}`, 'utf8'),
            fs.writeFile(`./${package}/${style}/esm/package.json`, `{"type": "module"}`, 'utf8'),

        ]))

        .then(() => {

            console.log(`Finished building ${package} package.`)

        });
}






let [package, style] = process.argv.slice(2);


if (!package) {
    throw Error('Please specify a package')
}

if (!['twotone', 'outline', 'round', 'sharp', 'filled'].includes(style)) {
    throw Error("Please select a correct style")
}


build(package, style)
