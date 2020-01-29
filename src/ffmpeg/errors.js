export class FFmpegInputError extends Error {
	constructor(message) {
		super(message)

		this.name = 'FFmpegInputError'
	}
}

export class FFmpegArgumentError extends Error {
	constructor(message) {
		super(message)

		this.name = 'FFmpegArgumentError'
	}
}

export class FFmpegConstraintError extends Error {
	constructor(message) {
		super(message)

		this.name = 'FFmpegConstraintError'
	}
}