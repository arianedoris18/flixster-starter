import { useState } from 'react'
import SearchBar from './SearchBar'

const Header = ({ searchQuery, onSearchChange, onSearchSubmit, sortOption, onSortChange }) => {
  const [showSearch, setShowSearch] = useState(false)

  return (
    <header className="app-header">
      <div className="app-headerOverlay" />
      <div className="app-headerContent">
        <div>
          <h1 className="app-headerTitle">Flixster</h1>
          <p className="app-headerTagline">Discover now playing movies</p>
        </div>

        <div className="app-headerControls">
          <div className="app-headerControlRow">
            <button
              className="search-toggleButton"
              type="button"
              aria-label="Toggle search bar"
              onClick={() => setShowSearch((prevValue) => !prevValue)}
            >
              🔍
            </button>
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

          {showSearch ? (
            <SearchBar value={searchQuery} onChange={onSearchChange} onSubmit={onSearchSubmit} />
          ) : null}
        </div>
      </div>
    </header>
  )
}

export default Header
