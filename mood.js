// 오늘 기분의 날씨 그림: 홈(고르기)과 돌아보기(그날의 날씨)가 함께 써요.
// 기분 기록은 이 기기 저장소에만 있어요. 그래프·평균·변화 같은 건 만들지 않아요.
// 모양: [{ id, at, level }]  level 4 맑아요 · 3 구름 조금 · 2 흐려요 · 1 비가 와요
(function () {
  const KEY = "chagok.mood.v1";
  const cloud = (fill, dx = 0, dy = 0) =>
    `<g fill="${fill}" transform="translate(${dx} ${dy})"><circle cx="17" cy="28" r="7.5"/><circle cx="25.5" cy="23.5" r="9.5"/><circle cx="34" cy="29" r="6.5"/><rect x="10" y="27" width="30" height="9.5" rx="4.75"/></g>`;
  const MOODS = [
    { level: 4, label: "맑아요", svg: `<circle cx="24" cy="23" r="15" fill="#f8dfcc"/><circle cx="24" cy="23" r="10" fill="#e8a87c"/>` },
    { level: 3, label: "구름 조금", svg: `<circle cx="30" cy="17" r="11" fill="#f8dfcc"/><circle cx="30" cy="17" r="7.5" fill="#e8a87c"/>${cloud("#e8dccd", -2, 3)}` },
    { level: 2, label: "흐려요", svg: `${cloud("#d6c3ae", 4, -6)}${cloud("#e6d8c8", -3, 2)}` },
    { level: 1, label: "비가 와요", svg: `${cloud("#cdb8a2", 0, -5)}<g stroke="#b9a18a" stroke-width="2.6" stroke-linecap="round"><line x1="18" y1="37" x2="16.5" y2="41.5"/><line x1="25" y1="37" x2="23.5" y2="41.5"/><line x1="32" y1="37" x2="30.5" y2="41.5"/></g>` },
  ];
  const svg = (level) => {
    const m = MOODS.find((x) => x.level === level);
    return m ? `<svg viewBox="5 4 38 38" aria-hidden="true">${m.svg}</svg>` : "";
  };
  function load() {
    try {
      const v = JSON.parse(localStorage.getItem(KEY));
      if (Array.isArray(v)) return v.filter((m) => m && typeof m.at === "string" && MOODS.some((x) => x.level === m.level));
    } catch (e) {}
    return [];
  }
  window.chagokMood = { KEY, MOODS, svg, load };
})();
