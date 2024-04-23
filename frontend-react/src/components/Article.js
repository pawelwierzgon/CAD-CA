import { Link } from "react-router-dom";

const Article = ({
  article,
  handleArticleChange,
  handleEditCancel,
  toggleEditMode,
  editMode,
  edited,
  actions,
  isUpdating,
}) => {
  return (
    <div className="article">
      <div className="article-id">
        {article.id === "new" ? (
          `#${article.id}`
        ) : (
          <Link to={`/articles/${article.id}`}>#{article.id}</Link>
        )}
      </div>
      <p>
        <span className="bold">Title</span>
        <br />
        {edited ? (
          <input
            type="text"
            value={article.title}
            disabled={isUpdating}
            onChange={(e) =>
              handleArticleChange({ ...article, title: e.target.value })
            }
          ></input>
        ) : (
          <span> {article.title}</span>
        )}
      </p>
      <p>
        <span className="bold">Body</span>
        <br />
        {edited ? (
          <textarea
            value={article.body}
            disabled={isUpdating}
            onChange={(e) =>
              handleArticleChange({ ...article, body: e.target.value })
            }
          ></textarea>
        ) : (
          <span> {article.body}</span>
        )}
      </p>
      <label htmlFor={`publish-checkbox-${article.id}`} className="bold">
        Published
      </label>
      <input
        id={`publish-checkbox-${article.id}`}
        type="checkbox"
        checked={article.published}
        disabled={!edited || isUpdating}
        onChange={() =>
          handleArticleChange({ ...article, published: !article.published })
        }
      />
      <br />
      <div className="button-section">
        {!editMode && (
          <button
            disabled={isUpdating}
            onClick={(e) => {
              e.preventDefault();
              toggleEditMode(article);
            }}
          >
            Edit
          </button>
        )}
        {edited && (
          <button
            disabled={isUpdating}
            onClick={(e) => {
              e.preventDefault();
              if (article.id === "new") {
                actions.create(article);
              } else {
                actions.update(article);
              }
            }}
          >
            Save
          </button>
        )}
        {edited && (
          <button
            disabled={isUpdating}
            onClick={(e) => {
              e.preventDefault();
              handleEditCancel(article);
            }}
          >
            Cancel
          </button>
        )}
        {!editMode && (
          <button
            disabled={isUpdating}
            onClick={(e) => {
              e.preventDefault();
              if (
                window.confirm("Are you sure you want to delete this article?")
              ) {
                actions.remove(article);
              }
            }}
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
};

export default Article;
