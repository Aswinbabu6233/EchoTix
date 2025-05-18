//toggle button
let toggleButton = document.getElementById("dropdown");
function toggle() {
  toggleButton.classList.toggle("show");
}
// Add Artist dynamic button
function addArtist() {
  const container = document.getElementById("artistInputs");
  const newGroup = document.createElement("div");
  newGroup.classList.add("artistGroup");
  newGroup.innerHTML = `
      <input type="text" name="name[]" placeholder="Artist name" required>
      <input type="text" name="role[]" placeholder="Role" required>
      <input type="file" name="photos" required>
      <button type="button" class="remove-btn" onclick="removeArtist(this)">
            ×
          </button>
    `;
  container.appendChild(newGroup);
}
// artist section remove
function removeArtist(button) {
  const group = button.parentElement;
  group.remove();
}
