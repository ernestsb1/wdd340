function updateDateTime() {
    const date = new Date();
    document.getElementById("date").innerHTML = date.toLocaleDateString();
    document.getElementById("time").innerHTML = date.toLocaleTimeString();
  }
  setInterval(updateDateTime, 1000);
  updateDateTime();
