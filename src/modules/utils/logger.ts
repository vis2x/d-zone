export class BrowserLogger {
	successfullColorRGB = [
		100 - Math.floor(Math.random() * 80),
		180 + Math.floor(Math.random() * 175),
		150 + Math.floor(Math.random() * 105),
		0.3,
	]

	constructor(public readonly name: string) {}

	public log(...message: unknown[]) {
		console.log(
			`%c${this.name}`,
			`background-color: rgb(${this.successfullColorRGB.join(
				','
			)}); padding: 5px 10px;`,
			...message
		)
	}

	public warn(...message: unknown[]) {
		console.warn(
			`%c${this.name}`,
			'background-color: rgba(242, 146, 29, 0.3); padding: 5px 10px;',
			...message
		)
	}

	public error(error: Error) {
		console.error(
			`%c${this.name}`,
			'background-color: rgba(242, 29, 29, 0.3); padding: 5px 10px;',
			error
		)
	}
}
