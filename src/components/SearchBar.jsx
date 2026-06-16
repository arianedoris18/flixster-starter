import PropTypes from 'prop-types'

function SearchBar({ value, onChange, onSubmit, onClear }) {
  return (
    <form className="search-bar" onSubmit={onSubmit}>
      <input
        className="search-barInput"
        type="text"
        placeholder="Search movies..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <button className="search-barButton" type="submit">
        Search
      </button>
      <button className="search-barButton search-barButton--secondary" type="button" onClick={onClear}>
        Clear
      </button>
    </form>
  )
}

SearchBar.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
}

export default SearchBar
