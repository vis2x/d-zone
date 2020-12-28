import { IServer, IUser } from './resources'

export enum ServerError {
	'SERVER_NOT_FOUND',
}

interface IError {
	name: 'ERROR'
	event: {
		error: ServerError
	}
}

interface IInit {
	name: 'INIT'
	event: {
		users: IUser[]
		server: IServer
	}
}

interface IUserModify {
	name: 'USER_MODIFY'
	event: {
		user: Partial<IUser>
		action: 'LEAVE' | 'JOIN' | 'UPDATE'
	}
}

interface IMessage {
	name: 'MESSAGE'
	event: {
		message: string
		user: IUser
	}
}

export type IServerPayload = IError | IInit | IUserModify | IMessage
