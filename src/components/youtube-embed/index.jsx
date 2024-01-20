import './styles.scss';
import React from 'react';

const YoutubeEmbed = ({ embedId }) => (
	<div className="video-responsive">
		<iframe
			width="853"
			height="480"
			src={`https://www.youtube.com/embed/${embedId}?modestbranding=1`}
			frameBorder="0"
			allowFullScreen
			title="Embedded youtube"
		/>
	</div>
);

export default YoutubeEmbed;
