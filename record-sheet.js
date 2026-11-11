// 기록 고치기 창: "오늘 내가 해낸 것"과 "돌아보기"가 함께 써요.
// 사용법: openRecordSheet(기록id, 바뀐 뒤 할 일)
// 기록은 이 브라우저 저장소(localStorage)에만 있고, 여기서도 그 안에서만 고쳐요.
(function () {
  const KEY = "overcome.v1";

  const css = `
    .rec-sheet {
      border: none; padding: 0; margin: auto auto 0; width: 100%; max-width: 480px;
      background: var(--bg); color: var(--text); border-radius: 22px 22px 0 0;
      font-family: inherit; line-height: 1.5;
    }
    .rec-sheet::backdrop { background: rgba(74, 64, 56, 0.3); }
    .rec-sheet[open] { animation: recUp .28s ease; }
    @keyframes recUp { from { transform: translateY(24px); opacity: 0; } to { transform: none; opacity: 1; } }
    @media (prefers-reduced-motion: reduce) { .rec-sheet[open] { animation: none; } }
    .rec-inner { padding: 20px 18px calc(20px + env(safe-area-inset-bottom)); }
    .rec-when { color: var(--soft); font-size: 0.85rem; margin: 0; }
    .rec-name { font-size: 1.2rem; margin: 2px 0 14px; }
    .rec-name small { font-weight: 400; color: var(--accent-deep); font-size: 0.85rem; margin-left: 6px; }
    .rec-memo {
      display: block; width: 100%; font: inherit; color: inherit;
      padding: 12px 14px; border: 1.5px solid transparent; border-radius: 12px;
      background: var(--card); outline: none;
    }
    .rec-memo::placeholder { color: var(--faint); }
    .rec-memo:focus { border-color: var(--accent); background: var(--bg); }
    .rec-row { display: flex; align-items: center; gap: 8px; margin-top: 16px; flex-wrap: wrap; }
    .rec-row[hidden] { display: none; }
    .rec-row .grow { margin-right: auto; }
    .rec-btn {
      font: inherit; font-size: 0.95rem; cursor: pointer; border-radius: 12px; padding: 10px 16px;
      border: none; background: var(--card); color: var(--text); white-space: nowrap;
    }
    .rec-btn.main { background: var(--accent); color: #fff; }
    .rec-btn.quiet { border-color: transparent; background: none; color: var(--soft); }
    .rec-link {
      font: inherit; font-size: 0.88rem; cursor: pointer; border: none; background: none;
      color: var(--soft); padding: 8px 2px; text-decoration: underline; text-underline-offset: 3px;
    }
    .rec-ask { color: var(--text); font-size: 0.92rem; width: 100%; margin: 0 0 2px; }
  `;

  function load() {
    try {
      const d = JSON.parse(localStorage.getItem(KEY));
      if (d && Array.isArray(d.items) && Array.isArray(d.records)) return d;
    } catch (e) {}
    return { items: [], records: [] };
  }
  function save(d) {
    try { localStorage.setItem(KEY, JSON.stringify(d)); return true; } catch (e) { return false; }
  }

  let sheet, els, currentId = null, onChange = null;

  function build() {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);

    sheet = document.createElement("dialog");
    sheet.className = "rec-sheet";
    sheet.setAttribute("aria-labelledby", "recName");
    sheet.innerHTML = `
      <div class="rec-inner">
        <p class="rec-when" id="recWhen"></p>
        <p class="rec-name" id="recName"></p>
        <input class="rec-memo" id="recMemo" maxlength="80" placeholder="한 줄 남겨도 좋아요 (선택)" autocomplete="off" />
        <div class="rec-row" id="recMain">
          <button class="rec-link grow" id="recRemove" type="button">기록에서 빼기</button>
          <button class="rec-btn quiet" id="recClose" type="button" autofocus>닫기</button>
          <button class="rec-btn main" id="recSave" type="button">남기기</button>
        </div>
        <div class="rec-row" id="recConfirm" hidden>
          <p class="rec-ask">이 기록을 뺄까요?</p>
          <button class="rec-btn quiet grow" id="recKeep" type="button">그대로 둘래요</button>
          <button class="rec-btn" id="recYes" type="button">빼기</button>
        </div>
      </div>`;
    document.body.appendChild(sheet);
    const $ = (id) => sheet.querySelector("#" + id);
    els = {
      when: $("recWhen"), name: $("recName"), memo: $("recMemo"),
      main: $("recMain"), confirm: $("recConfirm"),
    };

    $("recClose").addEventListener("click", () => sheet.close());
    $("recSave").addEventListener("click", saveMemo);
    els.memo.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); saveMemo(); } });
    $("recRemove").addEventListener("click", () => showConfirm(true));
    $("recKeep").addEventListener("click", () => showConfirm(false));
    $("recYes").addEventListener("click", removeRecord);
    // 바깥 어두운 곳을 탭하면 아무것도 바꾸지 않고 닫혀요
    sheet.addEventListener("click", (e) => { if (e.target === sheet) sheet.close(); });
  }

  function showConfirm(on) {
    els.main.hidden = on;
    els.confirm.hidden = !on;
    els.memo.disabled = on;
  }

  function finish() {
    sheet.close();
    if (onChange) onChange();
  }

  function saveMemo() {
    const d = load();
    const r = d.records.find((x) => x.id === currentId);
    if (!r) { sheet.close(); return; }
    const text = els.memo.value.trim();
    if ((r.memo || "") === text) { sheet.close(); return; }
    if (text) r.memo = text; else delete r.memo;
    save(d);
    finish();
  }

  function removeRecord() {
    const d = load();
    d.records = d.records.filter((x) => x.id !== currentId);
    save(d);
    finish();
  }

  window.openRecordSheet = function (id, changed) {
    if (!sheet) build();
    const r = load().records.find((x) => x.id === id);
    if (!r) return;
    currentId = id;
    onChange = changed || null;
    const when = new Date(r.at);
    els.when.textContent =
      when.toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" }) + " " +
      when.toLocaleTimeString("ko-KR", { hour: "numeric", minute: "2-digit" });
    els.name.textContent = r.name;
    const tag = document.createElement("small");
    tag.textContent = "내가 해냈어요";
    els.name.appendChild(tag);
    els.memo.value = r.memo || "";
    showConfirm(false);
    sheet.showModal();   // "닫기"에 먼저 초점이 가서, 폰에서 키보드가 바로 튀어나오지 않아요
  };
})();
