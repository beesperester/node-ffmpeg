export const command = 'probe <command>'

export const desc = 'Get video information'

export const builder = (yargs) => {
  return yargs.commandDir('probe_cmds')
}

export const handler = function (argv) { }
