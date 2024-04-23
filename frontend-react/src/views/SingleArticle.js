import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ErrorPopup from "../components/ErrorPopup";

const SingleArticle = ({ articlesAPI }) => {
  let { articleId } = useParams();
  const [article, setArticle] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // GET a single article
  const getArticle = async (id) => {
    setIsLoading(true);
    await articlesAPI
      .get(`/articles/${id}`)
      .then((res) => setArticle(res.data))
      .catch((err) => setError(err.message));
    setIsLoading(false);
  };

  useEffect(() => {
    getArticle(articleId);
  }, []);

  return (
    <div className="main-container">
      {isLoading && <div>Loading data...</div>}
      {Object.keys(article).length > 0 && (
        <div>
          <p>
            <span className="bold">{article.title}</span> (Article is
            {!article.published && " not "} published!)
          </p>
          <p>{article.body}</p>
        </div>
      )}
      {error && <ErrorPopup error={error} clearError={() => setError("")} />}
    </div>
  );
};

export default SingleArticle;
