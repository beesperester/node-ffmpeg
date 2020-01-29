// Node related imports
import assert from 'assert'

// FFmpeg related imports
import {
	FFmpegInputError,
	FFmpegArgumentError,
	FFmpegConstraintError
} from './errors'
import { constraintFlags } from './ffmpeg'

export const reduceArray = (previous, current) => {
	return previous.concat(current);
}

export const filterEmpty = (value) => {
	return value ? value.trim() != '' : false
}

export const assertType = (expected) => (received) => {
	for (let prop in expected) {
		assert(prop in received)
	}
}

export const assertConstraints = (argument) => (input) => {
	argument.constraints.forEach((constraint) => {
		if (constraint.flag == constraintFlags.mustNotExist) {
			const matches = input.arguments.filter((x) => x.argument == constraint.argument)

			if (matches.length > 0) {
				throw new FFmpegConstraintError(`Argument ${argument.argument} must not be used with ${constraint.argument}`)
			}
		}

		if (constraint.flag == constraintFlags.mustExist) {
			const matches = input.arguments.filter((x) => x.argument == constraint.argument)

			if (matches.length == 0) {
				throw new FFmpegConstraintError(`Argument ${argument.argument} must be used with ${constraint.argument}`)
			}
		}
	})
}