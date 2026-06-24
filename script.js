// ==========================================
// ⚙️ streech 7 動作システム（音なし・短い改行版）
// ==========================================
(function() {
    // 🎬 ロード画面消去（フリーズバグ完全修正）
    document.addEventListener('DOMContentLoaded', () => {
        const loader = document.getElementById('loading-screen');
        setTimeout(() => { 
            if (loader) {
                loader.classList.add('fade-out');
                setTimeout(() => { loader.style.display = 'none'; }, 400);
            }
        }, 2400); 
    });

    // ⚡ ターボ・FPS制御
    let isTurbo = false;
    const turboBtn = document.getElementById('turbo-btn');
    if (turboBtn) {
        turboBtn.addEventListener('click', () => {
            isTurbo = !isTurbo;
            turboBtn.classList.toggle('active', isTurbo);
        });
    }
    const fpsSlider = document.getElementById('fps-slider');
    const fpsDisplay = document.getElementById('fps-display');
    if (fpsSlider && fpsDisplay) {
        fpsSlider.addEventListener('input', (e) => { fpsDisplay.textContent = e.target.value + 'FPS'; });
    }

    // タブ閉じる
    const closePaletteBtn = document.getElementById('close-palette-btn');
    const blockPalette = document.getElementById('block-palette');
    if (closePaletteBtn && blockPalette) {
        closePaletteBtn.addEventListener('click', () => {
            blockPalette.style.visibility = (blockPalette.style.visibility === 'hidden') ? 'visible' : 'hidden';
        });
    }

    // 各初期値
    let currentX = 0, currentStretch = 55, foreverInterval = null;
    const actor = document.getElementById('stage-actor');
    const tomeeyBody = document.getElementById('tomeey-body-target');
    const workspace = document.getElementById('workspace');

    // ブロッククローン関数
    function bindBlockEvents(el) {
        el.addEventListener('click', () => {
            if (!workspace) return;
            const clone = el.cloneNode(true);
            clone.addEventListener('click', (e) => { e.stopPropagation(); clone.remove(); });
            workspace.appendChild(clone);
        });
    }
    document.querySelectorAll('#block-palette .streech-block').forEach(bindBlockEvents);

    // 🟩 実行（ずっとループ対応）
    document.getElementById('green-flag').addEventListener('click', () => {
        clearInterval(foreverInterval);
        const activeBlocks = workspace.querySelectorAll('.streech-block');
        if(activeBlocks.length === 0) return;

        let hasForever = Array.from(activeBlocks).some(b => b.getAttribute('data-type') === 'forever');

        function run() {
            activeBlocks.forEach((block, index) => {
                setTimeout(() => {
                    const type = block.getAttribute('data-type');
                    if (type === 'move') { currentX += 20; actor.style.transform = `translateX(${currentX}px)`; }
                    else if (type === 'turn-angle') { actor.style.transform = `translateX(${currentX}px) rotate(90deg)`; }
                    else if (type === 'move-reset') { currentX = 0; actor.style.transform = `translateX(0px) rotate(0deg)`; }
                    else if (type === 'stretch-change') { currentStretch += 25; tomeeyBody.style.height = currentStretch + 'px'; }
                    else if (type === 'stretch-reset') { currentStretch = 55; tomeeyBody.style.height = currentStretch + 'px'; }
                    else if (type === 'food-spawn') { document.getElementById('food-stage-area').innerHTML = '<div class="stage-apple"></div>'; }
                    else if (type === 'food-freshness') { alert(document.querySelector('.stage-apple') ? '🍎 新鮮です！' : '❓ 食べ物がありません'); }
                    else if (type === 'food-eat') {
                        const apple = document.querySelector('.stage-apple');
                        if (apple) {
                            currentX = 60; actor.style.transform = `translateX(${currentX}px)`;
                            setTimeout(() => {
                                currentStretch = 95; tomeeyBody.style.height = currentStretch + 'px';
                                setTimeout(() => { apple.remove(); currentStretch = 55; tomeeyBody.style.height = currentStretch + 'px'; alert('✨ フードロスゼロ！'); }, 300);
                            }, 250);
                        }
                    }
                }, index * (isTurbo ? 50 : 200));
            });
        }

        if (hasForever) {
            foreverInterval = setInterval(run, activeBlocks.length * (isTurbo ? 100 : (1000 / parseInt(fpsSlider.value))));
        } else { run(); }
    });

    // 🛑 停止
    document.getElementById('stop-all').addEventListener('click', () => {
        clearInterval(foreverInterval); currentX = 0; currentStretch = 55;
        actor.style.transform = 'translateX(0px) rotate(0deg)'; tomeeyBody.style.height = '55px';
        document.getElementById('food-stage-area').innerHTML = '';
    });

    // 📦 拡張機能追加
    const extBtn = document.getElementById('add-extension-btn'), palette = document.getElementById('block-palette');
    let isExtLoaded = false;
    if (extBtn && palette) {
        extBtn.addEventListener('click', (e) => {
            e.preventDefault(); if (isExtLoaded) return;
            alert('🔋 food First 追加！');
            const h = document.createElement('p'); h.className = 'section-hint'; h.style.marginTop = '20px'; h.innerHTML = '🍎 food First'; palette.appendChild(h);
            [{type:'food-spawn',text:'ランダムに食べ物をだす'},{type:'food-freshness',text:'食べ物の「新鮮さ」を調べる'},{type:'food-eat',text:'残さずキレイに食べる'}].forEach(item => {
                const b = document.createElement('div'); b.className = 'streech-block block-food-style'; b.setAttribute('data-type', item.type); b.textContent = item.text;
                bindBlockEvents(b); palette.appendChild(b);
            });
            extBtn.textContent = '✅ food First 導入済み'; isExtLoaded = true;
        });
    }

    // 💾 保存ボタン（道連れ落下中は無効化する安全処理）
    const saveBtn = document.getElementById('save-btn');

    // 📁 【管理者特製】tomeeyの「読込＆保存ボタンを道連れ落下させる」お茶目ギミック
    const fileLoad = document.getElementById('file-load');
    if (fileLoad && saveBtn) {
        fileLoad.addEventListener('click', (e) => {
            e.preventDefault(); // ファイルアプリが開くのを防止
            
            alert('🦆 tomeey「急いで準備しなきゃ！」\n（バタバタバタッ！）');
            
            // 読込ボタンが下へ落ちる！
            fileLoad.style.transition = 'transform 0.5s ease-in, opacity 0.5s';
            fileLoad.style.transform = 'translateY(150px) rotate(45deg)';
            fileLoad.style.opacity = '0';
            
            // 💾 隣の保存ボタンも衝撃で逆方向に傾きながら落下！
            saveBtn.style.transition = 'transform 0.6s ease-in, opacity 0.6s'; 
            saveBtn.style.transform = 'translateY(150px) rotate(-30deg)'; 
            saveBtn.style.opacity = '0';
            
            setTimeout(() => {
                alert('💥 あっ！tomeeyが慌てすぎて読込ボタンを落とし、その衝撃で保存ボタンも道連れで床に落ちて壊れちゃった！\n（全てのボタンが消滅しました）');
                fileLoad.style.display = 'none'; 
                saveBtn.style.display = 'none'; // 両方完全に消し去る
            }, 600);
        });
    }
})();
