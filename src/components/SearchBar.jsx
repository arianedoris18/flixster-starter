function SearchBar({ value, onChange, onSubmit }) {
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
    </form>
  )
}

export default SearchBar
