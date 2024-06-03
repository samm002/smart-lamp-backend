const currentTime = document.getElementById('currentTime');
const currentIndex = document.getElementById('currentIndex');
const buttonOn = document.getElementById('lampOn');
const buttonOff = document.getElementById('lampOff');
const lampStatus = document.getElementById('currentLampState');
const logs = document.getElementById('logs');
const popup = document.getElementById('popup');
const closePopup = document.getElementById('closePopup');
const fullControlToggle = document.querySelector('.toggle-switch');
let fullControl = false;

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

fullControlToggle.onclick = function() {
  fullControlToggle.classList.toggle('active');
  let toggleStatus = fullControlToggle.classList.contains('active');
  if (toggleStatus) {
    fullControl = true;
  } else {
    fullControl = false;
  }
  socket.emit('fullControlUpdate', fullControl);
};

buttonOn.addEventListener('click', () => {
  const currentLampStateValue = lampStatus.textContent.trim();
  socket.emit('turnOnLampButton', currentLampStateValue);
})

buttonOff.addEventListener('click', () => {
  const currentLampStateValue = lampStatus.textContent.trim();
  socket.emit('turnOffLampButton', currentLampStateValue);
})

logs.addEventListener('click', () => {
  popup.style.display = popup.style.display === 'block' ? 'none' : 'block';
});

closePopup.addEventListener('click', () => {
  popup.style.display = 'none';
});

// Socket.io Client Scripts
var socket = io();

socket.on('current lamp state', function(data) {
  var currentLampState = document.getElementById('currentLampState');
  var currentLampStateTime = document.getElementById('lampStateTime');
  currentLampState.innerHTML = ""
  currentLampStateTime.innerHTML = ""

  const lampState = document.createElement("p");
  const lampStateTime = document.createElement("p");
  lampState.textContent = data?.state?.toUpperCase() ?? "empty";
  lampStateTime.textContent = data.timestamp;
  currentLampState.appendChild(lampState);
  currentLampStateTime.appendChild(lampStateTime);
})

socket.on('log', function(response) {
  var lampStates = response.lampStates;
  var total = response.total
  var logTable = document.getElementById("lampStates");
  var totalLampState = document.getElementById('totalLampState');
  logTable.innerHTML = "";
  totalLampState.innerHTML = "";  

  let totalState = document.createElement("span");
  totalState.textContent = total;
  totalLampState.appendChild(totalState);

  var pageSize = 10;
  var currentPage = 0;

  function loadPage(page) {
    logTable.innerHTML = "";
    var headerRow = document.createElement("tr");
    var headers = ["Device ID", "State", "Trigger", "Full Control", "Timestamp"];
    headers.forEach(function(headerText, index) {
      var header = document.createElement("th");
      header.textContent = headerText;
      if (index === 2) {
        header.style.width = "200px";
      }
      headerRow.appendChild(header);
    });

    logTable.appendChild(headerRow);
    var start = page * pageSize;
    var end = Math.min(start + pageSize, lampStates.length);
    
    for (var i = start; i < end; i++) {
      var row = document.createElement("tr");
      Object.values(lampStates[i]).forEach(function(value, index) {
        var cell = document.createElement("td");
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