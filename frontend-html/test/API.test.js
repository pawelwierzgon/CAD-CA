import API from "../utils/API.js";

let articles;

describe("getArticles()", () => {
  it("should return an array", async () => {
    articles = await API.getArticles();
    expect(Array.isArray(articles)).toEqual(true);
  });
});

describe("createArticles()", () => {
  it("should create a new article", async () => {
    let currentLength = articles.length;
    const newArticle = {
      title: "New Title",
      body: "New Body",
    };
    await API.createArticle(newArticle);
    articles = await API.getArticles();
    expect(articles.length).toEqual(currentLength + 1);
  });

  it("should return a new article", async () => {
    const newArticle = {
      title: "New Title",
      body: "New Body",
    };
    let data = await API.createArticle(newArticle);
    expect(data).toHaveProperty("id");
    expect(data).toHaveProperty("title");
    expect(data).toHaveProperty("body");
    expect(typeof data.id).toEqual("number");
    expect(data.title).toEqual(newArticle.title);
    expect(data.body).toEqual(newArticle.body);
  });

  it("shouldn't create a new article when there is no title", async () => {
    const newArticle = {
      title: "",
      body: "New Body",
    };
    let data = await API.createArticle(newArticle);
    expect(data).toEqual({ title: ["can't be blank"] });
  });

  it("shouldn't create a new article when there is no body", async () => {
    const newArticle = {
      title: "New Title",
      body: "",
    };
    let data = await API.createArticle(newArticle);
    expect(data).toEqual({ body: ["can't be blank"] });
  });

  it("shouldn't create a new article when there is no title and no body", async () => {
    const newArticle = {
      title: "",
      body: "",
    };
    let data = await API.createArticle(newArticle);
    expect(data).toEqual({
      title: ["can't be blank"],
      body: ["can't be blank"],
    });
  });
});

describe("updateArticle()", () => {
  it("should update an article", async () => {
    const existingArticle = articles[0];
    await API.updateArticle({
      ...existingArticle,
      title: existingArticle.title + "-TEST",
      body: existingArticle.body + "-TEST",
    });
    articles = await API.getArticles();
    expect(articles[0].id).toEqual(existingArticle.id);
    expect(articles[0].title).toEqual(existingArticle.title + "-TEST");
    expect(articles[0].body).toEqual(existingArticle.body + "-TEST");
  });

  it("shouldn't update an article when there is no title", async () => {
    const existingArticle = articles[0];
    const response = await API.updateArticle({
      ...existingArticle,
      title: "",
    });
    expect(response).toEqual({ title: ["can't be blank"] });
  });

  it("shouldn't update an article when there is no body", async () => {
    const existingArticle = articles[0];
    const response = await API.updateArticle({
      ...existingArticle,
      body: "",
    });
    expect(response).toEqual({ body: ["can't be blank"] });
  });

  it("shouldn't update an article when there is no title and no body", async () => {
    const existingArticle = articles[0];
    const response = await API.updateArticle({
      ...existingArticle,
      title: "",
      body: "",
    });
    expect(response).toEqual({
      title: ["can't be blank"],
      body: ["can't be blank"],
    });
  });
});

describe("removeArticle()", () => {
  it("should return status 204 when removing an article", async () => {
    articles = await API.getArticles();
    let data = await API.removeArticle(articles[0]);
    expect(data?.status).toEqual(204);
  });

  it("should return status 404 when the article does not exist", async () => {
    articles = await API.getArticles();
    let data = await API.removeArticle({
      ...articles[0],
      id: -1,
    });
    expect(data?.status).toEqual(404);
  });
});
