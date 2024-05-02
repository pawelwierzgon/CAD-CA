import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App from "./App.js";
import axios from "axios";

const articlesAPI = axios.create({
  baseURL: "http://127.0.0.1:5000/",
});

describe("App", () => {
  it("should render the correct heading", async () => {
    render(
      <MemoryRouter>
        <App articlesAPI={articlesAPI} />
      </MemoryRouter>
    );
    const h1 = await screen.findByRole("heading");
    expect(h1).toBeInTheDocument();
    expect(h1).toHaveTextContent(/Article Management System/i);
  });

  it("should display loading message when loading", async () => {
    render(
      <MemoryRouter>
        <App articlesAPI={articlesAPI} />
      </MemoryRouter>
    );
    const loadingElement = await screen.findByText(/Loading data.../i);
    expect(loadingElement).toBeInTheDocument();
  });

  it("should display no available articles message when there are no articles", async () => {
    render(
      <MemoryRouter>
        <App articlesAPI={articlesAPI} />
      </MemoryRouter>
    );
    const noArticlesElement = await screen.findByText(/No available articles/i);
    expect(noArticlesElement).toBeInTheDocument();
  });

  it("should render Add new article button", async () => {
    render(
      <MemoryRouter>
        <App articlesAPI={articlesAPI} />
      </MemoryRouter>
    );
    const newArticleBtn = await screen.findByText("Add new article");
    expect(newArticleBtn).toBeInTheDocument();
  });

  it("should render a title input, body texarea, and published checkbox when creating new article", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <App articlesAPI={articlesAPI} />
      </MemoryRouter>
    );
    const newArticleBtn = await screen.findByText("Add new article");
    await user.click(newArticleBtn);
    const newTitle = await screen.findByLabelText("Title");
    const newBody = await screen.findByLabelText("Body");
    const newPublished = (await screen.findAllByLabelText("Published")).find(
      (published) => published.id === "publish-checkbox-new"
    );

    expect(newTitle).toBeInTheDocument();
    expect(newBody).toBeInTheDocument();
    expect(newPublished).toBeInTheDocument();
  });

  it("should hide new article inputs when cancelled", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <App articlesAPI={articlesAPI} />
      </MemoryRouter>
    );
    const newArticleBtn = await screen.findByText("Add new article");
    await user.click(newArticleBtn);
    let newTitle = await screen.findByLabelText("Title");
    let newBody = await screen.findByLabelText("Body");
    let newPublished = (await screen.findAllByLabelText("Published")).find(
      (published) => published.id === "publish-checkbox-new"
    );

    const cancelBtn = await screen.findByText("Cancel");
    await user.click(cancelBtn);

    newTitle = screen.queryByLabelText("Title");
    newBody = screen.queryByLabelText("Body");
    newPublished = screen
      .queryAllByLabelText("Published")
      .find((published) => published.id === "publish-checkbox-new");

    expect(newTitle).toEqual(null);
    expect(newBody).toEqual(null);
    expect(newPublished).toEqual(undefined);
  });

  it("should save new article", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <App articlesAPI={articlesAPI} />
      </MemoryRouter>
    );
    const newArticleBtn = await screen.findByText("Add new article");
    let initialNumOfArticles = document.querySelectorAll(".article").length;
    await user.click(newArticleBtn);

    const newTitle = await screen.findByLabelText("Title");
    const newBody = await screen.findByLabelText("Body");
    const newPublished = (await screen.findAllByLabelText("Published")).find(
      (published) => published.id === "publish-checkbox-new"
    );
    await user.type(newTitle, "New Title");
    await user.type(newBody, "New Body");
    await user.click(newPublished);

    const saveBtn = await screen.findByText("Save");
    await user.click(saveBtn);

    let finalNumOfArticles = document.querySelectorAll(".article").length;

    expect(finalNumOfArticles).toEqual(initialNumOfArticles + 1);
  });

  it("should hide the article if filter is changed to Not Published", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <App articlesAPI={articlesAPI} />
      </MemoryRouter>
    );
    await screen.findAllByText("Title");
    const filter = await screen.findByLabelText("Pick a filter");
    let initialNumOfArticles = document.querySelectorAll(".article").length;
    await user.selectOptions(filter, "Not Published");
    let notPublishedArticles = document.querySelectorAll(".article").length;

    expect(initialNumOfArticles).toEqual(notPublishedArticles + 1);
  });

  it("should show the article if filter is changed from Not Published to Published", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <App articlesAPI={articlesAPI} />
      </MemoryRouter>
    );
    await screen.findAllByText("Title");
    const filter = await screen.findByLabelText("Pick a filter");
    await user.selectOptions(filter, "Not Published");
    let notPublishedArticles = document.querySelectorAll(".article").length;
    await user.selectOptions(filter, "Published");
    let publishedArticles = document.querySelectorAll(".article").length;

    expect(publishedArticles).toEqual(notPublishedArticles + 1);
  });

  it("shouldn't save an edited article without a title", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <App articlesAPI={articlesAPI} />
      </MemoryRouter>
    );
    const editArticleBtn = (await screen.findAllByText("Edit"))[0];
    await user.click(editArticleBtn);

    const newTitle = await screen.findByLabelText("Title");
    await user.clear(newTitle);

    const saveBtn = await screen.findByText("Save");
    await user.click(saveBtn);

    const alert = await screen.findByText(
      /Article title\/body can't be empty./i
    );

    expect(alert).toBeInTheDocument();
  });

  it("shouldn't save an edited article without a body", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <App articlesAPI={articlesAPI} />
      </MemoryRouter>
    );
    const editArticleBtn = (await screen.findAllByText("Edit"))[0];
    await user.click(editArticleBtn);

    const newBody = await screen.findByLabelText("Body");
    await user.clear(newBody);

    const saveBtn = await screen.findByText("Save");
    await user.click(saveBtn);

    const alert = await screen.findByText(
      /Article title\/body can't be empty./i
    );

    expect(alert).toBeInTheDocument();
  });

  it("should leave the article untouched when removal is cancelled", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <App articlesAPI={articlesAPI} />
      </MemoryRouter>
    );
    const removeArticleBtn = (await screen.findAllByText("Remove"))[0];
    let initialNumOfArticles = document.querySelectorAll(".article").length;
    global.confirm = () => false;
    await user.click(removeArticleBtn);
    let finalNumOfArticles = document.querySelectorAll(".article").length;

    expect(finalNumOfArticles).toEqual(initialNumOfArticles);
  });

  it("should remove an article", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <App articlesAPI={articlesAPI} />
      </MemoryRouter>
    );
    const removeArticleBtn = (await screen.findAllByText("Remove"))[0];
    let initialNumOfArticles = document.querySelectorAll(".article").length;
    global.confirm = () => true;
    await user.click(removeArticleBtn);
    await waitForElementToBeRemoved(removeArticleBtn);
    let finalNumOfArticles = document.querySelectorAll(".article").length;

    expect(finalNumOfArticles).toEqual(initialNumOfArticles - 1);
  });
});
