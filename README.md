# GraphQL Apollo Blog Backend

## Requirements

### config.js

You'll need a `config.js` at the project root in order to run this project. It will need to look like this:

```javascript
module.exports = {
  user: '',
  pw: '',
  mongoDBURI: (username, password) => {
    return `mongodb+srv://${username}:${password}@<URI-FROM-ATLAS>`
  },
  secret: '',
}
```

This will be used in `index.js` to connect to your atlas mongoDB cluster. `mongoDBURI` will take in the `user` and `pw` values from the object above.

## About this project

This is the backend for a long term project I'm working on. The main focus is to learn how to build an Apollo server and an Apollo frontend in React. The end result will be a blog / reddit clone. I'll also try to use more advanced mongoDB patterns.
