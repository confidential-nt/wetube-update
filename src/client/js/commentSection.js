const videoContainer = document.querySelector("#videoContainer");
const form = document.querySelector("#commentForm"); // 로그인 안되어있으면 form = null 일 것이다.
const videoComments = document.querySelector(".video__comments ul");

const handleDelete = (e) => {
  const videoComments = document.querySelector(".video__comments ul");
  if (e.target.id !== "deleteBtn") return;

  const li = e.target.parentElement;
  const { id } = li.dataset;

  videoComments.removeChild(li);

  fetch(`/api/comments/${id}`, {
    method: "DELETE",
  });
};

const addComment = (text, id) => {
  const li = document.createElement("li");
  li.className = "video__comment";
  li.dataset.id = id;
  li.innerHTML = `<i class="fas fa-comment"></i><span> ${text}</span><span id="deleteBtn"> ❌</span>`;
  videoComments.prepend(li);
};

const handleSubmit = async (e) => {
  e.preventDefault();
  // form = null 인 상황을 대비해 함수 안에다가 변수생성.
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
  if (text === "") return;
  const videoId = videoContainer.dataset.id;

  const response = await fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (response.status === 201 && videoComments) {
    textarea.value = "";
    const { newCommentId } = await response.json(); // response의 body를 얻기위해.
    addComment(text, newCommentId);
  }
};

if (form) {
  form.addEventListener("submit", handleSubmit);
}
if (videoComments) {
  videoComments.addEventListener("click", handleDelete);
}
