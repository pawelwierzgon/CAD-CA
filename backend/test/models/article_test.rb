require "test_helper"

class ArticleTest < ActiveSupport::TestCase
  test "should not save article without title" do
    article = Article.new(body: "Body of the article", published: false)
    assert_not article.save, "Saved the article without a title"
  end

  test "should not save article without body" do
    article = Article.new(title: "Title of the article", published: false)
    assert_not article.save, "Saved the article without a body"
  end

  test "should save article with default published value" do
    article = Article.new(title: "Title of the article", body: "Body of the article")
    assert article.save
    assert_not article.published, "Published attribute was not set to false by default"
  end
end
