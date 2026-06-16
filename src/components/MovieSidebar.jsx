import PropTypes from 'prop-types'

function MovieSidebar({ favorites, watched }) {
  return (
    <aside className="movie-sidebar" aria-label="Movie lists">
      <section className="movie-sidebarSection">
        <h3 className="movie-sidebarTitle">Favorites ({favorites.length})</h3>
        {favorites.length === 0 ? (
          <p className="movie-sidebarEmpty">No favorite movies yet.</p>
        ) : (
          <ul className="movie-sidebarList">
            {favorites.map((movie) => (
              <li key={movie.id} className="movie-sidebarItem">{movie.title}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="movie-sidebarSection">
        <h3 className="movie-sidebarTitle">Watched ({watched.length})</h3>
        {watched.length === 0 ? (
          <p className="movie-sidebarEmpty">No watched movies yet.</p>
        ) : (
          <ul className="movie-sidebarList">
            {watched.map((movie) => (
              <li key={movie.id} className="movie-sidebarItem">{movie.title}</li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  )
}

MovieSidebar.propTypes = {
  favorites: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
    })
  ).isRequired,
  watched: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
    })
  ).isRequired,
}

export default MovieSidebar
