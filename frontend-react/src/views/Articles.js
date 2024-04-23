import Article from "../components/Article";

const Articles = ({
  articles,
  handleArticleChange,
  handleEditCancel,
  toggleEditMode,
  editModeArticle,
  editMode,
  actions,
  isUpdating,
}) => {
  return (
    <div>
      {articles.map((article, index) => {
        return (
          <Article
            key={index}
            article={article}
            handleArticleChange={handleArticleChange}
            handleEditCancel={handleEditCancel}
            toggleEditMode={toggleEditMode}
            editMode={editMode}
            edited={editModeArticle?.id === article.id}
            actions={actions}
            isUpdating={isUpdating}
          />
        );
      })}
    </div>
  );
};

export default Articles;
