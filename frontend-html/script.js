const articlesContainer = document.querySelector("#articles-container");

const baseURL = "http://localhost:5000/articles";
let articles = [];
let editMode = false;
let editedArticleId = null;

const getArticles = async () => {
  await fetch(baseURL).then((res) =>
    res.json().then((json) => {
      articles = json;
      refreshArticles();
    })
  );
};

getArticles();

const addParagraph = (content, className) => {
  let newParagraph = document.createElement("p");
  newParagraph.className = className;
  newParagraph.innerText = content;
  return newParagraph;
};

const generateArticleDiv = (article) => {
  // Create DOM elements
  let articleDiv = document.createElement("div");
  articleDiv.className = "article";
  let title = document.createElement("p");
  let body = document.createElement("p");
  let publishedDiv = document.createElement("div");
  publishedDiv.innerText = `Published: `;
  publishedDiv.className = "bold";
  let published = document.createElement("input");
  published.checked = article.published;
  published.type = "checkbox";

  // Populate the elements
  if (editMode && article.id === editedArticleId) {
    title = document.createElement("input");
    title.type = "text";
    title.value = article.title;
    body = document.createElement("textarea");
    body.value = article.body;
  } else {
    title.innerText = article.title;
    body.innerText = article.body;
    published.value = article.published;
    published.disabled = true;
  }
  publishedDiv.appendChild(published);
  title.dataset.articleId = article.id;
  body.dataset.articleId = article.id;
  published.dataset.articleId = article.id;

  // Buttons section
  let buttonsSection = document.createElement("div");
  let editButton = document.createElement("button");
  editButton.textContent = "Edit";
  editButton.addEventListener("click", () => {
    editMode = true;
    editedArticleId = article.id;
    refreshArticles();
  });

  let removeButton = document.createElement("button");
  removeButton.textContent = "Remove";
  removeButton.addEventListener("click", () => {
    if (window.confirm("Are you sure you want to remove this article?")) {
      removeArticle(article);
    }
  });

  let saveButton = document.createElement("button");
  saveButton.textContent = "Save";
  saveButton.addEventListener("click", () => {
    editMode = false;
    editedArticleId = null;
    const articleIndex = articles.findIndex((a) => a.id === article.id);
    let newTitle = document.querySelector(
      `input[data-article-id="${article.id}"]`
    ).value;
    let newBody = document.querySelector(
      `textarea[data-article-id="${article.id}"]`
    ).value;
    let newPublished = document.querySelector(
      `input[type="checkbox"][data-article-id="${article.id}"]`
    ).checked;
    let newArticle = {
      id: article.id,
      title: newTitle,
      body: newBody,
      published: newPublished,
    };
    // TODO: Add checks for article, required content and its type (title + body)
    if (article.id === "new") {
      createArticle(newArticle);
    } else {
      updateArticle(newArticle);
    }
    articles[articleIndex] = newArticle;
    refreshArticles();
  });

  let cancelButton = document.createElement("button");
  cancelButton.textContent = "Cancel";
  cancelButton.addEventListener("click", () => {
    editMode = false;
    editedArticleId = null;
    if (articles[articles.length - 1]?.id === "new") {
      articles.pop();
    }
    refreshArticles();
  });

  // Append buttons
  if (article.id === editedArticleId) {
    buttonsSection.appendChild(saveButton);
    buttonsSection.appendChild(cancelButton);
  } else if (!editMode) {
    buttonsSection.appendChild(editButton);
    buttonsSection.appendChild(removeButton);
  }

  // Append elements to the article div container
  articleDiv.appendChild(addParagraph("Title:", "bold"));
  articleDiv.appendChild(title);
  articleDiv.appendChild(addParagraph("Body:", "bold"));
  articleDiv.appendChild(body);
  articleDiv.appendChild(publishedDiv);
  articleDiv.appendChild(buttonsSection);

  return articleDiv;
};

const refreshArticles = () => {
  articlesContainer.innerHTML = "";
  articles.forEach((article) => {
    articlesContainer.appendChild(generateArticleDiv(article));
  });

  // New article button
  let newArticleButton = document.createElement("button");
  newArticleButton.textContent = "New article";
  newArticleButton.addEventListener("click", () => {
    articles.push({
      id: "new",
      title: "",
      body: "",
      published: false,
    });
    editMode = true;
    editedArticleId = "new";
    refreshArticles();
  });
  if (!editMode) {
    articlesContainer.appendChild(newArticleButton);
  }
};

const createArticle = async (article) => {
  await fetch(baseURL, {
    method: "POST",
    body: JSON.stringify(article),
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => {
      if (res.status === 201) {
        return res.json();
      }
    })
    .then((data) => {
      articles[articles.length - 1] = data;
      refreshArticles();
    });
};

const updateArticle = async (article) => {
  await fetch(`${baseURL}/${article.id}`, {
    method: "PATCH",
    body: JSON.stringify(article),
    headers: { "Content-Type": "application/json" },
  }).then((res) => {
    if (res.status === 200) {
      return true;
    }
  });
};

const removeArticle = async (article) => {
  await fetch(`${baseURL}/${article.id}`, {
    method: "DELETE",
  }).then((res) => {
    if (res.status === 204) {
      articles = articles.filter((a) => a.id !== article.id);
      refreshArticles();
    }
  });
};
