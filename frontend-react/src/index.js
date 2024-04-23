import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import SingleArticle from "./views/SingleArticle";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";

// 404 page
const NotFound = () => {
  return <div>Page not found</div>;
};

// Axios instance to use with every request
const articlesAPI = axios.create({
  baseURL: "http://127.0.0.1:5000/",
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Router>
    <Routes>
      <Route
        path="/articles/:articleId"
        element={<SingleArticle articlesAPI={articlesAPI} />}
      ></Route>
      <Route
        path="/articles"
        element={<App articlesAPI={articlesAPI} />}
      ></Route>
      <Route path="/" element={<App articlesAPI={articlesAPI} />}></Route>
      <Route path="*" element={<NotFound />}></Route>
    </Routes>
  </Router>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
