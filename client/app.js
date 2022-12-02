const GRAPHQL_URL = "http://localhost:9000/";

document.getElementById("fullView").checked = false;

selectedCategory = "";
selectedView = false;

async function doRequest(query, id = null, fullView = false, category = "") {
  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query: query,
      variables: {
        fullView: fullView,
        id: id,
        category: category,
      },
    }),
  });

  const { data } = await response.json();
  return data;
}

function createPost(e) {
  e.preventDefault();

  let title = document.getElementById("title").value;
  let content = document.getElementById("content").value;
  let category = document.getElementById("category").value;

  doRequest(
    `
              mutation {
                  createPost( postInput: { title: "${title}", content: "${content}", category: "${category}" }) {
                      _id
                  }
              }
            `
  ).then(({ data }) => {
    document.getElementById("title").value = "";
    document.getElementById("content").value = "";
    getPosts();
  });
}

function editPost(id) {
  doRequest(
    `
  query {
    getPost(id: "${id}") {
        title
        content
    }
  } 
  `,
    id
  ).then(({ getPost }) => {
    document.getElementById("edit_title").value = getPost.title;
    document.getElementById("edit_content").value = getPost.content;
    document.getElementById("edit_id").value = id;

    document.getElementById("popup").style.display = "block";
    document.getElementById("mask").style.display = "block";
  });
}

function cancel(e) {
  e.preventDefault();
  document.getElementById("popup").style.display = "none";
  document.getElementById("mask").style.display = "none";
}

function updatePost(e) {
  e.preventDefault();

  let title = document.getElementById("edit_title").value;
  let content = document.getElementById("edit_content").value;
  let id = document.getElementById("edit_id").value;

  doRequest(`
    mutation {
        updatePost( postInput: {id: "${id}", title: "${title}", content: "${content}"}) {
            _id
        }
    }
  `).then(() => {
    document.getElementById("popup").style.display = "none";
    document.getElementById("mask").style.display = "none";
    getPosts();
  });
}

function reloadPosts(e) {
  selectedView = e.target.checked;
  getPosts(selectedCategory);
}

function getPosts(category = "") {
  selectedCategory = category;
  fullView = selectedView;

  doRequest(
    `
                query getPostsQuery($fullView: Boolean!) {
                    getPosts (category: "${category}") {
                        _id
                        title
                        content @include(if: $fullView)
                    }
                }
              `,
    null,
    fullView,
    category
  ).then(({ getPosts }) => {
    var result = "";

    getPosts.forEach((post) => {
      if (post.title) {
        result += `<h3><span id="title${post._id}">${post.title}</span> <a onclick="editPost('${post._id}')">(E)</a> <a onclick="deletePost('${post._id}')">(X)</a></h3>`;
      }

      if (post.content) {
        result += `<h4><span id="title${post._id}">${post.content}</span></h4>`;
      }

      result += "<hr />";
    });

    document.getElementById("posts").innerHTML = result;
  });
}

function deletePost(id) {
  doRequest(`
    mutation {
        deletePost(id: "${id}")
    }
  `).then((data) => {
    getPosts();
  });
}

function getCategories() {
  doRequest(
    `
    query {
        getCategories
    }
    `,
    null,
    null
  ).then(({ getCategories }) => {
    console.log(getCategories);

    let categoriesFilter = "";
    categoriesFilter += '<div class="filterCategory">';
    categoriesFilter += `<a onclick="getPosts('')">ALL</a>`;
    categoriesFilter += "</div>";

    let categoriesSelect = '<select id="category">';

    getCategories.forEach((category) => {
      categoriesFilter += '<div class="filterCategory">';
      categoriesFilter += `<a onclick="filterPosts('${category}')">${category}</a>`;
      categoriesFilter += "</div>";

      categoriesSelect += `<option id="${category}">${category}</option>`;
    });

    categoriesSelect += "</select>";

    document.getElementById("categoriesFilter").innerHTML = categoriesFilter;
    document.getElementById("categoriesSelect").innerHTML = categoriesSelect;
  });
}

//Pre OPTIMALIZACIU KODU
// async function createPost(e) {
//   e.preventDefault();

//   let title = document.getElementById("title").value;
//   let content = document.getElementById("content").value;

//   const response = await fetch(GRAPHQL_URL, {
//     method: "POST",
//     headers: {
//       "content-type": "application/json",
//     },
//     body: JSON.stringify({
//       query: `
//             mutation {
//                 createPost( postInput: { title: "${title}", content: "${content}" }) {
//                     _id
//                 }
//             }
//             `,
//     }),
//   });

//   const { data } = await response.json();
//   return data;
// }

// async function getPosts() {
//   const response = await fetch(GRAPHQL_URL, {
//     method: "POST",
//     headers: {
//       "content-type": "application/json",
//     },
//     body: JSON.stringify({
//       query: `
//              query {
//                 getPosts {
//                     _id
//                     title
//                     content
//                 }
//              }
//               `,
//     }),
//   });

//   const { data } = await response.json();
//   return data;
// }
