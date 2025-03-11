import React, { useState } from 'react';

const Home: React.FC = () => {
	const [url, setUrl] = useState('');

	const handleAnalyze = () => {
		console.log('Analyzing :', url);
	};

	return (
		<div className='flex flex-col items-center justify-center min-h-screen '>
			<h1 className='text-4xl font-bold mb-6 text-primary'>YouTube Comment Analyzer</h1>
			<div className='w-full max-w-md mb-4'>
				<input
					type='text'
					placeholder='Paste URL'
					value={url}
					onChange={e => setUrl(e.target.value)}
					className='w-full p-3 rounded border border-border 
                     focus:outline-none focus:border-primary'
				/>
			</div>
			<button
				onClick={handleAnalyze}
				className='px-6 py-3 bg-primary text-white rounded 
                   hover:bg-secondary transition-colors'>
				Analyze
			</button>
		</div>
	);
};

export default Home;
