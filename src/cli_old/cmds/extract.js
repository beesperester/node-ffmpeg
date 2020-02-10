export const command = 'extract <command>'

export const desc = 'Extract from video'

export const builder = (yargs) => {
  return yargs.commandDir('extract_cmds')
}

export const handler = function (argv) { }
