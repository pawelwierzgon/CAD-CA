import "./App.css";
import Articles from "./views/Articles";
import Filter from "./components/Filter";
import ErrorPopup from "./components/ErrorPopup";
import { useState, useEffect } from "react";

function App({ articlesAPI }) {
  // State to hold all articles
  const [articles, setArticles] = useState([]);
  // Initial loading flag
  const [isLoading, setIsLoading] = useState(true);
  // CRUD actions  flag
  const [isUpdating, setIsUpdating] = useState(false);
  // State to hold any errors
  const [error, setError] = useState("");
  // Editing mode flag
  const [editMode, setEditMode] = useState(false);
  // State to hold the original edited article
  const [editModeArticle, setEditModeArticle] = useState(null);
  // State to hold all articles for filtering
  const [filteredArticles, setFilteredArticles] = useState([]);
  // State to hold current filter value
  const [filter, setFilter] = useState("none");

  // GET all articles
  const getArticles = async () => {
    setIsLoading(true);
    await articlesAPI
      .get(`/articles`)
      .then((res) => setArticles(res.data))
      .catch((err) => setError(err.message));
    setIsLoading(false);
  };

  // Create a new article (PUT)
  const createArticle = async (article) => {
    setIsUpdating(true);
    if (validateArticle(article).result) {
      toggleEditMode(article);
      await articlesAPI
        .post(`/articles`, article)
        .then((res) => {
          let newArticles = [...articles];
          newArticles.pop();
          setArticles([...newArticles, res.data]);
        })
        .catch((err) => setError(err.message));
    } else {
      setError(validateArticle(article).error);
    }
    setIsUpdating(false);
  };

  // Remove an article (DELETE)
  const removeArticle = async (article) => {
    setIsUpdating(true);
    await articlesAPI
      .delete(`/articles/${article.id}`)
      .then((res) =>
        setArticles([...articles].filter((a) => a.id !== article.id))
      )
      .catch((err) => setError(err.message));
    setIsUpdating(false);
  };

  // Update an article (PATCH)
  const updateArticle = async (article) => {
    setIsUpdating(true);
    // Check if anything has changed in the article before calling an API
    if (
      editModeArticle.title !== article.title ||
      editModeArticle.body !== article.body ||
      editModeArticle.published !== article.published
    ) {
      if (validateArticle(article).result) {
        toggleEditMode(article);
        await articlesAPI
          .patch(`/articles/${article.id}`, article)
          .then((res) => handleArticleChange(res.data))
          .catch((err) => setError(err.message));
      } else {
        setError(validateArticle(article).error);
      }
    }
    setIsUpdating(false);
  };

  // Object to hold all article actions
  const ARTICLE_ACTIONS = {
    create: createArticle,
    update: updateArticle,
    remove: removeArticle,
  };

  // UseEffect to update filteredArticles every time articles are updated
  useEffect(() => {
    setFilteredArticles(articles);
    updateFilter(filter);
  }, [articles]);

  // UseEffect to get all articles when opening the page
  useEffect(() => {
    getArticles();
  }, []);

  // Update articles state
  const handleArticleChange = (article) => {
    const newArticles = [...articles];
    const articleIndex = newArticles.findIndex((a) => a.id === article.id);
    newArticles[articleIndex] = article;
    setArticles([...newArticles]);
  };

  // Revert the changes if cancelled
  const handleEditCancel = (article) => {
    let newArticles = [...articles];
    if (article.id === "new") {
      newArticles.pop();
    } else {
      let articleIndex = newArticles.findIndex((a) => a.id === article.id);
      newArticles[articleIndex] = editModeArticle;
    }
    setArticles([...newArticles]);
    toggleEditMode(article);
  };

  // Add new empty article
  const handleAddNewArticle = () => {
    let newArticle = {
      id: "new",
      title: "",
      body: "",
      published: false,
    };
    setArticles([...articles, newArticle]);
    toggleEditMode(newArticle);
  };

  // Update editMode & editModeId states
  const toggleEditMode = (article) => {
    if (editMode) {
      setEditModeArticle(null);
    } else {
      setEditModeArticle(article);
    }
    setEditMode(!editMode);
  };

  const updateFilter = (value) => {
    setFilter(value);

    if (value === "none") {
      setFilteredArticles(articles);
    } else if (value === "published") {
      // Filter only published articles or the currently edited one
      setFilteredArticles(
        [...articles].filter((a) => a.published || a.id === editModeArticle?.id)
      );
    } else if (value === "not-published") {
      // Filter only not published articles or the currently edited one
      setFilteredArticles(
        [...articles].filter(
          (a) => !a.published || a.id === editModeArticle?.id
        )
      );
    }
  };

  const validateArticle = (article) => {
    // Check if the title and body exist and is not empty
    if (article.title.trim() && article.body.trim()) {
      // Check if the type is correct
      if (
        typeof article.title === "string" &&
        typeof article.body === "string"
      ) {
        return { result: true };
      } else {
        return {
          result: false,
          error: "Article title and body has to be a string.",
        };
      }
    } else {
      return { result: false, error: "Article title/body can't be empty." };
    }
  };

  return (
    <div className="main-container">
      {error && <ErrorPopup error={error} clearError={() => setError("")} />}
      {isLoading && <div>Loading data...</div>}
      <h1>Article Management System</h1>
      {articles.length === 0 && <p>No available articles</p>}
      {!isLoading && articles.length > 0 && (
        <div>
          {articles[0]?.id !== "new" && (
            <Filter
              editMode={editMode}
              updateFilter={updateFilter}
              value={filter}
            />
          )}
          <Articles
            articles={filteredArticles}
            handleArticleChange={handleArticleChange}
            handleEditCancel={handleEditCancel}
            toggleEditMode={toggleEditMode}
            editModeArticle={editModeArticle}
            editMode={editMode}
            actions={ARTICLE_ACTIONS}
            isUpdating={isUpdating}
          />
        </div>
      )}
      {!editMode && (
        <button
          disabled={isUpdating}
          onClick={(e) => {
            e.preventDefault();
            handleAddNewArticle();
          }}
        >
          Add new article
        </button>
      )}
    </div>
  );
}

export default App;
