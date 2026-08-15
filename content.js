// ==========================================
// 1. CONFIGURAÇÕES E ESTADO
// ==========================================
const defaultDesc = `✨ Redes Sociais do Robson
---------------------------------
🎬  Assista minhas Lives: https://twitch.tv/oirobson
🎥  Canal Principal: https://www.youtube.com/@reactanimepro
🔵  Grupo no Telegram: https://t.me/+PihSAhPyAcFmOGEx
🎙️  Canal de Música Geek: https://www.youtube.com/@oirobson2
💜 Discord: https://discord.gg/T26vMr6KmT
▶️ Facebook: @reactanimepro
📸 Instagram: @reactanimepro
🎥 TikTok: @reactanimepro`;

let appSettings = { 
    shSave: { altKey: true, ctrlKey: false, shiftKey: false, key: 's' },
    shFill: { altKey: true, ctrlKey: false, shiftKey: false, key: 'b' },
    titleTemplate: "Nome Anime | T1 Ep. 01",
    titleNoTemp: "{obra} | Ep. {ep}", titleTemp: "{obra} | T{temp} Ep. {ep}",
    copyVis: false, descTemplate: defaultDesc 
};

chrome.storage.local.get(['appSettings'], (data) => { if(data.appSettings) appSettings = data.appSettings; });
chrome.storage.onChanged.addListener((changes) => { if(changes.appSettings) appSettings = changes.appSettings.newValue; });

// ==========================================
// 2. ESTÉTICA E INTERFACE VISUAL (CSS)
// ==========================================
const uiStyles = `
    #cinefy-container { display: none; z-index: 999999; position: fixed; bottom: 20px; right: 20px; }
    #cinefy-container.on-page { display: block; }
    #cinefy-min-btn { position: absolute; bottom: 0; right: 0; width: 50px; height: 50px; border-radius: 25px; background: #a855f7; color: white; border: none; font-size: 20px; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.5); transition: 0.3s; display: flex; justify-content: center; align-items: center; opacity: 0; pointer-events: none; transform: scale(0.5); }
    #cinefy-min-btn.show { opacity: 1; pointer-events: all; transform: scale(1); }
    #cinefy-panel { width: 280px; background: #18181b; border: 1px solid #3f3f46; border-radius: 12px; padding: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.8); font-family: 'Segoe UI', sans-serif; color: #fff; transform-origin: bottom right; transition: 0.3s; }
    #cinefy-panel.collapsed { transform: scale(0.5) translateY(50px); opacity: 0; pointer-events: none; }
    .cinefy-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .cinefy-header h3 { margin: 0; font-size: 14px; color: #e4e4e7; text-align: center; flex-grow:1; }
    .cinefy-icon-btn { background: none; border: none; color: #a1a1aa; font-size: 16px; cursor: pointer; padding: 0; transition: 0.2s; }
    .cinefy-icon-btn:hover { color: #2dd4bf; transform: scale(1.2); }
    #cinefy-panel select, .cinefy-input { width: 100%; background: #27272a; border: 1px solid #52525b; color: white; padding: 10px; border-radius: 8px; margin-bottom: 10px; outline: none; box-sizing: border-box; }
    .cinefy-btn { width: 100%; padding: 10px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; margin-bottom: 8px; transition: 0.2s; font-size:13px;}
    .cinefy-btn-template { background: #f59e0b; color: white; } .cinefy-btn-template:hover { background: #d97706; }
    .cinefy-btn-save { background: #a855f7; color: white; } .cinefy-btn-save:hover { background: #9333ea; }
    .cinefy-btn-fill { background: #2dd4bf; color: black; } .cinefy-btn-fill:hover { background: #14b8a6; }
    #cinefy-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 9999999; display: none; justify-content: center; align-items: center; backdrop-filter: blur(3px); }
    .cinefy-modal { background: #18181b; padding: 20px; border-radius: 12px; width: 350px; border: 1px solid #3f3f46; color: white; font-family: 'Segoe UI', sans-serif; }
    .cinefy-modal h2 { margin-top: 0; font-size: 18px; text-align: center; color: #a855f7;}
    .cinefy-modal label { font-size: 12px; color: #a1a1aa; margin-bottom: 5px; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .cinefy-row { display: flex; gap: 10px; align-items: flex-end; margin-bottom: 10px;}
    .cinefy-row > div { flex: 1; display: flex; flex-direction: column; justify-content: flex-end; }
    .cinefy-modal-actions { display: flex; gap: 10px; margin-top: 15px; }
    .cinefy-btn-cancel { background: #ef4444; color: white; }
    #cinefy-toast { position: fixed; bottom: -80px; left: 50%; transform: translateX(-50%); background: #2dd4bf; color: black; font-weight: bold; padding: 12px 45px 12px 25px; border-radius: 20px; z-index: 10000000; transition: 0.4s; box-shadow: 0 4px 15px rgba(0,0,0,0.5); opacity: 0; cursor: pointer; }
    #cinefy-toast.show { bottom: 30px; opacity: 1; }
    #cinefy-toast::after { content: '✕'; position: absolute; right: 15px; top: 50%; transform: translateY(-50%); font-size: 14px; opacity: 0.6; } #cinefy-toast:hover::after { opacity: 1; }
`;
const styleElement = document.createElement('style'); styleElement.innerHTML = uiStyles; document.head.appendChild(styleElement);

// ==========================================
// 3. FUNÇÕES BASE DA AUTOMAÇÃO
// ==========================================
function setReactValue(element, value) {
    const setter = Object.getOwnPropertyDescriptor(element.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype, "value").set;
    element.focus(); setter.call(element, value);
    element.dispatchEvent(new Event('input', { bubbles: true })); element.dispatchEvent(new Event('change', { bubbles: true }));
}
async function fecharMenu() { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await new Promise(resolve => setTimeout(resolve, 300)); }

async function selecionarMenuSuspenso(nomeDoCampo, textoDaOpcao) {
    if(!textoDaOpcao) return; 
    let spans = Array.from(document.querySelectorAll('span'));
    let labelSpan = spans.find(s => s.textContent.trim() === nomeDoCampo);
    if (!labelSpan) return;
    let blocoPergunta = labelSpan.parentElement;
    let walk = document.createTreeWalker(blocoPergunta, NodeFilter.SHOW_TEXT, null, false);
    let n; let textosAtuais = [];
    while(n = walk.nextNode()) { textosAtuais.push(n.textContent.trim().toLowerCase()); }
    let textoBusca = textoDaOpcao.toString().toLowerCase().trim(); 
    if (textosAtuais.some(t => t.includes(textoBusca))) return; 
    let svgs = Array.from(blocoPergunta.querySelectorAll('svg'));
    if (svgs.length === 0) return;
    let setinha = svgs[svgs.length - 1]; 
    if (setinha && setinha.parentElement) setinha.parentElement.click();
    await new Promise(resolve => setTimeout(resolve, 600)); 
    let todosElementos = Array.from((document.getElementById('portal-container') || document.body).querySelectorAll('*'));
    let elementosComTexto = todosElementos.filter(el => el.textContent && el.textContent.toLowerCase().includes(textoBusca));
    if (elementosComTexto.length > 0) {
        elementosComTexto[elementosComTexto.length - 1].click(); await new Promise(resolve => setTimeout(resolve, 300)); 
    } 
    await fecharMenu();
}

async function pesquisarEConfirmarSerie(nomeObra) {
    if(!nomeObra) return;
    let campoPesquisar = document.querySelector('input[placeholder="Pesquisar..."]');
    if (!campoPesquisar) return; 
    setReactValue(campoPesquisar, nomeObra);
    await new Promise(resolve => setTimeout(resolve, 2000)); 
    let spans = Array.from(document.querySelectorAll('span'));
    let nomeLowerCase = nomeObra.toLowerCase().trim();
    let spanAlvo = spans.find(span => span.textContent && span.textContent.toLowerCase().includes(nomeLowerCase));
    if (spanAlvo) {
        let opcaoClicavel = spanAlvo.closest('div');
        if (opcaoClicavel) opcaoClicavel.click(); else spanAlvo.click();
        await new Promise(resolve => setTimeout(resolve, 300)); 
    } 
    await fecharMenu();
}

function extrairDaTela(nomeDoCampo, multiplo = false) {
    let spans = Array.from(document.querySelectorAll('span'));
    let label = spans.find(s => s.textContent.trim() === nomeDoCampo);
    if (!label) return "";
    let cloneBloco = label.parentElement.cloneNode(true);
    cloneBloco.querySelectorAll('p').forEach(p => p.remove()); 
    let textos = [];
    let walk = document.createTreeWalker(cloneBloco, NodeFilter.SHOW_TEXT, null, false);
    let n; while(n = walk.nextNode()) { if(n.textContent.trim()) textos.push(n.textContent.trim()); }
    let ignorar = [nomeDoCampo, "Selecionar", "Buscar por tags...", "Buscar..."];
    let validos = textos.filter(t => !ignorar.includes(t));
    return multiplo ? [...new Set(validos)].join(", ") : (validos[0] || "");
}
function lerVisibilidade() { let activeOpt = document.querySelector('div[class*="Option-sc-"].active span[class*="OptionTitle"]'); return activeOpt ? activeOpt.textContent.trim() : ""; }

// ==========================================
// 4. ESTRUTURA DO HTML (UI) E EVENTOS
// ==========================================
document.body.insertAdjacentHTML('beforeend', `
    <div id="cinefy-container">
        <button id="cinefy-min-btn" title="Expandir Cinefy Autofill">🎬</button>
        <div id="cinefy-panel">
            <div class="cinefy-header">
                <button id="cinefy-collapse-btn" class="cinefy-icon-btn" title="Minimizar Painel">▼</button>
                <h3>🎬 Cinefy Autofill</h3>
                <button id="cinefy-settings-btn" class="cinefy-icon-btn" title="Configurações">⚙️</button>
            </div>
            
            <div id="video-menu">
                <select id="cinefy-slot">
                    <option value="0">Slot 1 (Vazio)</option><option value="1">Slot 2 (Vazio)</option><option value="2">Slot 3 (Vazio)</option>
                    <option value="3">Slot 4 (Vazio)</option><option value="4">Slot 5 (Vazio)</option>
                </select>
                <button id="cinefy-btn-template" class="cinefy-btn cinefy-btn-template">📝 Inserir Template Rápido</button>
                <button id="cinefy-btn-save" class="cinefy-btn cinefy-btn-save">💾 Copiar & Salvar Tela</button>
                <button id="cinefy-btn-fill" class="cinefy-btn cinefy-btn-fill">⚡ Preencher Vídeo</button>
            </div>
            
            <div id="playlist-menu" style="display: none;">
                <p style="font-size:12px; color:#a1a1aa; text-align:center; margin-top:0; margin-bottom:15px;">Organiza os episódios matematicamente com cuidado (Evita Block do Servidor).</p>
                <button id="cinefy-btn-sort" class="cinefy-btn cinefy-btn-fill">🪄 Ordenar Episódios</button>
            </div>
            
        </div>
    </div>
    <div id="cinefy-modal-overlay"></div>
    <div id="cinefy-toast">Mensagem</div>
`);

let toastTimeout; const toastEl = document.getElementById('cinefy-toast');
function showToast(msg, duration = 4000) { 
    toastEl.innerText = msg; toastEl.classList.add('show'); 
    clearTimeout(toastTimeout); 
    toastTimeout = setTimeout(() => { toastEl.classList.remove('show'); }, duration); 
}
toastEl.addEventListener('click', () => { toastEl.classList.remove('show'); clearTimeout(toastTimeout); });

let isPanelCollapsed = false; const container = document.getElementById('cinefy-container'); const panel = document.getElementById('cinefy-panel'); const minBtn = document.getElementById('cinefy-min-btn');
document.getElementById('cinefy-collapse-btn').addEventListener('click', () => { isPanelCollapsed = true; panel.classList.add('collapsed'); minBtn.classList.add('show'); });
minBtn.addEventListener('click', () => { isPanelCollapsed = false; panel.classList.remove('collapsed'); minBtn.classList.remove('show'); });

document.getElementById('cinefy-settings-btn').addEventListener('click', () => {
    let isOpera = (navigator.userAgent.indexOf("Opera") !== -1 || navigator.userAgent.indexOf('OPR') !== -1);
    if (isOpera) { showToast("⚙️ NO OPERA: Clique no ícone de extensões lá em cima no navegador para abrir as Configurações!", 6000); } 
    else { chrome.runtime.sendMessage({action: "open_settings"}); }
});

setInterval(() => { 
    const path = window.location.pathname;
    const isEditVideoPage = path.match(/^\/studio\/video\/.+/);
    const isPlaylistPage = path.match(/^\/studio\/playlist\/.+/);

    if (isEditVideoPage || isPlaylistPage) { container.classList.add('on-page'); } else { container.classList.remove('on-page'); } 
    if (isEditVideoPage) { document.getElementById('video-menu').style.display = 'block'; document.getElementById('playlist-menu').style.display = 'none'; } 
    else if (isPlaylistPage) { document.getElementById('video-menu').style.display = 'none'; document.getElementById('playlist-menu').style.display = 'block'; }
}, 500);

let arrayModelos = [null, null, null, null, null];
chrome.storage.local.get(['cinefySlots', 'slotAtivo'], function(data) {
    if (data.cinefySlots) arrayModelos = data.cinefySlots;
    let select = document.getElementById('cinefy-slot');
    if (data.slotAtivo) select.value = data.slotAtivo;
    atualizarNomesSelect();
});
function atualizarNomesSelect() {
    let select = document.getElementById('cinefy-slot');
    for (let i = 0; i < 5; i++) {
        let nome = arrayModelos[i] && arrayModelos[i].nomeObra ? arrayModelos[i].nomeObra : `(Vazio)`;
        select.options[i].text = `Slot ${i + 1}: ${nome}`;
    }
}
document.getElementById('cinefy-slot').addEventListener('change', (e) => { chrome.storage.local.set({ 'slotAtivo': e.target.value }); });
const overlay = document.getElementById('cinefy-modal-overlay');

function gerarTitulo(obra, temp, ep) {
    let epF = ep.length === 1 ? "0" + ep : ep;
    if (temp && temp.trim() !== "") return appSettings.titleTemp.replace('{obra}', obra).replace('{temp}', temp).replace('{ep}', epF);
    else return appSettings.titleNoTemp.replace('{obra}', obra).replace('{ep}', epF);
}

// ------------------------------------------
// LÓGICA: VÍDEO 
// ------------------------------------------
document.getElementById('cinefy-btn-template').addEventListener('click', () => {
    let campoTitulo = document.querySelector('input[placeholder="Seu título"]');
    if (campoTitulo) setReactValue(campoTitulo, appSettings.titleTemplate);
    let campoDescricao = document.querySelector('textarea');
    if (campoDescricao) setReactValue(campoDescricao, appSettings.descTemplate);
    showToast("📝 Template Padrão Inserido!");
});

function triggerSalvar() {
    let tituloInput = document.querySelector('input[placeholder="Seu título"]');
    let tituloCompleto = tituloInput ? tituloInput.value : "";
    let l_obra = tituloCompleto ? tituloCompleto.split(/[|-]/)[0].trim() : "";
    let l_desc = document.querySelector('textarea') ? document.querySelector('textarea').value : "";
    let l_tipo = extrairDaTela("Conteúdo (opcional)") || "Série";
    let l_play = extrairDaTela("Playlists");
    let l_idade = extrairDaTela("Classificação indicativa");
    let l_tags = extrairDaTela("Tags", true);
    let l_vis = appSettings.copyVis ? lerVisibilidade() : "";

    overlay.innerHTML = `
        <div class="cinefy-modal">
            <h2>Revisar Modelo</h2>
            <label>Série ou Filme?</label>
            <input id="m-tipo" class="cinefy-input" value="${l_tipo}">
            <label>Nome da Obra</label>
            <input id="m-obra" class="cinefy-input" value="${l_obra}">
            <label>Playlist</label>
            <input id="m-play" class="cinefy-input" value="${l_play}">
            <label>Classificação Indicativa</label>
            <input id="m-idade" class="cinefy-input" value="${l_idade}">
            <label>Tags (Separadas por vírgula)</label>
            <input id="m-tags" class="cinefy-input" value="${l_tags}">
            <div class="cinefy-modal-actions">
                <button id="btn-cancel-modal" class="cinefy-btn cinefy-btn-cancel">Cancelar</button>
                <button id="btn-save-modal" class="cinefy-btn cinefy-btn-save">Salvar no Slot</button>
            </div>
        </div>
    `;
    overlay.style.display = 'flex';
    document.getElementById('btn-cancel-modal').onclick = () => { overlay.style.display = 'none'; };
    document.getElementById('btn-save-modal').onclick = () => {
        let slotIndex = document.getElementById('cinefy-slot').value;
        arrayModelos[slotIndex] = {
            tipoConteudo: document.getElementById('m-tipo').value, nomeObra: document.getElementById('m-obra').value,
            playlist: document.getElementById('m-play').value, idade: document.getElementById('m-idade').value,
            tags: document.getElementById('m-tags').value, descricao: l_desc, visibility: l_vis, ultimoEp: "00", ultimaTemp: ""
        };
        chrome.storage.local.set({ 'cinefySlots': arrayModelos }, () => {
            atualizarNomesSelect(); overlay.style.display = 'none'; showToast("✅ Modelo Salvo com Sucesso!");
        });
    };
}
document.getElementById('cinefy-btn-save').addEventListener('click', triggerSalvar);

function triggerPreencher() {
    let slotIndex = document.getElementById('cinefy-slot').value;
    let modelo = arrayModelos[slotIndex];
    if (!modelo) { showToast("❌ Este Slot está vazio! Salve primeiro."); return; }
    let nextEp = modelo.ultimoEp ? (parseInt(modelo.ultimoEp) + 1).toString().padStart(2, '0') : "01";
    let lastTemp = modelo.ultimaTemp || "";

    overlay.innerHTML = `
        <div class="cinefy-modal">
            <h2>Preencher: ${modelo.nomeObra}</h2>
            <div class="cinefy-row">
                <div><label>Temporada (Opcional)</label><input id="m-temp" class="cinefy-input" value="${lastTemp}" placeholder="Ex: 1"></div>
                <div><label>Episódio</label><input id="m-ep" type="number" class="cinefy-input" value="${nextEp}"></div>
            </div>
            <div class="cinefy-modal-actions">
                <button id="btn-cancel-modal" class="cinefy-btn cinefy-btn-cancel">Cancelar</button>
                <button id="btn-fill-modal" class="cinefy-btn cinefy-btn-fill">⚡ Mágica!</button>
            </div>
        </div>
    `;
    overlay.style.display = 'flex'; document.getElementById('m-ep').focus(); 
    document.getElementById('btn-cancel-modal').onclick = () => { overlay.style.display = 'none'; };
    document.getElementById('btn-fill-modal').onclick = () => {
        let nTemp = document.getElementById('m-temp').value; let nEp = document.getElementById('m-ep').value;
        arrayModelos[slotIndex].ultimaTemp = nTemp; arrayModelos[slotIndex].ultimoEp = nEp;
        chrome.storage.local.set({ 'cinefySlots': arrayModelos });
        overlay.style.display = 'none'; showToast("⚡ Iniciando preenchimento...");
        iniciarPreenchimentoAutomatico(modelo, nTemp, nEp);
    };
}
document.getElementById('cinefy-btn-fill').addEventListener('click', triggerPreencher);

async function iniciarPreenchimentoAutomatico(modelo, temporada, episodio) {
    let campoTitulo = document.querySelector('input[placeholder="Seu título"]');
    if (campoTitulo) setReactValue(campoTitulo, gerarTitulo(modelo.nomeObra, temporada, episodio));
    let campoDescricao = document.querySelector('textarea');
    if (campoDescricao) setReactValue(campoDescricao, modelo.descricao);
    
    await selecionarMenuSuspenso("Conteúdo (opcional)", modelo.tipoConteudo);
    await new Promise(resolve => setTimeout(resolve, 200)); 
    await pesquisarEConfirmarSerie(modelo.nomeObra); 

    if (modelo.tags) {
        let listaTags = modelo.tags.split(',').map(t => t.trim());
        for (let tag of listaTags) { 
            if (tag !== "") {
                await selecionarMenuSuspenso("Tags", tag); 
                await new Promise(resolve => setTimeout(resolve, 300)); // Respiro extra contra rate limit
            }
        }
    }
    if (modelo.playlist) await selecionarMenuSuspenso("Playlists", modelo.playlist);
    if (modelo.idade) await selecionarMenuSuspenso("Classificação indicativa", modelo.idade);

    if (appSettings.copyVis && modelo.visibility) {
        let visSpans = Array.from(document.querySelectorAll('span'));
        let visBtn = visSpans.find(s => s.textContent.trim() === modelo.visibility);
        if (visBtn) visBtn.closest('div').click();
    }
    showToast("✅ Tudo preenchido!");
}

document.addEventListener('keydown', function(event) {
    if (!window.location.pathname.match(/^\/studio\/video\/.+/)) return;
    let s = appSettings.shSave; let b = appSettings.shFill; let k = event.key.toLowerCase();
    if (k === s.key && event.altKey === s.altKey && event.ctrlKey === s.ctrlKey && event.shiftKey === s.shiftKey) {
        event.preventDefault(); triggerSalvar();
    }
    else if (k === b.key && event.altKey === b.altKey && event.ctrlKey === b.ctrlKey && event.shiftKey === b.shiftKey) {
        event.preventDefault(); triggerPreencher();
    }
});

// ------------------------------------------
// LÓGICA: ORDENADOR DE PLAYLIST (Com Respiro de Servidor)
// ------------------------------------------
document.getElementById('cinefy-btn-sort').addEventListener('click', async () => {
    let listContainer = document.querySelector('div[class*="VideoList"]');
    if (!listContainer) return;

    let items = Array.from(listContainer.querySelectorAll('div[draggable="true"]'));
    if (items.length < 2) { showToast("⚠️ Poucos vídeos para ordenar."); return; }

    let parsedItems = items.map(el => {
        let titleEl = el.querySelector('span[class*="Title"]');
        let title = titleEl ? titleEl.textContent.trim() : "";
        let season = 1; let ep = 0;

        let sMatch = title.match(/T\s*(\d+)/i);
        if (sMatch) season = parseInt(sMatch[1]);

        let eMatch = title.match(/Ep\.?\s*(\d+)/i);
        if (eMatch) { ep = parseInt(eMatch[1]); } 
        else { let lastNum = title.match(/(\d+)(?!.*\d)/); if (lastNum) ep = parseInt(lastNum[1]); }
        
        return { title, season, ep, id: el.getAttribute('data-handler-id') };
    });

    let originalIds = parsedItems.map(i => i.id);

    parsedItems.sort((a, b) => {
        if (a.season !== b.season) return a.season - b.season;
        return a.ep - b.ep;
    });

    let targetIds = parsedItems.map(i => i.id);
    
    if (JSON.stringify(originalIds) === JSON.stringify(targetIds)) {
        showToast("✅ A playlist já está na ordem correta!");
        return;
    }

    showToast("🪄 Iniciando ordenação... Solte o mouse!");

    for (let i = 0; i < targetIds.length; i++) {
        let currentDOMItems = Array.from(listContainer.querySelectorAll('div[draggable="true"]'));
        let targetId = targetIds[i];
        
        let currentItemAtI = currentDOMItems[i];
        let currentIdAtI = currentItemAtI.getAttribute('data-handler-id');

        if (currentIdAtI !== targetId) {
            // Atualiza o Toast para mostrar que o robô não travou
            showToast(`🪄 Ordenando... Movimento ${i + 1} de ${targetIds.length}`, 3000);

            let sourceNode = currentDOMItems.find(el => el.getAttribute('data-handler-id') === targetId);
            let targetNode = currentItemAtI; 
            
            targetNode.scrollIntoView({block: 'center', behavior: 'smooth'});
            await new Promise(r => setTimeout(r, 400)); 
            
            await arrastarESoltarReact(sourceNode, targetNode);
            
            // O RESPIRO: Espera 1.5s antes do próximo drag para a API do site salvar a ordem com calma
            await new Promise(r => setTimeout(r, 1500)); 
        }
    }
    showToast("✅ Playlist ordenada com sucesso!", 5000);
});

async function arrastarESoltarReact(source, target) {
    const dataTransfer = new DataTransfer();
    dataTransfer.effectAllowed = 'move';
    
    let dragHandle = source.querySelector('svg') ? source.querySelector('svg').parentElement : source;

    let rectSource = dragHandle.getBoundingClientRect();
    let rectTarget = target.getBoundingClientRect();

    let dragStartEvt = new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer, clientX: rectSource.left, clientY: rectSource.top });
    dragHandle.dispatchEvent(dragStartEvt);
    await new Promise(r => setTimeout(r, 50));

    let dragEnterEvt = new DragEvent('dragenter', { bubbles: true, cancelable: true, dataTransfer, clientX: rectTarget.left, clientY: rectTarget.top });
    target.dispatchEvent(dragEnterEvt);
    
    let dragOverEvt = new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer, clientX: rectTarget.left, clientY: rectTarget.top + 5 });
    target.dispatchEvent(dragOverEvt);
    await new Promise(r => setTimeout(r, 50));

    let dropEvt = new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer, clientX: rectTarget.left, clientY: rectTarget.top + 5 });
    target.dispatchEvent(dropEvt);

    let dragEndEvt = new DragEvent('dragend', { bubbles: true, cancelable: true, dataTransfer });
    dragHandle.dispatchEvent(dragEndEvt);
}