document.getElementById("test-booking-form").addEventListener("submit", (event) => {
  event.preventDefault();
  document.getElementById("test-result").textContent = "Demo completed. No reservation was submitted.";
});
