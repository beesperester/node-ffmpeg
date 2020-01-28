import yargs from 'yargs'
import gif from './src/modules/gif'

const argv = yargs.command(gif)
	.help()
	.argv