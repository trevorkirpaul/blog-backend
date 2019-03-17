const { gql } = require('apollo-server')

const typeDefs = gql`
  type Article {
    id: ID
    title: String
    content: String
  }

  type Element {
    id: ID
    title: String
    content: String
    # title: String
  }

  type User {
    id: ID
    email: String
    password: String
  }

  type Post {
    id: ID
    title: String
    body: String
    author: User
    userLikes: [User]
    userDisLikes: [User]
    childComments: [Comment]
  }

  type Comment {
    id: ID
    body: String
    author: User
    parentComment: Comment
    childComments: [Comment]
    parentPost: Post
    userLikes: [User]
    userDisLikes: [User]
  }

  type Response {
    message: String
    success: Boolean
    error: Boolean
    token: String
  }

  type ValidateResponse {
    validated: Boolean
  }

  type PostResponse {
    message: String
    error: Boolean
  }

  type CommentResponse {
    message: String
    error: Boolean
    comment: Comment
  }

  type Query {
    users: [User]
    posts: [Post]
    comments: [Comment]
    articles: [Article]
    elements: [Element]
  }

  type Mutation {
    createUser(email: String, password: String): User
    login(email: String, password: String): Response
    validate(token: String): ValidateResponse

    createPost(title: String, body: String, author: ID): Post
    updatePost(title: String, body: String, postID: ID): Post
    deletePost(postID: ID): Post
    likePost(postID: ID, authorID: ID): Post
    disLikePost(postID: ID, authorID: ID): Post
    clearLikeAndDisLike(postID: ID, authorID: ID): Post

    createComment(
      body: String!
      authorID: ID!
      parentCommentID: ID
      parentPostID: ID
    ): CommentResponse
    likeComment(commentID: ID, authorID: ID): CommentResponse
    dislikeComment(commentID: ID, authorID: ID): CommentResponse
    clearLikeAndDislikeComment(commentID: ID, authorID: ID): CommentResponse
  }
`

module.exports = typeDefs
