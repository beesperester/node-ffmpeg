import yargs from 'yargs'

const argv = yargs
  .commandDir('cmds')
  .demandCommand()
  .help()
  .argv
