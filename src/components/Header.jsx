import { useState } from 'react'
import PropTypes from 'prop-types'
import SearchBar from './SearchBar'

const Header = ({
  featuredMovie,
  viewMode,
  onViewChange,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  sortOption,
  onSortChange,
  onGetDescription,
}) => {
  const [showSearch, setShowSearch] = useState(false)
  const [showViewMenu, setShowViewMenu] = useState(false)
  const heroBackdrop = featuredMovie?.backdrop_path
    ? `https://image.tmdb.org/t/p/original${featuredMovie.backdrop_path}`
    : 'https://placehold.co/1400x700?text=Flixster'

  const handleToggleSearch = () => {
    setShowSearch((prev) => {
      const next = !prev
      if (!next && onClearSearch) onClearSearch()
      return next
    })
  }

  return (
    <header
      className={`app-header ${viewMode === 'all' ? '' : 'app-header--compact'}`.trim()}
      style={{ backgroundImage: viewMode === 'all' ? `url(${heroBackdrop})` : 'none' }}
    >
      <div className="app-headerOverlay" />
      <div className="app-headerContent">
        <div className="app-headerTopRow">
          <div className="app-headerBrandGroup">
            <div className="app-headerMenuWrap">
              <button
                type="button"
                className="app-headerMenuButton"
                aria-label="Open view menu"
                aria-haspopup="menu"
                aria-expanded={showViewMenu}
                onClick={() => setShowViewMenu((prev) => !prev)}
              >
                <span className="app-headerMenuLine" />
                <span className="app-headerMenuLine" />
                <span className="app-headerMenuLine" />
              </button>
              {showViewMenu ? (
                <div className="app-headerMenuDropdown" role="menu" aria-label="Movie views">
                  <button
                    type="button"
                    className={`app-headerMenuItem ${viewMode === 'all' ? 'app-headerMenuItem--active' : ''}`}
                    onClick={() => {
                      onViewChange('all')
                      setShowViewMenu(false)
                    }}
                  >
                    All Movies
                  </button>
                  <button
                    type="button"
                    className={`app-headerMenuItem ${viewMode === 'favorites' ? 'app-headerMenuItem--active' : ''}`}
                    onClick={() => {
                      onViewChange('favorites')
                      setShowViewMenu(false)
                    }}
                  >
                    Favorites
                  </button>
                  <button
                    type="button"
                    className={`app-headerMenuItem ${viewMode === 'watched' ? 'app-headerMenuItem--active' : ''}`}
                    onClick={() => {
                      onViewChange('watched')
                      setShowViewMenu(false)
                    }}
                  >
                    Watched
                  </button>
                </div>
              ) : null}
            </div>
            <span className="app-headerBrandSmall">Flixster</span>
          </div>
          <div className="app-headerControls">
            <div className="app-headerControlRow">
              <div className="search-toggleGroup">
                <button
                  className="search-toggleButton"
                  type="button"
                  aria-label={showSearch ? 'Close search' : 'Open search'}
                  aria-expanded={showSearch}
                  onClick={handleToggleSearch}
                >
                  <img
                    className="search-toggleIcon"
                    src="https://cdn-icons-png.flaticon.com/512/7079/7079548.png"
                    alt=""
                    aria-hidden="true"
                  />
                </button>
                {showSearch ? (
                  <SearchBar
                    value={searchQuery}
                    onChange={onSearchChange}
                    onSubmit={onSearchSubmit}
                    onClear={onClearSearch}
                  />
                ) : null}
              </div>
              <div className="sort-controls app-headerSortControls">
                <label className="sort-controlsLabel" htmlFor="sort-option">
                  Sort By:
                </label>
                <select
                  id="sort-option"
                  className="sort-controlsSelect"
                  value={sortOption}
                  onChange={(event) => onSortChange(event.target.value)}
                >
                  <option value="">Select category</option>
                  <option value="title-az">Title (A-Z)</option>
                  <option value="release-newest">Release Date (Newest)</option>
                  <option value="vote-highest">Vote Average (Highest)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {viewMode === 'all' ? (
          <div className="app-headerHero">
            <p className="app-headerKicker">Featured</p>
            <h1 className="app-headerTitle">{featuredMovie?.title || 'Flixster'}</h1>
            <p className="app-headerTagline">
              {featuredMovie?.overview || 'Discover now playing movies and watch what everyone is talking about.'}
            </p>
            <div className="app-headerCtas">
              <button
                type="button"
                className="app-headerPrimaryButton"
                onClick={onGetDescription}
                disabled={!featuredMovie?.id}
              >
                ✨ Get Description
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  )
}

Header.propTypes = {
  featuredMovie: PropTypes.shape({
    backdrop_path: PropTypes.string,
    title: PropTypes.string,
    overview: PropTypes.string,
  }),
  viewMode: PropTypes.oneOf(['all', 'favorites', 'watched']).isRequired,
  onViewChange: PropTypes.func.isRequired,
  searchQuery: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  onSearchSubmit: PropTypes.func.isRequired,
  onClearSearch: PropTypes.func,
  sortOption: PropTypes.string.isRequired,
  onSortChange: PropTypes.func.isRequired,
  onGetDescription: PropTypes.func,
}

export default Header
