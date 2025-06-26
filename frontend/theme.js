document.addEventListener('DOMContentLoaded', function () {
  const themeToggle = document.getElementById('themeToggle');
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  let currentTheme = localStorage.getItem('theme') || (prefersDarkScheme.matches ? 'dark' : 'light');

  // Apply theme
  document.body.setAttribute('data-theme', currentTheme);

  // Toggle theme on click
  themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
  });

  // Watch for system theme changes
  prefersDarkScheme.addListener(e => {
    if (!localStorage.getItem('theme')) {
      currentTheme = e.matches ? 'dark' : 'light';
      document.body.setAttribute('data-theme', currentTheme);
    }
  });
});