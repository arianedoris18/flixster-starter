const Footer = () => {
  return (
    <footer className="app-footer">
      <p className="app-footerCopy">© {new Date().getFullYear()} Flixster</p>
      <a
        className="app-footerLink"
        href="https://www.themoviedb.org/"
        target="_blank"
        rel="noreferrer"
      >
        Data provided by TMDB
      </a>
    </footer>
  )
}

export default Footer
