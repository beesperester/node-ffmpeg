import yargs from 'yargs'
import gif from './gif'

const argv = yargs.command(gif)
	.help()
	.argv