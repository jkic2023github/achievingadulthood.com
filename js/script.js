// script.js
document.addEventListener('DOMContentLoaded', function() {
    const logo = document.getElementById('logo');
    const images = ['profile.jpg', 'profile1.jpg']; // Array of image sources
    let currentIndex = 0; // Initial index to display the first image

    function toggleImage() {
        logo.src = images[currentIndex];
        currentIndex = (currentIndex + 1) % images.length; // Toggle between 0 and 1
    }

    setInterval(toggleImage, 2000); // Change the image every 2 seconds (2000 milliseconds)
});
