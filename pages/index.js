import Head from 'next/head';
import Image from 'next/image';
import { Inter } from '@next/font/google';
import styles from '../styles/Home.module.css';
import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import {
	Election,
	EnvOptions,
	PlainCensus,
	PublishedElection,
	VocdoniSDKClient,
	Vote
} from '@vocdoni/sdk';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
	const [mySigner, setMySigner] = useState('');
	const [myClient, setMyClient] = useState('');

	const btnClick = async () => {
		console.log('btn clicked');
		// A Web3Provider wraps a standard Web3 provider, which is
		// what MetaMask injects as window.ethereum into each page
		let provider = new ethers.providers.Web3Provider(window.ethereum);
		// to check with which network metamask is currently connected, and show required alert
		const { chainId } = await provider.getNetwork();
		console.log('my chainid is: ', chainId);

		// MetaMask requires requesting permission to connect users accounts
		await provider.send('eth_requestAccounts', []);

		// The MetaMask plugin also allows signing transactions to
		// send ether and pay to change state within the blockchain.
		// For this, you need the account signer...
		let signer = provider.getSigner();
		console.log('connected with metamask');
		const client = new VocdoniSDKClient({
			env: EnvOptions.STG, // mandatory, can be 'dev' or 'prod'
			wallet: signer, // optional, the signer used (Metamask, Walletconnect)
		});

		const info = await client.createAccount();
		console.log(info);
		setMyClient(client); // will show account information
	};

	const electionBtn = async () => {
		console.log('election btn');
		const census = new PlainCensus();
		// accepts any ethereum-alike addresses
		census.add('0x4e76d6B2404d59D01bD50e159A775044d37debdA');
		census.add('0x31B0F3eeD8cAFA7D09C862b7779AAc826F3c4468');

		const endDate = new Date();
		endDate.setHours(endDate.getHours() + 10);
		console.log('end date is: ', endDate);
		// fill basic election metadata
		const election = Election.from({
			title: 'Election title',
			description: 'Election description',
			header: 'https://source.unsplash.com/random',
			streamUri: 'https://source.unsplash.com/random',
			endDate: endDate.getTime(),
			census,
		});

		// add questions
		election.addQuestion(
			'This is an awesome question',
			'With its awesome description',
			[
				{
					title: 'Option 1',
					value: 0,
				},
				{
					title: 'Option 2',
					value: 1,
				},
			]
		);
		const id = await myClient.createElection(election);
		console.log(id); // will show the created election id
	};

	const fetchElectionInfo = async () => {
		const info = await myClient.fetchElection(
			'c5d2460186f74e76d6b2404d59d01bd50e159a775044d37debda020000000000'
		);
		console.log(
			'the info for the election id: c5d2460186f74e76d6b2404d59d01bd50e159a775044d37debda020000000000 is: ',
			info
		); // shows election information and metadata
	};

	const voteInElection = async () => {
		await myClient.setElectionId("c5d2460186f74e76d6b2404d59d01bd50e159a775044d37debda020000000000");
		const vote = new Vote([0]);
		const voteId = await myClient.submitVote(vote);
		console.log("my vote id is: ",voteId)
	};
	return (
		<div>
			<button onClick={btnClick}>Sign in</button>
			<button onClick={electionBtn}>Create election</button>
			<button onClick={fetchElectionInfo}>fetch election info</button>
			<button onClick={voteInElection}>vote in election </button>
		</div>
	);
}
