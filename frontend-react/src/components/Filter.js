const Filter = ({ editMode, updateFilter, value }) => {
  return (
    <div className="filter-container">
      <label htmlFor="filter-published">Pick a filter</label>
      <br />
      <select
        id="filter-published"
        value={value}
        disabled={editMode}
        onChange={(e) => {
          updateFilter(e.target.value);
        }}
      >
        <option value="none"></option>
        <option value="published">Published</option>
        <option value="not-published">Not Published</option>
      </select>
    </div>
  );
};

export default Filter;
