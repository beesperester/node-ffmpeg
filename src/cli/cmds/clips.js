export const command = 'clips <command>'

export const desc = 'Create clips from video'

export const builder = (yargs) => {
	return yargs.commandDir('clips_cmds')
}

export const handler = function (argv) { }