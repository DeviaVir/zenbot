import fs from 'fs'
import path from 'path'
import minimist from 'minimist'

export default () => {
  const ROOT = path.resolve(process.cwd())

  const { version } = JSON.parse(fs.readFileSync(path.join(ROOT, './package.json'), 'UTF-8'))

  const args = minimist(process.argv.slice(3))

  const configFiles = ['./conf.js', './conf-sample.js']

  if (typeof args.cong !== 'undefined') {
    configFiles.unshift(args.conf)
  }

  const conf = configFiles.reduceRight((config, filename) => {
    const file = path.join(ROOT, filename)
    if (!fs.existsSync(file)) {
      console.error(`Failed to load config file: ${filename}`)
      return config
    }

    return { ...config, ...require(file) }
  }, {})

  conf.srcRoot = path.join(ROOT, 'src')

  return { version, conf }
}
