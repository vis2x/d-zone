import { IServer, IUser } from './resources'

export interface IJoinSuccess {
	name: 'JOIN_SUCCESS'
	event: {
		users: IUser[]
		server: IServer
	}
}

export interface IJoinError {
	name: 'JOIN_ERROR'
	event: {
		error: 'SERVER_NOT_FOUND' | 'UNAUTHORISED'
	}
}

export interface IUserModify {
	name: 'USER_MODIFY'
	event: {
		user: Partial<IUser>
		action: 'LEAVE' | 'JOIN' | 'UPDATE'
	}
}

export interface IMessage {
	name: 'MESSAGE'
	event: {
		message: string
		user: IUser
	}
}

export type IServerPayload = IJoinSuccess | IJoinError | IUserModify | IMessage
