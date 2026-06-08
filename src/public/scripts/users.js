// Debounce function
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

// Search functionality with debounce
const searchInput = document.getElementById("searchInput");
const searchForm = document.getElementById("searchForm");

if (searchInput) {
  // Auto focus on search input with cursor at end
  searchInput.focus();
  const length = searchInput.value.length;
  searchInput.setSelectionRange(length, length);

  const debouncedSubmit = debounce(() => {
    searchForm.submit();
  }, 500);

  searchInput.addEventListener("input", debouncedSubmit);
}

// Delete Modal
const deleteModal = document.getElementById("deleteModal");
const deleteBtns = document.querySelectorAll(".delete-btn");
const closeDelete = document.getElementById("closeDelete");
const confirmDelete = document.getElementById("confirmDelete");
const cancelDelete = document.getElementById("cancelDelete");

deleteBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const userId = btn.dataset.id;
    const userName = btn.dataset.name;

    document.getElementById("deleteUserId").value = userId;
    document.getElementById("deleteUserName").textContent = userName;

    deleteModal.style.display = "block";
  });
});

closeDelete.addEventListener("click", () => {
  deleteModal.style.display = "none";
});

cancelDelete.addEventListener("click", () => {
  deleteModal.style.display = "none";
});

confirmDelete.addEventListener("click", async () => {
  const userId = document.getElementById("deleteUserId").value;

  try {
    const response = await fetch(`/users/${userId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      window.location.reload();
    } else {
      alert("Error deleting user");
    }
  } catch (error) {
    alert("Error deleting user");
  }
});

// Close modal when clicking outside
window.addEventListener("click", (e) => {
  if (e.target === deleteModal) {
    deleteModal.style.display = "none";
  }
});
