function build(package) {
    console.log(`Building ${package} package...`)
}





let [package] = process.argv.slice(2)

if (!package) {
    throw Error('Please specify a package')
}


build(package)
