import './styles.scss';
import React, { useMemo } from 'react';
import YoutubeEmbed from '../components/youtube-embed'
import { useDispatch, useSelector } from 'react-redux';
import { getHighlights} from 'src/redux/selectors';
import { fetchHighlights} from 'src/redux/actions';
import { isEmpty } from 'lodash';

const embedIdRegex = /\?v=(\w+)&/;

const Highlights = () => {
	const dispatch = useDispatch();
	const { content: highlights, loading: highlightsLoading } = useSelector(getHighlights);
	if (isEmpty(highlights) && !highlightsLoading) dispatch(fetchHighlights());
	
	const isDataReady = useMemo(() =>
		!(isEmpty(highlights) || highlightsLoading),
		[highlights, highlightsLoading]);

	const getEmbedId = (url) => url?.match(embedIdRegex)[0]?.replace('?v=', '')?.replace('&', '');

	return (
		<div className="highlights">
			<h1 className='highlights__title'>STRL Highlights</h1>

			{isDataReady && (
				<div className="highlights__container">
					{highlights.map(highlight => {
						const embedId = getEmbedId(highlight['URL']);
						return <YoutubeEmbed key={embedId} embedId={embedId} />
					})}
				</div>
			)}

		</div>
	);

}

export default Highlights;
