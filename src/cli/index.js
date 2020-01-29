import yargs from 'yargs'

// Cli related imports
import gif from './gif'
import probe from './probe'
import trailer from './trailer'

const argv = yargs
	.command(gif)
	.command(probe)
	.command(trailer)
	.help()
	.argv