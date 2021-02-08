import React from 'react'
import Head from 'next/head'
import styled from 'styled-components'
import dynamic from 'next/dynamic'

const Layout = styled.div`
	//height: 100vh;
	display: flex;
	flex-direction: column;
	align-items: center;
`

const Title = styled.h1`
	font-size: 4em;
	font-family: sans-serif;
`

const Game = dynamic(() => import('root/src/components/game'), {
	ssr: false,
})

/**
 * Home page
 *
 * @returns Page
 */
export default function Home() {
	return (
		<>
			<Head>
				<title>D-Zone</title>
			</Head>
			<Layout>
				<Title>Hey there!</Title>
				<Game />
			</Layout>
		</>
	)
}
