window.addEventListener('load', () => {
    applyAppSettings();

    // Sprawdź, czy było aktywne zadanie przed odświeżeniem
    if (lastActiveTaskId !== null && tasks[lastActiveTaskId]) {
        startTask(lastActiveTaskId); // Uruchomi zegar dla przywróconego zadania
    } else {
        renderTasks();
    }

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('service-worker.js?v=2');
        });
    }
});

// Task Timer App
const taskNameDisplay = taskDisplay.querySelector('#taskDisplay task');
const taskTimeDisplay = taskDisplay.querySelector('#taskDisplay time');
const pageTitle = document.querySelector('title');
let appSettings = JSON.parse(localStorage.getItem('taskTimerSettings')) || {
    idleThreshold: 60,
    idleDetectionEnabled: false,
    notificationsEnabled: false
};
let tasks = JSON.parse(localStorage.getItem('taskTimerTasks')) || [];
let lastActiveTaskId = localStorage.getItem('lastActiveTaskId') ? parseInt(localStorage.getItem('lastActiveTaskId')) : null;
let activeTaskId = null;
let timerId = null;

function saveAppSettings() {
    localStorage.setItem('taskTimerSettings', JSON.stringify(appSettings));
}

function applyAppSettings() {
    idleThresholdInput.value = appSettings.idleThreshold;
    idleSwitch.checked = appSettings.idleDetectionEnabled;
    notificationsSwitch.checked = appSettings.notificationsEnabled;

    setupIdleDetection();
    setupNotifications();
    saveAppSettings();
}

function openAppSettingeModal() {
    const modalElement = document.getElementById('appSettingsModal');
    const modal = new bootstrap.Modal(modalElement);
    modalElement.addEventListener('shown.bs.modal', () => {
        // someInput.focus(); // Ustaw fokus na input po otwarciu modala
    });

    modal.show();
}

function saveTasks() {
    localStorage.setItem('taskTimerTasks', JSON.stringify(tasks));
    localStorage.setItem('lastActiveTaskId', activeTaskId);
}

function renderTasks() {
    const list = document.getElementById('taskList');
    list.innerHTML = '';
    tasks.forEach((task, index) => {
        const isActive = activeTaskId === index;
        const li = document.createElement('li');
        li.className = `list-group-item d-flex flex-wrap justify-content-between align-items-center gap-3`;
        li.dataset.active = isActive;
        li.innerHTML = `
            <div class="d-flex flex-wrap align-items-center justify-content-between flex-fill column-gap-3">
                <input type="text" name="taskName" class="form-control w-auto p-0" style="border: none;" value="${task.name}" onchange="editTaskName(${index}, this.value)">
                <time class="task-timer p-0">${formatTime((task.seconds ?? 0) + (task.timeLapse ?? 0))}</time>
            </div>
            <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
                <button type="button" class="btn btn-sm btn-${isActive ? 'outline-warning' : 'outline-success'} btn-icon btn-task-stop btn-task-start" onclick="toggleTask(${index})" title="${isActive ? 'Stop' : 'Start'}">
                    ${isActive ? '<i class="bi bi-stop-fill"></i> <span>Stop</span>' : '<i class="bi bi-play-fill"></i> <span>Start</span>'}
                </button>
                <button type="reset" class="btn btn-sm btn-outline-secondary btn-icon btn-task-reset" onclick="resetTask(${index})" title="Reset"><i class="bi bi-arrow-counterclockwise"></i> <span>Reset</span></button>
                <button type="button" class="btn btn-sm btn-outline-secondary btn-icon btn-task-change" onclick="openChangeTimeModal(${index})" title="Zmień"><i class="bi bi-plus-slash-minus"></i> <span>Zmień</span></button>
                <button type="button" class="btn btn-sm btn-outline-danger btn-icon btn-task-delete" onclick="deleteTask(${index}, this)" title="Usuń"><i class="bi bi-trash"></i> <span>Usuń</span></button>
            </div>
        `;
        list.appendChild(li);
    });

    renderTaskDisplay();
}

function renderTaskDisplay() {
    const task = tasks[lastActiveTaskId] ?? null;

    if (null === task) {
        document.body.dataset.taskId = null;
        taskNameDisplay.textContent = 'Task';
        taskTimeDisplay.textContent = 'Timer';
        pageTitle.textContent = `Task Timer`;
        return;
    }

    const taskName = task.name;
    const seconds = (task.seconds ?? 0) + (task.timeLapse ?? 0);
    const taskTime = formatTime(seconds, 'hh:mm:ss');
    const isActive = document.body.dataset.active === "true";

    if (document.body.dataset.taskId != lastActiveTaskId) {
        document.body.dataset.taskId = lastActiveTaskId;
    }

    // Update task name and time display
    if (taskNameDisplay.textContent != taskName) {
        taskNameDisplay.textContent = taskName;
    }

    if (taskTimeDisplay.textContent = taskTime) {
        taskTimeDisplay.textContent = taskTime;
    }

    // Upadate page title
    const title = `${isActive ? '▶' : '■'} ${taskTime} ${taskName}`;
    if (pageTitle.textContent != title) {
        pageTitle.textContent = title;
    }

    // Update task list item time
    const taskListItemTime = document.querySelector('#taskList [data-active="true"] time');
    if (taskListItemTime && taskListItemTime.textContent != taskTime) {
        taskListItemTime.textContent = taskTime;
    }

    // Update badge
    if ('setAppBadge' in navigator) {
        if (isActive) {
            const minutes = formatTime(seconds, 'minutes');
    
            if (minutes !== renderTaskDisplay.lastBadgeMinutes) {
                // Set the app badge with the number of minutes
                minutes > 0 ? navigator.setAppBadge(minutes) : navigator.setAppBadge();
                renderTaskDisplay.lastBadgeMinutes = minutes;
            }
        } else {
            navigator.clearAppBadge();
            renderTaskDisplay.lastBadgeMinutes = null;
        }
    }
}

function formatTime(secs = 0, format = 'hh:mm:ss') {
    secs = parseInt(secs, 10);

    switch (format) {
        case 'hh:mm:ss': {
            const h = Math.floor(secs / 3600);
            const m = Math.floor((secs % 3600) / 60);
            const s = secs % 60;
            return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        }

        case 'minutes':
            return Math.max(0, Math.floor(secs / 60));

        default:
            return secs;
    }
}

function sortTasks() {
    // Sortuj zadania po nazwie
    tasks.sort((a, b) => {
        const nameA = a.name.toUpperCase();
        const nameB = b.name.toUpperCase();
        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }
        return 0; // Nazwy są równe
    });
}

function addTask() {
    const name = '[Nowe zadanie]';
    tasks.push({ name, seconds: 0, startTime: null });
    sortTasks();
    saveTasks();
    renderTasks();
}

function editTaskName(index, value) {
    if (index == activeTaskId) {
        stopTask(index);
        lastActiveTaskId = null;
    }

    tasks[index].name = value;
    sortTasks();
    saveTasks();
    renderTasks();
}

function toggleTask(index) {
    if (index == null) {
        return;
    }

    if (activeTaskId === index) {
        stopTask(index);
    } else {
        startTask(index);
    }
}

function startTask(index) {
    if (index == null) {
        return;
    }

    stopAllTasks();
    
    tasks[index].startTime = tasks[index].startTime ?? Date.now();

    activeTaskId = lastActiveTaskId = index;
    document.body.dataset.active = true;
    renderTasks();
    tick(); // Uruchamiamy pierwszy "tyknięcie" zegara
}

function stopTask(index) {
    if (index == null) {
        return;
    }

    if (timerId) {
        clearTimeout(timerId); // Zatrzymujemy zegar
    }

    if (document.body.dataset.active === 'true') {
        document.body.dataset.active = false;
    }

    // Resetujemy czas startu
    tasks[index].startTime = null;
    // Gromadzimy odliczony czas.
    tasks[index].seconds += tasks[index].timeLapse ?? 0;
    tasks[index].timeLapse = 0;
    activeTaskId = null;

    saveTasks();
    renderTasks();
}


function stopAllTasks() {
    // Zatrzymujemy zegar.
    if (timerId) {
        clearTimeout(timerId);
    }

    if (document.body.dataset.active === 'true') {
        document.body.dataset.active = false;
    }

    // Resetujemy czas startu każdego zadania.
    tasks.forEach(task => {
        task.startTime = null;
        task.seconds += task.timeLapse ?? 0;
        task.timeLapse = 0;
    });
    activeTaskId = null;

    renderTasks();
}

function resetTask(index) {
    if (index == null) {
        return;
    }

    // Resetujemy czas startu.
    if (index == activeTaskId) {
        tasks[index].startTime = Date.now();
    } else {
        tasks[index].startTime = null;
    }

    // Alternatywnie można zatrzymać zadanie.
    // stopTask(index);

    tasks[index].seconds = 0;
    tasks[index].timeLapse = 0;
    saveTasks();
    renderTasks();
}

function deleteTask(index, button = null) {
    // Confirmation before deletion.
    if (button && button.dataset.confirm !== "true") {
        button.dataset.confirm = "true";
        setTimeout(() => {
            delete button.dataset.confirm;
        }, 2000);
        return;
    }

    if (index == activeTaskId) {
        stopTask(index);
    }

    if (index == lastActiveTaskId) {
        lastActiveTaskId = null;
    }

    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
}

function tick() {
    if (null === activeTaskId) {
        return;
    }

    const startTime = tasks[activeTaskId].startTime;

    if (null !== startTime) {
        const timeLapse = Date.now() - startTime;
        tasks[activeTaskId].timeLapse = Math.floor(timeLapse / 1000);
        saveTasks();
        renderTaskDisplay();
    }

    timerId = setTimeout(tick, 1000);
}

function exportData() {
    const dataToExport = {
        // tasks: tasks.map(t => {
        //     const { startTime, ...taskToExport } = t;
        //     return taskToExport;
        // }),
        tasks: tasks.map(task => ({ name: task.name, seconds: task.seconds })),
        settings: appSettings
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasktimer-setup.json';
    a.click();
}

function importData(event) {
    const fileInput = event.target;
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const importedData = JSON.parse(reader.result);
                if (importedData.tasks) {
                    stopAllTasks();
                    tasks = importedData.tasks;
                    console.log('Imported tasks:', importedData.tasks);
                    saveTasks();
                    renderTasks();
                }
                if (importedData.settings) {
                    appSettings = importedData.settings;
                    console.log('Imported settings:', importedData.settings);
                    applyAppSettings();
                }
            } catch (error) {
                console.error('Import error:', error);
                alert('Błąd importu.');
            } finally {
                // Resetujemy wartość inputu file po przetworzeniu (lub błędzie),
                // aby umożliwić ponowne wgranie tego samego pliku.
                // To sprawi, że przeglądarka potraktuje ponowne wybranie tego samego pliku jako nową "zmianę".
                fileInput.value = '';
            }
        };
        reader.readAsText(file);
    }
}

// Zmiana czasu zadania

const changeTimeModal = new bootstrap.Modal(document.getElementById('changeTimeModal'));
const timeChangeInput = document.getElementById('timeChangeInput');
const timeChangeError = document.getElementById('timeChangeError');

function openChangeTimeModal(taskId) {
    if (taskId === null) {
        console.warn("No active task to change task time.");
        return;
    }

    timeChangeInput.value = ''; // Wyczyść input przed otwarciem
    timeChangeInput.dataset.taskId = taskId;
    timeChangeError.classList.add('d-none'); // Ukryj ewentualne błędy

    // Nasłuchiwanie zdarzenia 'shown.bs.modal' NA ELEMENCIE DOM MODALA
    const modalElement = document.getElementById('changeTimeModal');
    modalElement.addEventListener('shown.bs.modal', () => {
        timeChangeInput.focus(); // Ustaw fokus na input po otwarciu modala
    });

    changeTimeModal.show();
}

// Dodaj nasłuchiwanie na naciśnięcie klawisza w polu input
timeChangeInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        applyTimeChange(); // Wywołaj funkcję zatwierdzającą zmianę czasu
    }
});

function timeStringToSeconds(timeString) {
    const regex = /^([+-]?)(\d+)(h)?(\d+)?(m)?$/;
    const match = timeString.match(regex);

    if (!match) {
        console.error(`Incorrect task time format: ${timeString}`);
        return null; // Return null for invalid format
    }

    const sign = match[1] === '-' ? -1 : 1;
    let totalSeconds = 0;

    // Add hours if present
    if (match[3] === 'h') {
        totalSeconds += parseInt(match[2] || 0, 10) * 3600;
    }

    // Add minutes if present or if only a number is given (treat as minutes)
    if (match[5] === 'm' || (!match[3] && match[2])) {
        const minutes = match[3] ? parseInt(match[4] || 0, 10) : parseInt(match[2] || 0, 10);
        totalSeconds += minutes * 60;
    }

    return sign * totalSeconds;
}

function applyTimeChange() {
    const timeString = timeChangeInput.value.trim();
    const taskId = timeChangeInput.dataset.taskId;
    const secondsToAdd = timeStringToSeconds(timeString);

    if (secondsToAdd !== null) {
        changeTaskTime(taskId, secondsToAdd);
        changeTimeModal.hide();
    } else {
        timeChangeError.classList.remove('d-none');
    }
}

function changeTaskTime(taskId, secondsToAdd) {
    if (taskId === null) {
        console.warn("No task id to change task time.");
        return;
    }

    if (!secondsToAdd) {
        return; // Do nothing if conversion failed
    }

    tasks[taskId].seconds += secondsToAdd;
    if (tasks[taskId].seconds < 0) {
        // Pozostałe sekundy trzeba dodać od aktualnego czasu
        const time = tasks[taskId].startTime + Math.abs(tasks[taskId].seconds) * 1000;
        tasks[taskId].startTime = Math.min(time, Date.now()); 
        tasks[taskId].seconds = 0;
        tasks[taskId].timeLapse = 0;
    }

    saveTasks();
    renderTasks();
}

// Notyfikacje

const notificationsSwitch = document.getElementById('notificationsSwitch');

function toggleNotifications() {
    notificationsSwitch.checked = !notificationsSwitch.checked;
    setupNotifications(true);
}

async function setupNotifications(onChange = false) {
    const notificationsIndicator = document.getElementById('notificationsIndicator');
    let notificationPermission = await checkNotificationPermission();
    let isPrompting = false;

    if (onChange && notificationsSwitch.checked && notificationPermission === 'prompt') {
        isPrompting = true;
        notificationPermission = await requestNotificationPermission();
    }

    const hasPermission = notificationPermission === 'granted';

    if (!hasPermission) {
        notificationsSwitch.checked = false;
    } else if (isPrompting && hasPermission) {
        notificationsSwitch.checked = true;
    }

    notificationsSwitch.disabled = ['denied', 'error', 'unsupported'].includes(notificationPermission);

    if (appSettings.notificationsEnabled !== notificationsSwitch.checked) {
        appSettings.notificationsEnabled = notificationsSwitch.checked;
        saveAppSettings();
    }

    const permissionDictionary = {
        granted: appSettings.notificationsEnabled ? 'Włączone' : 'Wyłączone',
        denied: 'Zablokowane',
        prompt: 'Wyłączone (dostępne)',
        error: 'Błąd',
        unsupported: 'Niedostępne'
    };
    const permissionInfo = `Powiadomienia: ${permissionDictionary[notificationPermission]}`;
    const notificationsSwitchLabel = document.querySelector('label[for="notificationsSwitch"]');
    if (notificationsSwitchLabel) {
        notificationsSwitchLabel.title = permissionInfo;
        notificationsSwitchLabel.textContent = permissionInfo;
    }

    if (notificationsIndicator.dataset.enabled != appSettings.notificationsEnabled) {
        notificationsIndicator.dataset.enabled = appSettings.notificationsEnabled;
        notificationsIndicator.title = permissionInfo;
    }

    if (!hasPermission) {
        return;
    }

    if (appSettings.notificationsEnabled) {
        console.log('Notifications are enabled.');
        showNotification('Włączono powiadomienia.');
    } else {
        console.log('Notifications are disabled.');
    }
}

async function checkNotificationPermission() {
    if ('Notification' in window && 'permissions' in navigator) {
        try {
            const status = await navigator.permissions.query({ name: 'notifications' });
            console.log('Notifications permission:', status.state);
            return status.state; // 'prompt', 'granted' or 'denied'
        } catch (err) {
            console.error('Error checking notifications permission:', err);
            return 'error';
        }
    } else {
        console.warn('Notification API or Permissions API is not supported.');
    }

    return 'unsupported';
}

async function requestNotificationPermission() {
    if ('Notification' in window) {
        try {
            const permission = await Notification.requestPermission();
            return permission; // 'prompt', 'granted' or 'denied'
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return 'error';
        }
    } else {
        console.warn('This browser does not support notifications.');
        return 'unsupported';
    }
}

async function showNotification(body, requireInteraction = false) {
    if (!appSettings.notificationsEnabled) {
        return;
    }

    const permission = await checkNotificationPermission();
    if ('granted' === permission) {
        // new Notification('Task Timer', { body });
        new Notification('Task Timer', {
                body: body,
                icon: './images/icons/icon__192.png',  // ikona wyróżniająca
                badge: './images/icons/icon__96.png',  // opcjonalna ikona do "badge" (np. Android)
                // image: "task-preview.png",             // opcjonalny obrazek do powiadomienia
                lang: 'pl-PL',                         // język powiadomienia
                dir: 'auto',                           // kierunek tekstu (auto, ltr, rtl)
                tag: 'task-timer',                     // zapobiega dublowaniu
                // timestamp: Date.now(),                 // znacznik czasu powiadomienia
                renotify: true,                        // powiadamia ponownie przy tym samym tagu
                requireInteraction: requireInteraction // powiadomienie nie znika samo
        });
    } else {
        console.error('Notification permission not granted but still set in appSettings.');
    }
}

// Idle Detection

const idleThresholdInput = document.getElementById('idleThreshold');
const idleSwitch = document.getElementById('idleSwitch');
let idleTaskId = null;
let idleDetector = null;
let idleController = null;

async function updateIdleDetectionView() {
    const idlePermission = await checkIdlePermission();
    const permissionDictionary = {
        granted: appSettings.idleDetectionEnabled ? 'Włączone' : 'Wyłączone',
        denied: 'Zablokowane',
        prompt: 'Wyłączone (dostępne)',
        error: 'Błąd',
        unsupported: 'Niedostępne'
    };
    const permissionInfo = `Detekcja bezczynności: ${permissionDictionary[idlePermission]}`;

    const idleSwitchLabel = document.querySelector('label[for="idleSwitch"]');
    if (idleSwitchLabel) {
        idleSwitchLabel.title = permissionInfo;
        idleSwitchLabel.textContent = permissionInfo;
    }

    const activityIndicator = document.getElementById('activityIndicator');
    if (activityIndicator.dataset.enabled != appSettings.idleDetectionEnabled) {
        activityIndicator.dataset.enabled = appSettings.idleDetectionEnabled;
        activityIndicator.title = 'granted' === idlePermission
            ? permissionInfo + ` (${idleThresholdInput.value ?? 0}s)`
            : permissionInfo;
    }
}

function toggleIdleDetection() {
    idleSwitch.checked = !idleSwitch.checked;
    setupIdleDetection(true);
}

async function setupIdleDetection(onChange = false) {
    let idlePermission = await checkIdlePermission();
    let isPrompting = false;

    if (onChange && idleSwitch.checked && idlePermission == 'prompt') {
        isPrompting = true;
        idlePermission = await requestIdlePermission();
    }

    let hasPermission = idlePermission == 'granted';

    if (!hasPermission) {
        idleSwitch.checked = false;
    } else if (isPrompting && hasPermission) {
        idleSwitch.checked = true;
    }

    idleSwitch.disabled = ['denied', 'error', 'unsupported'].includes(idlePermission);

    if (appSettings.idleDetectionEnabled !== idleSwitch.checked) {
        appSettings.idleDetectionEnabled = idleSwitch.checked;
        saveAppSettings();
    }

    updateIdleDetectionView();

    if (!hasPermission) {
        return;
    }

    if (!idleDetector && appSettings.idleDetectionEnabled) {
        startIdleDetection();
    } else if (idleDetector && !appSettings.idleDetectionEnabled) {
        stopIdleDetection();
    }
}

function setIdleTreshold() {
    const idleThreshold = Math.max(60, parseInt(idleThresholdInput.value ?? 60, 10));
    if (idleThresholdInput.value !== idleThreshold) {
        idleThresholdInput.value = idleThreshold;
    }

    if (appSettings.idleThreshold !== idleThreshold) {
        appSettings.idleThreshold = idleThreshold;
        saveAppSettings();
    }

    if (!idleSwitch.disabled && appSettings.idleDetectionEnabled) {
        // Restart idle detection with new settings.
        startIdleDetection();
    }

    updateIdleDetectionView();
}

async function checkIdlePermission() {
    if ('IdleDetector' in window && 'permissions' in navigator) {
        try {
            const status = await navigator.permissions.query({ name: 'idle-detection' });
            // status.state = 'prompt', 'granted' or 'denied'
            console.log('Idle detection permission:', status.state);
            return status.state;
        } catch (err) {
            console.error('Error checking idle detection permission:', err);
            return 'error';
        }
    } else {
        console.warn('IdleDetector API or Permissions API is not supported.');
    }

    return 'unsupported';
}

async function requestIdlePermission() {
    if ('IdleDetector' in window) {
        try {
            const permission = await IdleDetector.requestPermission();
            return permission; // 'granted', 'denied', 'prompt'
        } catch (err) {
            console.error('Error requesting idle detection permission:', err);
            alert(`Wystąpił błąd podczas żądania uprawnień do monitorowania bezczynności: ${err}`);
            return 'error';
        }
    } else {
        console.warn('IdleDetector API is not supported.');
        return 'unsupported';
    }
}

async function startIdleDetection() {
    try {
        idleController = new AbortController();
        const signal = idleController.signal;
        idleDetector = new IdleDetector();
        idleDetector.addEventListener('change', () => {
            const userIdle = idleDetector.userState === 'idle';
            const screenLocked = idleDetector.screenState === 'locked';
            const idleState = userIdle || screenLocked;
            console.log(`Idle change: user ${idleDetector.userState}, screen ${idleDetector.screenState}.`);

            if (idleState && null !== activeTaskId) {
                console.log(`Stopping task ${activeTaskId}`);
                idleTaskId = activeTaskId;
                stopTask(activeTaskId, true);
                showNotification(`■ Zatrzymano: ${tasks[idleTaskId].name} ${formatTime(tasks[idleTaskId].seconds)} z powodu bezczynności przez ${idleThresholdInput.value} sekund.`, true);
            } else if (!idleState && null !== idleTaskId) {
                console.log(`Resuming task ${idleTaskId}`);
                startTask(idleTaskId, true);
                showNotification(`▶ Wznowiono: ${tasks[idleTaskId].name} ${formatTime(tasks[idleTaskId].seconds)} ze stanu bezczynności.`, true);
                idleTaskId = null;
            }
        });

        const idleThresholdSeconds = Math.max(60, parseInt(appSettings.idleThreshold ?? 60, 10));
        await idleDetector.start({ threshold: idleThresholdSeconds * 1000, signal });
        console.log(`IdleDetector is active with threshold: ${idleThresholdSeconds} seconds.`);
        showNotification(`Włączono monitorowanie bezczynności przez ${idleThresholdInput.value} sekund.`);
    } catch (err) {
        console.error('IdleDetector error:', err);
        idleController = null;
        const info = document.getElementById('idlePermissionInfo');
        info.textContent = 'Nie udało się uruchomić monitorowania bezczynności.';
        info.classList.remove('d-none');
    }
}

function stopIdleDetection() {
    if (idleController) {
        idleController.abort();
        console.log('Idle detection stopped.');
        idleController = null; // Opcjonalnie wyczyść kontroler
        showNotification(`Wyłączono monitorowanie bezczynności.`);
    }

    idleDetector = null;
}
