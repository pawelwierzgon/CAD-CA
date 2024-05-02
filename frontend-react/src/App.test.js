import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "./App.js";
import axios from "axios";

const articlesAPI = axios.create({
  baseURL: "http://127.0.0.1:5000/",
});

describe("App", () => {
  it("should render the correct heading", () => {
    render(<App articlesAPI={articlesAPI} />);
    const h1 = screen.getByRole("heading");
    expect(h1).toBeInTheDocument();
    expect(h1).toHaveTextContent(/Article Management System/i);
  });

  it("should render Add new article button", () => {
    render(<App articlesAPI={articlesAPI} />);
    const newArticleBtn = screen.queryByText("Add new article");
    expect(newArticleBtn).toBeInTheDocument();
  });

  it("should render a new div with title, body, published, and buttons when creating new article", () => {
    render(<App articlesAPI={articlesAPI} />);
    const newArticleBtn = screen.queryByText("Add new article");
    fireEvent.click(newArticleBtn);

    const newTitle = screen.getByRole("input");

    expect(newTitle).toBeInTheDocument();
  });
});
