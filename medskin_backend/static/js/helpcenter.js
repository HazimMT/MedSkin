// FAQ Toggle with Arrow Rotation
document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
        const answer = button.nextElementSibling;

        // Toggle the answer visibility
        if (answer.style.display === 'block') {
            answer.style.display = 'none';
            button.classList.remove('active');  // Remove arrow rotation
        } else {
            answer.style.display = 'block';
            button.classList.add('active');  // Add arrow rotation
        }
    });
});

// Contact Support Form Submission
document.getElementById('supportForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const userName = document.getElementById('userName').value.trim();
    const userEmail = document.getElementById('userEmail').value.trim();
    const userMessage = document.getElementById('userMessage').value.trim();

    if (!userName || !userEmail || !userMessage) {
        alert('Please fill out all fields!');
        return;
    }

    // Show confirmation message
    const confirmationBox = document.getElementById('supportConfirmation');
    confirmationBox.innerHTML = `Thank you, <strong>${userName}</strong>! Your message has been received. Our support team will contact you at <strong>${userEmail}</strong> shortly.`;
    confirmationBox.classList.remove('hidden');

    // Clear the form
    document.getElementById('supportForm').reset();

    // Hide confirmation after 5 seconds
    setTimeout(() => {
        confirmationBox.classList.add('hidden');
    }, 5000);
});

// Search Help Functionality
function searchHelp() {
    const query = document.getElementById('helpSearch').value.toLowerCase();
    const faqs = document.querySelectorAll('.faq-item');

    faqs.forEach(faq => {
        const question = faq.querySelector('.faq-question').innerText.toLowerCase();
        if (question.includes(query)) {
            faq.style.display = 'block';
        } else {
            faq.style.display = 'none';
        }
    });
}
