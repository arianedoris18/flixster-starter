import PropTypes from 'prop-types'
import './MovieCard.css'

const HeartIcon = ({ active }) => (
  <svg viewBox="0 0 24 24" className={`movie-cardIcon ${active ? 'movie-cardIcon--heartActive' : ''}`} aria-hidden="true">
    <path d="M12 21s-7-4.35-9.5-8.2C.2 9.35 1.35 5.8 4.8 4.7c2.1-.68 4.35.08 5.7 1.8 1.35-1.72 3.6-2.48 5.7-1.8 3.45 1.1 4.6 4.65 2.3 8.1C19 16.65 12 21 12 21z" />
  </svg>
)

const EyeIcon = ({ crossed }) => (
  <svg viewBox="0 0 24 24" className="movie-cardIcon" aria-hidden="true">
    <path d="M12 5C6 5 2.1 9.3 1 12c1.1 2.7 5 7 11 7s9.9-4.3 11-7c-1.1-2.7-5-7-11-7zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" />
    <circle cx="12" cy="12" r="1.7" />
    {crossed ? <path d="M4 20L20 4" className="movie-cardIconSlash" /> : null}
  </svg>
)

function MovieCard({
  title,
  posterPath,
  aveVote,
  isFavorite,
  isWatched,
  onToggleFavorite,
  onToggleWatched,
  onClick,
}) {
  const posterUrl = posterPath
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : 'https://placehold.co/500x750?text=No+Poster'

  const altText = title ? `${title} poster` : 'Movie poster'
  const voteText = typeof aveVote === 'number' && aveVote > 0 ? aveVote.toFixed(1) : '—'

  return (
    <article className="movie-card">
      <button className="movie-cardButton" type="button" onClick={onClick}>
        <img className="movie-cardPoster" src={posterUrl} alt={altText} />
      </button>
      <div className="movie-cardContent">
        <span className="movie-cardTitle">{title}</span>
        <div className="movie-cardMetaRow">
          <p className="movie-cardVoteAverage" aria-label={`Vote average ${voteText}`}>
            ★ {voteText}
          </p>
          <div className="movie-cardActions">
            <button
              type="button"
              className={`movie-cardAction movie-cardAction--icon ${isFavorite ? 'movie-cardAction--favoriteActive' : ''}`}
              onClick={onToggleFavorite}
              aria-pressed={isFavorite}
              aria-label={isFavorite ? `Remove ${title} from favorites` : `Add ${title} to favorites`}
              title={isFavorite ? 'Favorited' : 'Favorite'}
            >
              <HeartIcon active={isFavorite} />
            </button>
            <button
              type="button"
              className={`movie-cardAction movie-cardAction--icon ${isWatched ? 'movie-cardAction--watchedActive' : ''}`}
              onClick={onToggleWatched}
              aria-pressed={isWatched}
              aria-label={isWatched ? `Mark ${title} as not watched` : `Mark ${title} as watched`}
              title={isWatched ? 'Watched' : 'Mark watched'}
            >
              <EyeIcon crossed={isWatched} />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

MovieCard.propTypes = {
  title: PropTypes.string.isRequired,
  posterPath: PropTypes.string,
  aveVote: PropTypes.number,
  isFavorite: PropTypes.bool,
  isWatched: PropTypes.bool,
  onToggleFavorite: PropTypes.func,
  onToggleWatched: PropTypes.func,
  onClick: PropTypes.func,
}

export default MovieCard