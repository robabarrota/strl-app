import './styles.scss';
import React, { useMemo } from 'react';
import YoutubeEmbed from '@/components/youtube-embed'
import { useDispatch, useSelector } from 'react-redux';
import { getHighlights} from '@/redux/selectors';
import { fetchHighlights} from '@/redux/actions';

const embedIdRegex = /\?v=(\w+)&/;

const Highlights = () => {
	const dispatch = useDispatch();
	const { content: highlights, loading: highlightsLoading, error: highlightsError, fetched: highlightsFetched } = useSelector(getHighlights);
	if (!highlightsFetched && !highlightsLoading && !highlightsError) dispatch(fetchHighlights());
	
	const isDataReady = useMemo(() => highlightsFetched && !highlightsLoading, [highlightsFetched, highlightsLoading]);

	const getEmbedId = (url) => url?.match(embedIdRegex)[0]?.replace('?v=', '')?.replace('&', '');

	return (
		<div className="highlights">
			<h1 className='highlights__title'>STRL Highlights</h1>

			{isDataReady && (
				<div className="highlights__container">
					{highlights.map(highlight => {
						const embedId = getEmbedId(highlight.url);
						return <YoutubeEmbed key={embedId} embedId={embedId} />
					})}
				</div>
			)}

		</div>
	);

}

export default Highlights;
