import S from 'sanctuary'

import * as libcmdli from '../cmdli'

export const createFFprobe = (path) => libcmdli.createCMD(path || 'ffprobe')

// arguments
export const ffprobeArguments = {
	input: libcmdli.createArgument('-i')(),

	outputFormat: libcmdli.createArgument('-of')(),

	verbosity: libcmdli.createArgument('-v')(),

	showEntries: libcmdli.createArgument('-show_entries')()
}

// presets
export const duration = S.pipe([
	S.chain(
		S.encase(
			libcmdli.setArgument(
				ffprobeArguments.showEntries('format=duration')
			)
		)
	),
	S.chain(
		S.encase(
			libcmdli.setArgument(
				ffprobeArguments.verbosity('quiet')
			)
		)
	),
	S.chain(
		S.encase(
			libcmdli.setArgument(
				ffprobeArguments.outputFormat('csv=p=0')
			)
		)
	)
])

export const presets = {
	duration
}

export default {
	createFFprobe,
	ffprobeArguments,
	presets
}