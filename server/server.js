const mongoose = require("mongoose");
const { ApolloServer, gql } = require("apollo-server");
const Post = require("./models/post");

const typeDefs = gql`
  enum Category {
    Sport
    Music
    Programming
    Food
  }

  type Post {
    _id: ID!
    title: String!
    content: String!
    category: Category
  }

  input PostInputData {
    id: ID
    title: String!
    content: String!
    category: String!
  }

  type Mutation {
    createPost(postInput: PostInputData): Post!
    updatePost(postInput: PostInputData): Post!
    deletePost(id: ID!): Boolean
  }

  type Query {
    greeting: String
    getPosts(category: String): [Post]
    getPost(id: ID!): Post
    getCategories: [Category]
  }
`;

const category = {
  Sport: "Sport",
  Music: "Music",
  Programming: "Programming",
  Food: "Food",
};

const resolvers = {
  Query: {
    greeting: () => "Hello GraphQL World!",

    getPosts: async (_, args) => {
      let filter = {};
      if (args.category != "") {
        filter = {
          category: args.category,
        };
      }
      const posts = await Post.find(filter);
      return posts;
    },

    getPost: async (_, args) => {
      const post = await Post.findById(args.id);
      return post;
    },

    getCategories: () => {
      return Object.keys(category);
    },
  },

  Mutation: {
    createPost: async (_, { postInput }) => {
      const post = new Post({
        title: postInput.title,
        content: postInput.content,
        category: postInput.category,
      });
      const createPost = await post.save();
      return { _id: createPost._id.toString() };
    },

    updatePost: async (_, { postInput }) => {
      let filter = { _id: postInput.id };
      let update = { title: postInput.title, content: postInput.content };
      const post = await Post.findByIdAndUpdate(filter, update);
      return { _id: createPost._id.toString() };
    },

    deletePost: async (_, { id }) => {
      await Post.findByIdAndDelete(id);
      return true;
    },
  },
};

mongoose
  .connect(
    "mongodb+srv://adam:HESLO@cluster0.0ydqop0.mongodb.net/?retryWrites=true&w=majority"
  )
  .then((result) => {
    console.log("connected");
    console.log(result);

    const server = new ApolloServer({ typeDefs, resolvers });

    server
      .listen({ port: 9000 })
      .then(({ url }) => console.log(`Server running ${url}`));
  })
  .catch((err) => console.log(err));
