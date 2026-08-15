// Texto genérico para quem baixar a extensão do GitHub
const defaultDesc = `✨ Minhas Redes Sociais
---------------------------------
🎬  Assista minhas Lives: https://twitch.tv/seucanal
🎥  Canal Principal: https://www.youtube.com/@seucanal
📸  Instagram: @seuinstagram

(Você pode alterar este texto nas configurações da extensão)`;

let settings = {};

chrome.storage.local.get(['appSettings'], (data) => {
    settings = data.appSettings || { 
        shSave: { altKey: true, ctrlKey: false, shiftKey: false, key: 's', display: 'Alt + S' },
        shFill: { altKey: true, ctrlKey: false, shiftKey: false, key: 'b', display: 'Alt + B' },
        titleTemplate: "Nome Anime | T1 Ep. 01",
        titleNoTemp: "{obra} | Ep. {ep}", titleTemp: "{obra} | T{temp} Ep. {ep}",
        copyVis: false, descTemplate: defaultDesc 
    };
    
    document.getElementById('key-save').value = settings.shSave.display;
    document.getElementById('key-fill').value = settings.shFill.display;
    document.getElementById('title-template').value = settings.titleTemplate || "Nome Anime | T1 Ep. 01";
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