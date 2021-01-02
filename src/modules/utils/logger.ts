// To keep track of last log
const consoleStack: BrowserLogger[] = []

export class BrowserLogger {
	constructor(public readonly name: string) {}

	public log(...message: unknown[]) {
		this.group()
		console.log(...message)
		consoleStack.unshift(this)
	}

	public error(error: Error) {
		this.group()
		console.error(error)
		consoleStack.unshift(this)
	}

	private group() {
		if (consoleStack.shift() !== this) {
			console.groupEnd()
			console.group(this.name)
		}
	}
}
