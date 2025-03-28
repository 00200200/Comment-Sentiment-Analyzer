import React from 'react';

interface Comment {
	comment_id: string;
	text: string;
	author?: string;
	sentiment?: number;
	sentiment_label?: string;
	like_count?: number;
	published_at?: string;
}

interface CommentsTableProps {
	comments: Comment[];
}

const CommentsTable: React.FC<CommentsTableProps> = ({ comments }) => {
	return (
		<div className='bg-gray-900 p-4 rounded shadow text-gray-100'>
			<h2 className='text-2xl font-semibold mb-4 text-white'>Comments</h2>
			<div className='overflow-x-auto max-w-full'>
				<table className='min-w-full border border-gray-700'>
					<thead>
						<tr className='bg-gray-900 text-gray-200'>
							<th className='py-2 px-4 border-b border-gray-600'>Author</th>
							<th className='py-2 px-4 border-b border-gray-600'>Comments</th>
							<th className='py-2 px-4 border-b border-gray-600'>Sentiment</th>
							<th className='py-2 px-4 border-b border-gray-600'>Likes</th>
						</tr>
					</thead>
					<tbody>
						{comments.map(comment => (
							<tr key={comment.comment_id} className='hover:bg-gray-700'>
								<td className='py-2 px-4 border-b border-gray-600'>{comment.author || 'Anonim'}</td>
								<td
									className='py-2 px-4 border-b border-gray-600 
                             whitespace-normal break-words max-w-xl'>
									{comment.text}
								</td>
								<td className='py-2 px-4 border-b border-gray-600'>
									{comment.sentiment_label} {comment.sentiment !== undefined && `(${comment.sentiment.toFixed(2)})`}
								</td>
								<td className='py-2 px-4 border-b border-gray-600'>{comment.like_count || 0}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default CommentsTable;
