import React from 'react';

interface VideoStats {
	title: string;
	channel_id: string;
	view_count: number;
	like_count: number;
	comment_count: number;
}

interface VideoDetailsProps {
	title: string;
	channel_id: string;
	statistics: VideoStats;
	numCommentsAnalyzed: number;
}

const VideoDetails: React.FC<VideoDetailsProps> = ({ title, channel_id, statistics, numCommentsAnalyzed }) => {
	return (
		<div className='bg-gray-900 p-4 rounded shadow mb-8 text-gray-100'>
			<h2 className='text-2xl font-semibold mb-4 text-white'>Informations about video</h2>
			<p className='mb-1'>
				<strong>Title:</strong> {title}
			</p>
			<p className='mb-1'>
				<strong>Channel ID:</strong> {channel_id}
			</p>
			<p className='mb-1'>
				<strong>Views:</strong> {statistics.view_count}
			</p>
			<p className='mb-1'>
				<strong>Likes:</strong> {statistics.like_count}
			</p>
			<p className='mb-1'>
				<strong>Comments:</strong> {statistics.comment_count}
			</p>
			<p className='mb-1'>
				<strong>Processed Comments:</strong> {numCommentsAnalyzed}
			</p>
		</div>
	);
};

export default VideoDetails;
