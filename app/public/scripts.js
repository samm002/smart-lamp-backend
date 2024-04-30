const currentTime = document.getElementById('currentTime')
  const buttonOn = document.getElementById('lampOn')
  const buttonOff = document.getElementById('lampOff')
  const lampStatus = document.getElementById('lampState')
  const logs = document.getElementById('logs');
  const popup = document.getElementById('popup');
  const closePopup = document.getElementById('closePopup');

  function updateCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const currentTimeString = `${hours}:${minutes}:${seconds}`;
    currentTime.textContent = currentTimeString;
  }

  updateCurrentTime();

  setInterval(updateCurrentTime, 1000);

  buttonOn.addEventListener('click', () => {
    lampStatus.textContent = "ON"
  })

  buttonOff.addEventListener('click', () => {
    lampStatus.textContent = "OFF"
  })

  logs.addEventListener('click', () => {
    popup.style.display = popup.style.display === 'block' ? 'none' : 'block';
  });

  closePopup.addEventListener('click', () => {
      popup.style.display = 'none';
  });