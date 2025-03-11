import React, { useState } from 'react';

const Home: React.FC = () => {
	const [url, setUrl] = useState('');
	const handleAnalyze = () => {
		console.log('Analizuję komentarze dla linku:', url);
	};
	return (
		<div className='flex flex-col items-center justify-center min-h-screen bg-gray-100'>
			<h1 className='text-4xl font-bold mb-6'>YouTube Comment Analyzer</h1>
			<div className='w-full max-w-md mb-4'>
				<input
					type='text'
					placeholder='Paste URL'
					value={url}
					onChange={e => setUrl(e.target.value)}
					className='w-full p-3 rounded border border-gray-300 focus:outline-none focus:border-blue-500'
				/>
			</div>
			<button
				onClick={handleAnalyze}
				className='px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'>
				Analyze
			</button>
		</div>
	);
};

export default Home;
