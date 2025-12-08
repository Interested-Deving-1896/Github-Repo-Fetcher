// public/js/client.js

/**
 * Validates search form before submission
 */
document.addEventListener('DOMContentLoaded', function () {
  const searchForm = document.getElementById('searchForm');

  if (searchForm) {
    searchForm.addEventListener('submit', function (e) {
      const username = document.getElementById('username');

      // Validate username is not empty
      if (!username.value.trim()) {
        e.preventDefault();
        alert('Please enter a GitHub username or organization.');
        username.focus();
        return false;
      }

      // Show loading spinner
      const spinner = document.getElementById('spinner');
      const submitText = document.getElementById('submitText');
      const submitBtn = document.getElementById('submitBtn');

      if (spinner) {
        spinner.style.display = 'inline-block';
        submitText.textContent = 'Fetching...';
        submitBtn.disabled = true;
      }
    });
  }
});

/**
 * Copy text to clipboard (utility)
 */
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    console.log('Copied to clipboard:', text);
  }).catch(err => {
    console.error('Failed to copy:', err);
  });
}
