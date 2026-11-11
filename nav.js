// "← 오늘 해낸 일" 같은 돌아가기 링크(data-back): 홈에서 들어왔다면 홈을 새로 열지 않고 뒤로 가요.
// 그러면 방문 기록이 쌓이지 않고, 폰이 기억해 둔 홈 화면(스크롤 위치 그대로)이 돌아와요.
// 홈에서 온 게 아니라면(예: 이 화면을 바로 연 경우) 평소처럼 링크로 열어요.
(function () {
  const sameDoc = (u, target) => {
    if (!u || u.origin !== location.origin) return false;
    const norm = (p) => p.replace(/index\.html$/, "");
    return norm(u.pathname) === norm(target.pathname);
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest("a[data-back]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
    let from = null;
    try { from = new URL(document.referrer); } catch (err) {}
    if (history.length > 1 && sameDoc(from, new URL(a.href))) {
      e.preventDefault();
      history.back();
    }
  });
})();
