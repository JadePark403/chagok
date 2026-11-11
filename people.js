// 털어놓을 수 있는 사람: 여러 화면이 함께 써요 (people.html, 털어놓기, 홈의 낮은 날).
// 목록은 이 기기 저장소(localStorage)에만 있어요.
// 앱은 절대 대신 연락하거나 글을 보내지 않아요. 전화·문자 앱을 "열기만" 하고, 문자에 내용을 미리 넣지도 않아요.
// 모양: [{ id, name, phone?, at }]
(function () {
  const KEY = "chagok.people.v1";

  const css = `
    .ppl-hint { background: var(--card); border-radius: 16px; padding: 14px 16px 12px; }
    .ppl-hint .ppl-q { color: var(--soft); font-size: 0.85rem; margin: 0 0 2px; }
    .ppl-hint .ppl-name { font-size: 1.15rem; margin: 0; }
    .ppl-row { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; margin-top: 10px; }
    .ppl-row .grow { margin-right: auto; }
    .ppl-act {
      font: inherit; font-size: 0.9rem; text-decoration: none; white-space: nowrap; cursor: pointer;
      border: none; border-radius: 999px; padding: 7px 15px; background: var(--peach); color: var(--accent-deep);
    }
    .ppl-quiet {
      font: inherit; font-size: 0.85rem; cursor: pointer; border: none; background: none;
      color: var(--soft); padding: 6px 4px; white-space: nowrap;
    }
    .ppl-empty { color: var(--soft); font-size: 0.88rem; }
    .ppl-empty a { color: var(--accent-deep); }
  `;
  let styled = false;
  function style() {
    if (styled) return;
    styled = true;
    const el = document.createElement("style");
    el.textContent = css;
    document.head.appendChild(el);
  }

  function load() {
    try {
      const v = JSON.parse(localStorage.getItem(KEY));
      if (Array.isArray(v)) return v.filter((p) => p && typeof p.name === "string" && p.name.trim());
    } catch (e) {}
    return [];
  }
  function save(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); return true; } catch (e) { return false; }
  }
  // 전화번호에서 숫자와 +만 남겨요 (링크에 쓰려고)
  const telDigits = (phone) => String(phone || "").replace(/[^\d+]/g, "");

  // 전화·문자 버튼: 누르면 폰의 전화/문자 앱이 열릴 뿐, 앱이 보내는 건 없어요
  function contactLinks(p) {
    const d = telDigits(p.phone);
    if (!d) return [];
    const call = document.createElement("a");
    call.className = "ppl-act";
    call.href = "tel:" + d;
    call.textContent = "전화";
    const sms = document.createElement("a");
    sms.className = "ppl-act";
    sms.href = "sms:" + d;   // 내용은 비워 둬요
    sms.textContent = "문자";
    return [call, sms];
  }

  // 한 명만 부드럽게 보여 줘요. 목록이 비어 있으면 적어 둘 수 있다고만 살짝 알려요.
  let lastId = null;
  function suggest(el, opts = {}) {
    style();
    el.innerHTML = "";
    const list = load();
    if (list.length === 0) {
      if (opts.quietWhenEmpty) { el.hidden = true; return false; }
      const p = document.createElement("p");
      p.className = "ppl-empty";
      p.innerHTML = '힘들 때 떠올릴 사람을 <a href="people.html">적어 둘 수 있어요 →</a>';
      el.appendChild(p);
      el.hidden = false;
      return true;
    }
    const pool = list.length > 1 ? list.filter((x) => x.id !== lastId) : list;
    const person = pool[Math.floor(Math.random() * pool.length)];
    lastId = person.id;

    const box = document.createElement("div");
    box.className = "ppl-hint";
    const q = document.createElement("p");
    q.className = "ppl-q";
    q.textContent = "이 사람에게 연락해 볼까?";
    const n = document.createElement("p");
    n.className = "ppl-name";
    n.textContent = person.name;
    const row = document.createElement("div");
    row.className = "ppl-row";
    const links = contactLinks(person);
    if (list.length > 1) {
      const other = document.createElement("button");
      other.type = "button";
      other.className = "ppl-quiet grow";
      other.textContent = "다른 사람";
      other.addEventListener("click", () => suggest(el, opts));
      row.appendChild(other);
    } else if (links.length) {
      const spacer = document.createElement("span");
      spacer.className = "grow";
      row.appendChild(spacer);
    }
    links.forEach((a) => row.appendChild(a));
    if (opts.onClose) {
      const close = document.createElement("button");
      close.type = "button";
      close.className = "ppl-quiet";
      close.textContent = "괜찮아요";
      close.addEventListener("click", opts.onClose);
      row.appendChild(close);
    }
    box.append(q, n);
    if (row.childNodes.length) box.appendChild(row);
    el.appendChild(box);
    el.hidden = false;
    return true;
  }

  window.chagokPeople = { KEY, load, save, telDigits, contactLinks, suggest };
})();
