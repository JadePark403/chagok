// 도움받을 곳: 모든 화면에서 한 번에 닿도록, 이 파일 하나를 각 화면에 불러와요.
// 화면 안에 data-help-slot 표시가 있는 곳에 "도움받을 곳" 버튼이 들어가요.
//
// ⚠️ 번호·운영 정보는 바뀔 수 있어요. 출시 전에 꼭 다시 확인할 것.
//    마지막 확인: 2026년 11월 (보건복지부 109 통합번호, 서울시 1577-0199 안내 기준)
(function () {
  const LINES = [
    { number: "109", tel: "109", name: "자살예방상담전화", note: "24시간 · 힘든 마음을 들어 줘요" },
    { number: "1577-0199", tel: "15770199", name: "정신건강위기상담전화", note: "24시간 · 가까운 정신건강복지센터로 연결돼요" },
  ];
  const EMERGENCY = [
    { number: "119", tel: "119" },
    { number: "112", tel: "112" },
  ];

  const css = `
    .help-btn {
      font: inherit; font-size: 0.85rem; cursor: pointer;
      border: 1px solid #eadfd3; background: #fff; color: #6b5d51;
      border-radius: 999px; padding: 6px 12px; white-space: nowrap;
    }
    .help-btn:active { transform: scale(0.97); }
    .help-sheet {
      border: none; padding: 0; margin: auto auto 0; width: 100%; max-width: 480px;
      background: #faf6f0; color: #4a4038; border-radius: 22px 22px 0 0;
      font-family: inherit; line-height: 1.5;
    }
    .help-sheet::backdrop { background: rgba(74, 64, 56, 0.35); }
    .help-sheet[open] { animation: helpUp .3s ease; }
    @keyframes helpUp { from { transform: translateY(30px); opacity: 0; } to { transform: none; opacity: 1; } }
    @media (prefers-reduced-motion: reduce) { .help-sheet[open] { animation: none; } }
    .help-inner { padding: 22px 18px calc(22px + env(safe-area-inset-bottom)); }
    .help-sheet h2 { font-size: 1.15rem; margin: 0 0 4px; }
    .help-sheet .help-sub { color: #8c7f73; font-size: 0.9rem; margin: 0 0 16px; }
    .help-line {
      display: flex; align-items: center; gap: 14px; text-decoration: none; color: inherit;
      background: #fff; border: 1px solid #eee5da; border-radius: 16px;
      padding: 14px 16px; margin-bottom: 10px;
    }
    .help-line .num { font-size: 1.35rem; font-weight: 700; color: #c9784a; min-width: 5.2em; }
    .help-line .who { font-size: 0.98rem; }
    .help-line .who small { display: block; color: #8c7f73; font-size: 0.82rem; }
    .help-emergency { font-size: 0.92rem; margin: 14px 2px 4px; }
    .help-emergency a { color: #c9784a; font-weight: 700; text-decoration: none; padding: 4px 2px; }
    .help-note {
      color: #8c7f73; font-size: 0.82rem; margin: 14px 2px 0;
      border-top: 1px solid #eee5da; padding-top: 12px;
    }
    .help-close {
      display: block; width: 100%; margin-top: 16px; font: inherit; cursor: pointer;
      border: none; background: none; color: #8c7f73; padding: 10px;
    }
  `;

  function build() {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);

    const sheet = document.createElement("dialog");
    sheet.className = "help-sheet";
    sheet.setAttribute("aria-labelledby", "helpTitle");
    sheet.innerHTML = `
      <div class="help-inner">
        <h2 id="helpTitle">혼자 견디기 힘들 때</h2>
        <p class="help-sub">이야기를 들어 줄 사람이 있어요. 누르면 바로 전화가 걸려요.</p>
        ${LINES.map((l) => `
          <a class="help-line" href="tel:${l.tel}">
            <span class="num">${l.number}</span>
            <span class="who">${l.name}<small>${l.note}</small></span>
          </a>`).join("")}
        <p class="help-emergency">지금 몸이 위험하다면 바로
          ${EMERGENCY.map((e) => `<a href="tel:${e.tel}">${e.number}</a>`).join(" 또는 ")}
        </p>
        <p class="help-note">이 앱은 치료 앱이 아니에요. 전문적인 상담이나 치료를 대신할 수 없어요.<br>
          내가 쓴 기록은 이 기기 안에만 있고, 어디로도 보내지지 않아요.</p>
        <button class="help-close" type="button">닫기</button>
      </div>`;
    document.body.appendChild(sheet);

    sheet.querySelector(".help-close").addEventListener("click", () => sheet.close());
    // 바깥 어두운 곳을 탭해도 닫혀요
    sheet.addEventListener("click", (e) => { if (e.target === sheet) sheet.close(); });

    document.querySelectorAll("[data-help-slot]").forEach((slot) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "help-btn";
      btn.textContent = "도움받을 곳";
      btn.addEventListener("click", () => sheet.showModal());
      slot.appendChild(btn);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
