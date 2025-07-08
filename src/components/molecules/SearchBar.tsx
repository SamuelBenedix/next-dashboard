export default function SearchBar() {
  return (
    <div className="nav-item d-flex align-items-center">
      <i className="bx bx-search bx-md"></i>
      <input
        type="text"
        className="form-control border-0 shadow-none ps-1 ps-sm-2"
        placeholder="Search..."
        aria-label="Search..."
      />
    </div>
  );
}
