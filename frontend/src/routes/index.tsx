import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';

export const Route = createFileRoute('/')({
	component: SearchPage,
});

function SearchPage() {
	const [videoUrl, setVideoUrl] = useState('');
	const [selectedMode, setSelectedMode] = useState('default');
	const [saveHistory, setSaveHistory] = useState(true);
	const navigate = useNavigate();

	const handleAnalyze = (e: React.FormEvent<HTMLFormElement>): void => {
		e.preventDefault();
		if (!videoUrl.trim()) return;
		// Navigate to /video with the video URL as a query parameter
		navigate({
			to: '/video',
			search: { url: videoUrl },
		});
	};

	return (
		<div className='container max-w-xl mx-auto text-center p-8 flex flex-col items-center space-y-2 min-h-screen justify-center'>
			<h1 className='text-3xl mb-8'>Select a URL to analyze</h1>
			<form onSubmit={handleAnalyze} className='flex justify-center items-center space-x-2 w-full'>
				<Input
					type='text'
					placeholder='URL'
					value={videoUrl}
					onChange={e => setVideoUrl(e.target.value)}
					className='w-full h-12'
				/>
				<Button type='submit' className='h-12'>
					Analyze
				</Button>
			</form>
			<Separator className='w-full my-6' />
			<div className='flex items-center justify-center space-x-6 max-w-2xl'>
				<div className='flex flex-col items-center'>
					<Select value={selectedMode} onValueChange={setSelectedMode}>
						<SelectTrigger className='w-[180px]'>
							<SelectValue placeholder='deep-analysis' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='default'>Default</SelectItem>
							<SelectItem value='deep-analysis'>Deep Analysis*</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div className='flex items-center space-x-2'>
					<Switch id='save-history' checked={saveHistory} onCheckedChange={setSaveHistory} />
					<Label htmlFor='save-history'>Save History</Label>
				</div>
			</div>
			<p className='text-gray-400 text-sm mt-6'>*analyzes sentiment trends across an entire topic pool.</p>
		</div>
	);
}

export default SearchPage;
