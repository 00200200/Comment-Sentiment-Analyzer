import React, { useState } from 'react';
import VideoDetails from '../components/VideoDetails';
import CommentsTable from '../components/CommentsTable';

interface AnalyzeResponse {
	video_id: string;
	title: string;
	channel_id: string;
	statistics: {
		title: string;
		channel_id: string;
		view_count: number;
		like_count: number;
		comment_count: number;
	};
	num_comments_analyzed: number;
}

interface Comment {
	comment_id: string;
	text: string;
	author?: string;
	sentiment?: number;
	sentiment_label?: string;
	like_count?: number;
	published_at?: string;
}

const Home: React.FC = () => {
	const [url, setUrl] = useState('');
	const [analyzeResult, setAnalyzeResult] = useState<AnalyzeResponse | null>(null);
	const [comments, setComments] = useState<Comment[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleAnalyze = async () => {
		setError(null);
		setLoading(true);
		try {
			const analyzeResponse = await fetch(`http://127.0.0.1:8000/analyze?video_url=${encodeURIComponent(url)}`);
			if (!analyzeResponse.ok) {
				throw new Error('Error Check URL');
			}
			const data: AnalyzeResponse = await analyzeResponse.json();
			setAnalyzeResult(data);

			const commentsResponse = await fetch(`http://127.0.0.1:8000/comments/${data.video_id}`);
			if (!commentsResponse.ok) {
				throw new Error('Error : Cannot load comments');
			}
			const commentsData: Comment[] = await commentsResponse.json();
			setComments(commentsData);
		} catch (err: any) {
			setError(err.message || 'Error ');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='flex flex-col items-center justify-center min-h-screen px-4 py-8 bg-gray-950 text-gray-100'>
			<div className='max-w-3xl w-full'>
				<h1 className='text-4xl font-bold mb-8 text-purple-400'>Emotube: Comment Sentiment Analyzer</h1>

				<div className='flex items-center gap-2 mb-6'>
					<input
						type='text'
						placeholder='Wklej URL filmu'
						value={url}
						onChange={e => setUrl(e.target.value)}
						className='w-full p-3 rounded border border-gray-700 bg-gray-900 text-gray-100 focus:outline-none focus:border-purple-500'
					/>
					<button
						onClick={handleAnalyze}
						className='px-6 py-3 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors'>
						Analyze
					</button>
				</div>

				{loading && <p className='mt-4'>Loading...</p>}
				{error && <p className='mt-4 text-red-500'>{error}</p>}

				{analyzeResult && (
					<VideoDetails
						title={analyzeResult.title}
						channel_id={analyzeResult.channel_id}
						statistics={analyzeResult.statistics}
						numCommentsAnalyzed={analyzeResult.num_comments_analyzed}
					/>
				)}

				{comments.length > 0 && <CommentsTable comments={comments} />}
			</div>
		</div>
	);
};

export default Home;
