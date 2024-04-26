const baseURL = "http://localhost:5000/articles";

const getArticles = async () => {
  const data = await fetch(baseURL);
  const json = await data.json();
  return json;
};

const createArticle = async (article) => {
  const data = await fetch(baseURL, {
    method: "POST",
    body: JSON.stringify(article),
    headers: { "Content-Type": "application/json" },
  });
  const json = await data.json();
  return json;
};

const updateArticle = async (article) => {
  if (article?.id) {
    const res = await fetch(`${baseURL}/${article.id}`, {
      method: "PATCH",
      body: JSON.stringify(article),
      headers: { "Content-Type": "application/json" },
    });
    const json = await res.json();
    return json;
  } else {
    throw new Error("No article id");
  }
};

const removeArticle = async (article) => {
  if (article?.id) {
    return await fetch(`${baseURL}/${article.id}`, {
      method: "DELETE",
    });
  } else {
    throw new Error("No article id");
  }
};

const API = { getArticles, createArticle, updateArticle, removeArticle };

export default API;
