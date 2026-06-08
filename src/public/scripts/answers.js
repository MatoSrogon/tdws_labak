let currentOffset = 0;
const INITIAL_LIMIT = 3;
const LOAD_MORE_LIMIT = 5;
let questionId;
let currentUserId;

document.addEventListener("DOMContentLoaded", () => {
  const answerForm = document.getElementById("answerForm");
  const loadMoreButton = document.getElementById("loadMoreAnswers");

  if (answerForm) {
    questionId = answerForm.dataset.questionId;
    currentUserId = answerForm.dataset.currentUserId
      ? parseInt(answerForm.dataset.currentUserId)
      : null;
    answerForm.addEventListener("submit", handleAnswerSubmit);
  }

  if (loadMoreButton) {
    loadMoreButton.addEventListener("click", loadMoreAnswers);
  }

  // Load initial answers
  if (questionId) {
    loadAnswers(INITIAL_LIMIT);
  }
});

async function handleAnswerSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const messageDiv = document.getElementById("answerFormMessage");

  const answerData = {
    comment: formData.get("comment"),
  };

  try {
    const response = await axios.post(
      `/questions/${questionId}/answers`,
      answerData
    );

    messageDiv.textContent = "Answer submitted successfully!";
    messageDiv.style.color = "green";

    form.reset();

    // Reload answers
    currentOffset = 0;
    loadAnswers(INITIAL_LIMIT, true);
  } catch (error) {
    messageDiv.textContent =
      error.response?.data?.error || "Failed to submit answer";
    messageDiv.style.color = "red";
  }
}

async function loadAnswers(limit, reset = false) {
  if (reset) {
    currentOffset = 0;
    document.getElementById("answersList").innerHTML = "";
  }

  try {
    const response = await axios.get(
      `/questions/${questionId}/answers?limit=${limit}&offset=${currentOffset}`
    );

    const answers = response.data;

    if (answers.length === 0) {
      if (currentOffset === 0) {
        document.getElementById("answersList").innerHTML =
          "<p>No answers yet. Be the first to answer!</p>";
      }
      document.getElementById("loadMoreAnswers").style.display = "none";
      document.getElementById("noMoreAnswers").style.display = "block";
      return;
    }

    displayAnswers(answers);

    currentOffset += answers.length;

    // Show load more button if we got full limit
    if (answers.length === limit) {
      document.getElementById("loadMoreAnswers").style.display = "block";
      document.getElementById("noMoreAnswers").style.display = "none";
    } else {
      document.getElementById("loadMoreAnswers").style.display = "none";
      document.getElementById("noMoreAnswers").style.display = "block";
    }
  } catch (error) {
    console.error("Failed to load answers:", error);
  }
}

function displayAnswers(answers) {
  const answersList = document.getElementById("answersList");

  answers.forEach((answer) => {
    const answerElement = document.createElement("div");
    answerElement.className = "answer-item";
    answerElement.dataset.answerId = answer.id;

    const date = new Date(answer.created_at).toLocaleDateString("sk");

    const isAuthor = currentUserId && currentUserId === answer.user_id;
    const actionsHtml = isAuthor
      ? `
      <div class="answer-actions">
        <button class="btn-edit-answer" onclick="editAnswer(${answer.id})">Edit</button>
        <button class="btn-delete-answer" onclick="deleteAnswer(${answer.id})">Delete</button>
      </div>
    `
      : "";

    answerElement.innerHTML = `
      <div class="answer-header">
        <span class="answer-date">${date}</span>
      </div>
      <p class="answer-text">${answer.text}</p>
      ${actionsHtml}
    `;

    answersList.appendChild(answerElement);
  });
}

function loadMoreAnswers() {
  loadAnswers(LOAD_MORE_LIMIT);
}

let currentEditAnswerId = null;
let currentDeleteAnswerId = null;

function editAnswer(answerId) {
  const answerElement = document.querySelector(
    `[data-answer-id="${answerId}"]`
  );
  const textElement = answerElement.querySelector(".answer-text");
  const currentText = textElement.textContent;

  currentEditAnswerId = answerId;

  document.getElementById("editComment").value = currentText;
  document.getElementById("editAnswerModal").style.display = "block";
}

function closeEditAnswerModal() {
  document.getElementById("editAnswerModal").style.display = "none";
  currentEditAnswerId = null;
}

document
  .getElementById("editAnswerForm")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!currentEditAnswerId) return;

    const comment = document.getElementById("editComment").value;

    try {
      await axios.patch(`/answers/${currentEditAnswerId}`, {
        comment: comment,
      });

      const answerElement = document.querySelector(
        `[data-answer-id="${currentEditAnswerId}"]`
      );
      answerElement.querySelector(".answer-text").textContent = comment;

      closeEditAnswerModal();
    } catch (error) {
      alert(error.response?.data?.error || "Failed to update answer");
    }
  });

function deleteAnswer(answerId) {
  currentDeleteAnswerId = answerId;
  document.getElementById("deleteAnswerModal").style.display = "block";
}

function closeDeleteAnswerModal() {
  document.getElementById("deleteAnswerModal").style.display = "none";
  currentDeleteAnswerId = null;
}

async function confirmDeleteAnswer() {
  if (!currentDeleteAnswerId) return;

  try {
    await axios.delete(`/answers/${currentDeleteAnswerId}`);

    const answerElement = document.querySelector(
      `[data-answer-id="${currentDeleteAnswerId}"]`
    );
    answerElement.remove();

    closeDeleteAnswerModal();
  } catch (error) {
    alert(error.response?.data?.error || "Failed to delete answer");
  }
}
