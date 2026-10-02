const defaultDesc = `✨ Minhas Redes Sociais
---------------------------------
🎬  Assista minhas Lives: https://twitch.tv/seucanal
🎥  Canal Principal: https://www.youtube.com/@seucanal
📸  Instagram: @seuinstagram

(Você pode alterar este texto nas configurações da extensão)`;

let settings = {};

chrome.storage.local.get(['appSettings'], (data) => {
    settings = data.appSettings || {};
    
    if (settings.delayObra === undefined) settings.delayObra = 2000;
    if (settings.delayMenu === undefined) settings.delayMenu = 600;
    if (settings.delayPlaylist === undefined) settings.delayPlaylist = 1000;
    if (settings.retryOnFail === undefined) settings.retryOnFail = true;
    if (settings.enableRating === undefined) settings.enableRating = true; // Novo!

    if (!settings.shSave) settings.shSave = { altKey: true, ctrlKey: false, shiftKey: false, key: 's', display: 'Alt + S' };
    if (!settings.shFill) settings.shFill = { altKey: true, ctrlKey: false, shiftKey: false, key: 'b', display: 'Alt + B' };
    if (!settings.titleTemplate) settings.titleTemplate = "Nome Anime | T1 Ep. 01";
    if (!settings.titleNoTemp) settings.titleNoTemp = "{obra} | Ep. {ep}";
    if (!settings.titleTemp) settings.titleTemp = "{obra} | T{temp} Ep. {ep}";
    if (settings.copyVis === undefined) settings.copyVis = false;
    if (!settings.descTemplate) settings.descTemplate = defaultDesc;

    document.getElementById('key-save').value = settings.shSave.display;
    document.getElementById('key-fill').value = settings.shFill.display;
    document.getElementById('delay-obra').value = settings.delayObra;
    document.getElementById('delay-menu').value = settings.delayMenu;
    document.getElementById('delay-playlist').value = settings.delayPlaylist;
    document.getElementById('retry-on-fail').checked = settings.retryOnFail;
    document.getElementById('enable-rating').checked = settings.enableRating; // Novo!
    document.getElementById('title-template').value = settings.titleTemplate;
    document.getElementById('title-no-temp').value = settings.titleNoTemp;
    document.getElementById('title-temp').value = settings.titleTemp;
    document.getElementById('copy-vis').checked = settings.copyVis;
    document.getElementById('desc-template').value = settings.descTemplate;
});

function recordKeystroke(e, objKey) {
    e.preventDefault();
    let keys = [];
    if (e.ctrlKey) keys.push('Ctrl'); if (e.altKey) keys.push('Alt'); if (e.shiftKey) keys.push('Shift');
    let keyName = e.key.toLowerCase();
    if (['control', 'alt', 'shift', 'meta'].includes(keyName)) return; 
    keys.push(keyName.toUpperCase());
    let display = keys.join(' + ');
    e.target.value = display;
    settings[objKey] = { altKey: e.altKey, ctrlKey: e.ctrlKey, shiftKey: e.shiftKey, key: keyName, display: display };
}

document.getElementById('key-save').addEventListener('keydown', (e) => recordKeystroke(e, 'shSave'));
document.getElementById('key-fill').addEventListener('keydown', (e) => recordKeystroke(e, 'shFill'));

document.getElementById('btn-save').addEventListener('click', () => {
    settings.delayObra = parseInt(document.getElementById('delay-obra').value, 10) || 2000;
    settings.delayMenu = parseInt(document.getElementById('delay-menu').value, 10) || 600;
    settings.delayPlaylist = parseInt(document.getElementById('delay-playlist').value, 10) || 1000;
    settings.retryOnFail = document.getElementById('retry-on-fail').checked;
    settings.enableRating = document.getElementById('enable-rating').checked; // Novo!
    settings.titleTemplate = document.getElementById('title-template').value;
    settings.titleNoTemp = document.getElementById('title-no-temp').value;
    settings.titleTemp = document.getElementById('title-temp').value;
    settings.copyVis = document.getElementById('copy-vis').checked;
    settings.descTemplate = document.getElementById('desc-template').value;

    chrome.storage.local.set({ 'appSettings': settings }, () => {
        let btn = document.getElementById('btn-save');
        btn.innerText = "✅ Salvo com sucesso!";
        setTimeout(() => { btn.innerText = "💾 Salvar Configurações"; }, 2000);
    });
});