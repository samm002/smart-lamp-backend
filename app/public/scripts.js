const currentTime = document.getElementById('currentTime');
const currentIndex = document.getElementById('currentIndex');
const buttonOn = document.getElementById('lampOn');
const buttonOff = document.getElementById('lampOff');
const lampStatus = document.getElementById('currentLampState');
const logs = document.getElementById('logs');
const popup = document.getElementById('popup');
const closePopup = document.getElementById('closePopup');
const selectDevice = document.getElementById('selectDevice');
const fullControlToggle = document.querySelector('.toggle-switch');
const emptyRecord = "Record is Empty";

let fullControl = false;
let currentLampStateValue;
let buttonState;
let currentFullControl;

let socket = io();

function updateCurrentTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const currentTimeString = `${hours}:${minutes}:${seconds}`;
  currentTime.textContent = currentTimeString;
  socket.on('current device', function(data) {
    selectDevice.value = data;
  })
}

socket.emit('current device', selectDevice.value);
updateCurrentTime();

setInterval(updateCurrentTime, 1000);

fullControlToggle.onclick = () => {
  fullControlToggle.classList.toggle('active');
  let toggleStatus = fullControlToggle.classList.contains('active');
  if (toggleStatus) {
    fullControl = true;
  } else {
    fullControl = false;
  }
  socket.emit('fullControlUpdate', fullControl);
};

selectDevice.addEventListener('change', () => {
  socket.emit('current device', selectDevice.value);
})

buttonOn.addEventListener('click', () => {
  latestLampState = lampStatus.textContent.trim();
  buttonState = true;
  socket.emit('triggerButton', buttonState, latestLampState);
});

buttonOff.addEventListener('click', () => {
  latestLampState = lampStatus.textContent.trim();
  buttonState = false;
  socket.emit('triggerButton', buttonState, latestLampState);
});

logs.addEventListener('click', () => {
  popup.style.display = popup.style.display === 'block' ? 'none' : 'block';
});

closePopup.addEventListener('click', () => {
  popup.style.display = 'none';
});

socket.on('current full control', (data) => {
  data = (data == 'yes')
  if (data) {
    fullControlToggle.classList.add('active');
  } else {
    fullControlToggle.classList.remove('active');
  }
});

socket.on('current lamp state', (data) => {
  let currentLampState = document.getElementById('currentLampState');
  let currentLampStateTime = document.getElementById('lampStateTime');
  currentFullControl = data?.full_control;
  currentLampState.innerHTML = ""
  currentLampStateTime.innerHTML = ""

  const lampState = document.createElement("p");
  const lampStateTime = document.createElement("p");
  lampState.textContent = data?.state?.toUpperCase() ?? emptyRecord;
  lampStateTime.textContent = data?.timestamp ?? emptyRecord;;
  currentLampState.appendChild(lampState);
  currentLampStateTime.appendChild(lampStateTime);
})

socket.on('log', (response) => {
  let lampStates = response.lampStates;
  let total = response.total
  let logTable = document.getElementById("lampStates");
  let totalLampState = document.getElementById('totalLampState');
  logTable.innerHTML = "";
  totalLampState.innerHTML = "";  

  let totalState = document.createElement("span");
  totalState.textContent = total;
  totalLampState.appendChild(totalState);

  let pageSize = 10;
  let currentPage = 0;

  function loadPage(page) {
    logTable.innerHTML = "";
    let headerRow = document.createElement("tr");
    let headers = ["Device ID", "State", "Trigger", "Full Control", "Timestamp"];
    headers.forEach(function(headerText, index) {
      let header = document.createElement("th");
      header.textContent = headerText;
      if (index === 2) {
        header.style.width = "200px";
      }
      headerRow.appendChild(header);
    });

    logTable.appendChild(headerRow);
    let start = page * pageSize;
    let end = Math.min(start + pageSize, lampStates.length);
    
    for (let i = start; i < end; i++) {
      let row = document.createElement("tr");
      Object.values(lampStates[i]).forEach(function(value, index) {
        let cell = document.createElement("td");
        if (index === 2) {
          cell.style.width = "200px";
        }
        cell.textContent = value;
        row.appendChild(cell);
      });
      logTable.appendChild(row);
    }
  }

  loadPage(currentPage);

  document.getElementById("prevPage").addEventListener("click", () => {
    if (currentPage > 0) {
      currentPage--;
      loadPage(currentPage);
    }
  });
  
  document.getElementById("nextPage").addEventListener("click", () => {
    if ((currentPage + 1) * pageSize < lampStates.length) {
      currentPage++;
      loadPage(currentPage);
    }
  });
});