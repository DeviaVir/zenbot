import semver from 'semver'
import path from 'path'
import program from 'commander'
import fs from 'fs'

import boot from './boot'

program._name = 'zenbot'

if (semver.gt('10.0.0', process.versions.node)) {
  console.error('You are running a node.js version older than 10.x.x, please upgrade via https://nodejs.org/en/')
  process.exit(1)
}

const run = async () => {
  const load = async () => {
    try {
      return await boot()
    } catch (e) {
      console.error(e)
      process.exit(1)
    }
  }

  const zenbot = await load()
  program.version(zenbot.version)

  const commandDirectory = './commands'

  const files = fs.readdirSync(path.join(zenbot.conf.srcRoot, commandDirectory))

  files
    .map((file) => path.join(zenbot.conf.srcRoot, commandDirectory, file))
    .filter((file) => fs.statSync(file).isFile())
    .map((file) => file.replace('.ts', ''))
    .map((file) => require(file))
    .forEach(({ default: command }) => command(program, zenbot.conf))

  program.command('*', 'Display help', { noHelp: true }).action((cmd) => {
    console.log('Invalid command: ' + cmd)
    program.help()
  })

  program.parse(process.argv)
}

run()
