function draw() {
  if (S.mode === "card") return drawCard();
  if (S.mode === "hub") return drawHub();
  if (S.mode === "talk") return drawTalk();
  if (S.mode === "cal") return drawCalendar();
  if (S.mode === "movein") return drawMoveIn();
  if (S.mode === "night") return drawNight();
  if (S.mode === "chat") return drawChat();
  if (S.mode === "clinic") return drawClinic();
  if (S.mode === "search") return drawSearch();
  if (S.mode === "wait") return drawWait();
  if (S.mode === "end") return ending();
  renderWeb();
}

renderNotes();
setTime(S.time);
bootGame();
