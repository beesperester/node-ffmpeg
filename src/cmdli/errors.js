export class CmdliConstraintError extends Error {
	constructor(message) {
		super(message)

		this.name = 'CmdliConstraintError'
	}
}