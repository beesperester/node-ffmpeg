export const command = 'vr <command>'

export const desc = 'Convert VR video'

export const builder = (yargs) => {
	return yargs.commandDir('vr_cmds')
}

export const handler = function (argv) { }