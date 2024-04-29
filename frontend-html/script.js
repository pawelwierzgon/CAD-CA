import API from "./utils/API.js";
const articlesContainer = document.querySelector("#articles-container");

let articles = [];
let editMode = false;
let editedArticleId = null;

let genericError = "Something went wrong. Please try again later.";

// Load the articles when the page is loaded
(async () => {
  try {
    await API.getArticles().then((data) => {
      articles = data;
      refreshArticles();
    });
  } catch (e) {
    window.alert(genericError);
  }
})();

const addParagraph = (content, className) => {
  let newParagraph = document.createElement("p");
  newParagraph.className = className;
  newParagraph.innerText = content;
  return newParagraph;
};

const generateArticleDiv = (article) => {
  // Create DOM elements
  let articleDiv = document.createElement("div");
  articleDiv.dataset.articleId = article.id;
  articleDiv.className = "article";

  let idDiv = document.createElement("div");
  idDiv.className = "article-id";
  idDiv.innerText = `#${article.id}`;

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
  title.dataset.articleId = article.id;
  body.dataset.articleId = article.id;
  published.dataset.articleId = article.id;
  title.className = "title";
  body.className = "body";
  published.className = "published";
  publishedDiv.appendChild(published);

  // Buttons section
  let buttonsSection = document.createElement("div");
  let editButton = document.createElement("button");
  editButton.textContent = "Edit";
  editButton.className = "btn btn-edit";
  editButton.id = `btn-edit-${article.id}`;
  editButton.addEventListener("click", () => {
    editMode = true;
    editedArticleId = article.id;
    refreshArticles();
  });

  let removeButton = document.createElement("button");
  removeButton.textContent = "Remove";
  removeButton.className = "btn btn-remove";
  removeButton.id = `btn-remove-${article.id}`;
  removeButton.addEventListener("click", async () => {
    if (window.confirm("Are you sure you want to remove this article?")) {
      try {
        disableInputs(true);
        await API.removeArticle(article).then((res) => {
          if (res.status === 204) {
            articles = articles.filter((a) => a.id !== article.id);
            refreshArticles();
          } else {
            disableInputs(false);
            window.alert(genericError);
          }
        });
      } catch (e) {
        disableInputs(false);
        window.alert(genericError);
      }
    }
  });

  let saveButton = document.createElement("button");
  saveButton.textContent = "Save";
  saveButton.className = "btn btn-save";
  saveButton.id = "btn-save";
  saveButton.addEventListener("click", async () => {
    editMode = false;
    editedArticleId = null;
    const articleIndex = articles.findIndex((a) => a.id === article?.id);
    let newTitle = document.querySelector(
      `input[data-article-id="${article?.id}"]`
    ).value;
    let newBody = document.querySelector(
      `textarea[data-article-id="${article?.id}"]`
    ).value;
    let newPublished = document.querySelector(
      `input[type="checkbox"][data-article-id="${article?.id}"]`
    ).checked;
    let newArticle = {
      id: article?.id,
      title: newTitle,
      body: newBody,
      published: newPublished,
    };

    // Check if the types are correct and if the id exists
    if (
      typeof newArticle.title === "string" &&
      typeof newArticle.body === "string" &&
      typeof newArticle.published === "boolean" &&
      newArticle?.id
    ) {
      // Check if the title, body, and id have value
      if (newArticle.title.trim() && newArticle.body.trim()) {
        disableInputs(true);
        if (article.id === "new") {
          try {
            await API.createArticle(newArticle).then((data) => {
              articles[articles.length - 1] = data;
              refreshArticles();
            });
          } catch (e) {
            window.alert(genericError);
            disableInputs(false, article.id);
          }
        } else {
          try {
            await API.updateArticle(newArticle).then((article) => {
              articles[articleIndex] = article;
              refreshArticles();
            });
          } catch (e) {
            window.alert(genericError);
            disableInputs(false, article.id);
          }
        }
      } else {
        window.alert("The article requires title and body.");
        disableInputs(false, article.id);
      }
    } else {
      window.alert(
        "The article is corrupted. Please refresh the window and try again."
      );
    }
  });

  let cancelButton = document.createElement("button");
  cancelButton.textContent = "Cancel";
  cancelButton.className = "btn btn-cancel";
  cancelButton.id = "btn-cancel";
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
  articleDiv.appendChild(idDiv);
  articleDiv.appendChild(addParagraph("Title", "bold"));
  articleDiv.appendChild(title);
  articleDiv.appendChild(addParagraph("Body", "bold"));
  articleDiv.appendChild(body);
  articleDiv.appendChild(publishedDiv);
  articleDiv.appendChild(buttonsSection);

  return articleDiv;
};

const disableInputs = (boolean, articleId) => {
  // Disable all inputs
  if (boolean) {
    document
      .querySelectorAll("button, input, textarea")
      .forEach((el) => (el.disabled = true));
  } else if (!boolean && articleId) {
    // Enable inputs for a given article
    document
      .querySelectorAll(
        `input[data-article-id="${articleId}"], textarea[data-article-id="${articleId}"], #btn-save, #btn-cancel`
      )
      .forEach((el) => (el.disabled = false));
  } else {
    // Enable all common buttons (edit, remove, new article)
    document
      .querySelectorAll("button")
      .forEach((btn) => (btn.disabled = false));
  }
};

const refreshArticles = () => {
  articlesContainer.innerHTML = "";
  articles.forEach((article) => {
    articlesContainer.appendChild(generateArticleDiv(article));
  });

  // New article button
  let newArticleButton = document.createElement("button");
  newArticleButton.textContent = "New article";
  newArticleButton.id = `btn-new`;
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
