/**
 * 旅遊搜尋列 - 雙月日期選擇器 (XL & SM 多實例整合通用版)
 */

(function () {
    const BREAKPOINT = 992;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dateToolContexts = document.querySelectorAll('.etd-1.sass-form-group');

    dateToolContexts.forEach((container) => {
        const input = container.querySelector('input[type="text"]');
        const calendar = container.querySelector('.calendar');
        const overlay = container.querySelector('.overlay');
        const statusHint = container.querySelector('.editing-hint');
        const mCloseBtn = container.querySelector('.m-close-btn');
        const pcCloseBtn = container.querySelector('.pc-close-btn');
        const dateWrapper = container.querySelector('.date-selector-wrapper');

        let scrollPos = 0;

        // ===== 動態設定今天到三個月後 =====
        let startDate = new Date();
        startDate.setHours(0, 0, 0, 0);

        let endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 3);
        endDate.setHours(0, 0, 0, 0);

        let viewDate = new Date();
        viewDate.setHours(0, 0, 0, 0);
        let activeMode = "range";

        // ===== 建立月曆 HTML =====
        function createTableHTML(monthDate) {
            const y = monthDate.getFullYear(), m = monthDate.getMonth();
            const firstDay = new Date(y, m, 1).getDay();
            const lastDate = new Date(y, m + 1, 0).getDate();

            let html = `<table><thead><tr>
                <th class="is-holiday">週日</th>
                <th>週一</th>
                <th>週二</th>
                <th>週三</th>
                <th>週四</th>
                <th>週五</th>
                <th class="is-holiday">週六</th>
            </tr></thead><tbody><tr>`;

            for (let i = 0; i < firstDay; i++) html += "<td></td>";
            for (let d = 1; d <= lastDate; d++) {
                const curr = new Date(y, m, d);
                const isHoliday = (curr.getDay() === 0 || curr.getDay() === 6) ? "is-holiday" : "";
                const isDisabled = curr < today ? "disabled" : "";
                html += `<td data-date="${y}-${m + 1}-${d}" class="${isHoliday} ${isDisabled}">
                            <div class="date-box"><span>${d}</span><span class="txt"></span></div>
                         </td>`;
                if ((firstDay + d) % 7 === 0) html += "</tr><tr>";
            }
            return html + "</tr></tbody></table>";
        }

        // ===== 更新 UI 狀態 =====
        function updateUI() {
            calendar.querySelectorAll("td[data-date]").forEach((td) => {
                const dateStr = td.dataset.date.replace(/-/g, "/");
                const curr = new Date(dateStr);
                const txt = td.querySelector(".txt");

                td.classList.remove("start-date", "end-date", "in-range", "hover-range", "hover-end");
                if (txt) txt.textContent = "";

                const isStart = startDate && curr.getTime() === startDate.getTime();
                const isEnd = endDate && curr.getTime() === endDate.getTime();

                if (isStart) {
                    td.classList.add("start-date");
                    if (txt) txt.textContent = "出發";
                }

                if (isEnd) {
                    td.classList.add("end-date");
                    if (txt) txt.textContent = "回程";
                }

                if (startDate && endDate && curr > startDate && curr < endDate) {
                    td.classList.add("in-range");
                }
            });

            if (statusHint) {
                statusHint.textContent = activeMode === "start" ? "請選擇 [出發日期]" :
                    (activeMode === "end" ? "請選擇 [回程日期]" : "點擊日期重新選擇");
            }
        }

        // ===== 日期格子事件 =====
        function attachCellEvents() {
            calendar.querySelectorAll("td[data-date]").forEach((td) => {
                if (td.classList.contains("disabled")) return;

                td.onclick = (e) => {
                    e.stopPropagation();
                    const clicked = new Date(td.dataset.date.replace(/-/g, "/"));

                    if (activeMode === "start") {
                        if (endDate && clicked >= endDate) endDate = null;
                        startDate = clicked;

                        if (window.innerWidth < 576) {
                            hideCalendar(); // 手機板選完去程自動關閉
                        } else {
                            activeMode = "end"; // PC版切換回程模式
                        }
                    } else if (activeMode === "end") {
                        if (clicked < startDate) { alert("回程日期不能早於出發日期"); return; }
                        endDate = clicked;
                        hideCalendar();
                    } else {
                        startDate = clicked; endDate = null; activeMode = "end";
                    }

                    updateInputText();
                    updateUI();
                };

                td.onmouseenter = () => {
                    if (window.innerWidth < BREAKPOINT || !startDate || endDate) return;
                    const hDate = new Date(td.dataset.date.replace(/-/g, "/"));
                    if (hDate < startDate) return;

                    calendar.querySelectorAll("td[data-date]").forEach((t) => {
                        const c = new Date(t.dataset.date.replace(/-/g, "/"));
                        const tTxt = t.querySelector(".txt");
                        t.classList.remove("hover-range", "hover-end");
                        if (c.getTime() !== startDate.getTime() && tTxt) tTxt.textContent = "";

                        if (c > startDate && c < hDate) t.classList.add("hover-range");
                        else if (c.getTime() === hDate.getTime()) {
                            t.classList.add("hover-end");
                            if (tTxt) tTxt.textContent = "回程";
                        }
                    });
                };
            });
        }

        // ===== 更新輸入框文字 (手機版 & 電腦版同步) =====
        function updateInputText() {
            const fmt = (d) => d ? `${d.getFullYear()}/${(d.getMonth()+1).toString().padStart(2,"0")}/${d.getDate().toString().padStart(2,"0")}` : "__/__/__";

            // 更新當前容器
            const pcStartVal = container.querySelector('#startVal');
            const pcEndVal = container.querySelector('#endVal');
            if (pcStartVal) pcStartVal.textContent = startDate ? fmt(startDate) : "去程日期";
            if (pcEndVal) pcEndVal.textContent = endDate ? fmt(endDate) : "回程日期";

            const mS = container.querySelector('.m-value[id^="mStartVal"]');
            const mE = container.querySelector('.m-value[id^="mEndVal"]');
            if (mS) mS.textContent = startDate ? fmt(startDate) : "請選擇";
            if (mE) mE.textContent = endDate ? fmt(endDate) : "請選擇";

            if (input) {
                if (startDate && endDate) input.value = `${fmt(startDate)} ~ ${fmt(endDate)}`;
                else if (startDate) input.value = `${fmt(startDate)} ~ __/__/__`;
                else input.value = "";
            }

            // 同步所有其他容器
            dateToolContexts.forEach((c) => {
                if (c === container) return;
                const pcS = c.querySelector('#startVal');
                const pcE = c.querySelector('#endVal');
                const mS = c.querySelector('.m-value[id^="mStartVal"]');
                const mE = c.querySelector('.m-value[id^="mEndVal"]');
                const inp = c.querySelector('input[type="text"]');

                if (pcS) pcS.textContent = startDate ? fmt(startDate) : "去程日期";
                if (pcE) pcE.textContent = endDate ? fmt(endDate) : "回程日期";
                if (mS) mS.textContent = startDate ? fmt(startDate) : "請選擇";
                if (mE) mE.textContent = endDate ? fmt(endDate) : "請選擇";
                if (inp) {
                    if (startDate && endDate) inp.value = `${fmt(startDate)} ~ ${fmt(endDate)}`;
                    else if (startDate) inp.value = `${fmt(startDate)} ~ __/__/__`;
                    else inp.value = "";
                }
            });
        }

        // ===== 手機鎖定滾動 =====
        function lockScroll(lock) {
            if (lock) {
                scrollPos = window.pageYOffset;
                document.body.style.top = `-${scrollPos}px`;
                document.body.classList.add('calendar-open');
            } else {
                setTimeout(() => {
                    document.body.classList.remove('calendar-open');
                    document.body.style.top = '';
                    window.scrollTo(0, scrollPos);
                }, 10);
            }
        }

        // ===== 顯示 / 隱藏月曆 =====
        function showCalendar(mode) {
            activeMode = mode;
            calendar.classList.add("active");
            if (overlay) overlay.classList.add("active");
            if (dateWrapper) dateWrapper.classList.add("active-focus");
            if (window.innerWidth < 576) lockScroll(true);
            render();
        }

        function hideCalendar() {
            calendar.classList.remove("active");
            if (overlay) overlay.classList.remove("active");
            if (dateWrapper) dateWrapper.classList.remove("active-focus");
            activeMode = "range";
            if (window.innerWidth < 576) lockScroll(false);
        }

        // ===== 綁定按鈕事件 =====
        const rangeBtn = container.querySelector('#rangeBtn') || input;
        if (rangeBtn) rangeBtn.onclick = () => showCalendar("range");

        const mSBtn = container.querySelector('.m-input-group[id^="mStartBtn"]');
        const mEBtn = container.querySelector('.m-input-group[id^="mEndBtn"]');
        const pcStartBox = container.querySelector('#startBox');
        const pcEndBox = container.querySelector('#endBox');

        if (mSBtn) mSBtn.onclick = () => showCalendar("start");
        if (mEBtn) mEBtn.onclick = () => showCalendar("end");
        if (pcStartBox) pcStartBox.onclick = () => showCalendar("start");
        if (pcEndBox) pcEndBox.onclick = () => showCalendar("end");

        if (overlay) overlay.onclick = hideCalendar;
        if (mCloseBtn) mCloseBtn.onclick = hideCalendar;
        if (pcCloseBtn) pcCloseBtn.onclick = (e) => { e.stopPropagation(); hideCalendar(); };

        const nextPC = container.querySelector('.next-btn-pc') || container.querySelector('button[id^="nextBtnPC"]');
        const nextMob = container.querySelector('.next-btn-mobile') || container.querySelector('button[id^="nextBtnMobile"]');
        const prev = container.querySelector('.prev-btn') || container.querySelector('button[id^="prevBtn"]');

        const handleNext = (e) => { e.preventDefault(); viewDate.setMonth(viewDate.getMonth() + 1); render(); };
        const handlePrev = (e) => { e.preventDefault(); viewDate.setMonth(viewDate.getMonth() - 1); render(); };

        if (nextPC) nextPC.onclick = handleNext;
        if (nextMob) nextMob.onclick = handleNext;
        if (prev) prev.onclick = handlePrev;

        // ===== Render 整個月曆 =====
        function render() {
            const m1 = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
            const m2 = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);

            const t1 = container.querySelector('.title-text-1') || container.querySelector('span[id^="title1"]');
            const t2 = container.querySelector('.title-text-2') || container.querySelector('span[id^="title2"]');
            if (t1) t1.innerText = `${m1.getFullYear()}年${m1.getMonth() + 1}月`;
            if (t2) t2.innerText = `${m2.getFullYear()}年${m2.getMonth() + 1}月`;

            const table1 = container.querySelector('.table-container-1') || container.querySelector('div[id^="table1"]');
            const table2 = container.querySelector('.table-container-2') || container.querySelector('div[id^="table2"]');
            if (table1) table1.innerHTML = createTableHTML(m1);
            if (table2) table2.innerHTML = createTableHTML(m2);

            const prevBtn = container.querySelector('.prev-btn') || container.querySelector('button[id^="prevBtn"]');
            if (prevBtn) {
                const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                prevBtn.disabled = m1 <= thisMonth;
            }

            updateUI();         // 更新日期狀態
            attachCellEvents(); // 綁定點擊事件
        }

        // ===== 電腦版自由輸入自動關閉 =====
        if(input){
            const setReadonly = () => { input.readOnly = window.innerWidth < 576; };
            setReadonly();
            window.addEventListener('resize', setReadonly);

            input.addEventListener('input', () => {
                if(window.innerWidth < 576) return;

                const val = input.value.replace(/[^\d]/g,'');
                if(val.length === 8){
                    const y = parseInt(val.slice(0,4),10);
                    const m = parseInt(val.slice(4,6),10)-1;
                    const d = parseInt(val.slice(6,8),10);
                    const dt = new Date(y,m,d);
                    if(!isNaN(dt.getTime())){
                        if(activeMode === "end"){
                            if(dt < startDate){ alert("回程不能早於出發日期"); return; }
                            endDate = dt;
                        } else {
                            startDate = dt;
                            if(!endDate) activeMode = "end";
                        }
                        updateUI();
                        updateInputText();
                        hideCalendar();
                    }
                } else if(val.length === 16){
                    const s = val.slice(0,8), e = val.slice(8,16);
                    const sy = parseInt(s.slice(0,4),10), sm = parseInt(s.slice(4,6),10)-1, sd = parseInt(s.slice(6,8),10);
                    const ey = parseInt(e.slice(0,4),10), em = parseInt(e.slice(4,6),10)-1, ed = parseInt(e.slice(6,8),10);
                    const start = new Date(sy,sm,sd);
                    const end = new Date(ey,em,ed);
                    if(!isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start){
                        startDate = start;
                        endDate = end;
                        updateUI();
                        updateInputText();
                        hideCalendar();
                    }
                } else if(val.length === 0){
                    startDate = null;
                    endDate = null;
                    updateUI();
                    updateInputText();
                }
            });
        }

        updateInputText();
        render();
    });
})();













$(".accordion-button").on("click", function (e) {
  e.preventDefault();

  const $btn = $(this);
  const $content = $btn.next(".accordion-content");
  const $icon = $btn.find(".icon");
  const isExpanded = $btn.attr("aria-expanded") === "true";
  const duration = 350;

  // ===== 收起其他 accordion，動畫完成後再展開自己 =====
  const $others = $(".accordion-button").not($btn).filter(function() {
    return $(this).attr("aria-expanded") === "true";
  });

  let completed = 0;
  const total = $others.length;

  function tryExpand() {
    if (!isExpanded) {
      // 展開自己
      $btn.attr("aria-expanded", "true");
      $icon.addClass("expanded");

      $content.css({ display: "block", height: 0, overflow: "hidden" });
      const fullHeight = $content[0].scrollHeight;

      animateHeight($content, 0, fullHeight, duration, () => {
        $content.css({ height: "auto", overflow: "visible" });

        // ✅ accordion 展開完成後再初始化手機版日期選擇器
        const smInput = $content.find("#date-range-sm");
        if (smInput.length && typeof initDateRange === "function" && !smInput.data("daterangepicker")) {
          initDateRange(smInput);
        }
      });
    } else {
      // 收起自己
      $btn.attr("aria-expanded", "false");
      $icon.removeClass("expanded");

      const curHeight = $content.outerHeight();
      animateHeight($content, curHeight, 0, duration, () => {
        $content.css({ display: "none" });
      });
    }
  }

  if (total === 0) {
    tryExpand();
  } else {
    $others.each(function() {
      const $b = $(this);
      const $c = $b.next(".accordion-content");
      $b.attr("aria-expanded", "false");
      $b.find(".icon").removeClass("expanded");

      animateHeight($c, $c.outerHeight(), 0, duration, () => {
        $c.css("display", "none");
        completed++;
        if (completed === total) tryExpand();
      });
    });
  }
});

// ===== JS 高度動畫函數 =====
function animateHeight($el, from, to, duration, callback) {
  const start = performance.now();
  function step(timestamp) {
    const progress = Math.min((timestamp - start) / duration, 1);
    const value = from + (to - from) * progress;
    $el.css("height", value + "px");
    if (progress < 1) requestAnimationFrame(step);
    else if (callback) callback();
  }
  requestAnimationFrame(step);
}



//     const BREAKPOINT = 992;
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     // 節慶資料 YYYY-M-D
//     const holidays = {
//         "2026-1-1": "元旦",
//         "2026-2-14": "情人節",
//         "2026-4-4": "兒童節",
//         "2026-12-25": "聖誕節"
//     };

//     const dateToolContexts = document.querySelectorAll('.etd-1.sass-form-group');

//     dateToolContexts.forEach((container) => {
//         const input = container.querySelector('input[type="text"]');
//         const calendar = container.querySelector('.calendar');
//         const overlay = container.querySelector('.overlay');
//         const statusHint = container.querySelector('.editing-hint');
//         const mCloseBtn = container.querySelector('.m-close-btn');
//         const pcCloseBtn = container.querySelector('.pc-close-btn');
//         const dateWrapper = container.querySelector('.date-selector-wrapper');

//         let scrollPos = 0;
//         let startDate = new Date(2026, 0, 14);
//         let endDate = new Date(2026, 1, 15);
//         let viewDate = new Date(2026, 0, 1);
//         let activeMode = "range";

//         // ===== 建立月曆 HTML =====
//         function createTableHTML(monthDate) {
//             const y = monthDate.getFullYear(), m = monthDate.getMonth();
//             const firstDay = new Date(y, m, 1).getDay();
//             const lastDate = new Date(y, m + 1, 0).getDate();

//             let html = `<table><thead><tr>
//                 <th class="is-holiday">週日</th>
//                 <th>週一</th>
//                 <th>週二</th>
//                 <th>週三</th>
//                 <th>週四</th>
//                 <th>週五</th>
//                 <th class="is-holiday">週六</th>
//             </tr></thead><tbody><tr>`;

//             for (let i = 0; i < firstDay; i++) html += "<td></td>";
//             for (let d = 1; d <= lastDate; d++) {
//                 const curr = new Date(y, m, d);
//                 const isHoliday = (curr.getDay() === 0 || curr.getDay() === 6) ? "is-holiday" : "";
//                 const isDisabled = curr < today ? "disabled" : "";
//                 html += `<td data-date="${y}-${m + 1}-${d}" class="${isHoliday} ${isDisabled}">
//                             <div class="date-box"><span>${d}</span><span class="txt"></span></div>
//                          </td>`;
//                 if ((firstDay + d) % 7 === 0) html += "</tr><tr>";
//             }
//             return html + "</tr></tbody></table>";
//         }

//         // ===== 標註節慶 =====
//         function markHolidays() {
//             calendar.querySelectorAll("td[data-date]").forEach(td => {
//                 const dateKey = td.dataset.date;
//                 if (holidays[dateKey]) {
//                     td.classList.add("is-holiday");
//                     let label = td.querySelector(".holiday-label");
//                     if (!label) {
//                         label = document.createElement("div");
//                         label.className = "holiday-label";
//                         td.querySelector(".date-box").appendChild(label);
//                     }
//                     label.textContent = holidays[dateKey];
//                     label.style.display = "block";
//                     label.style.opacity = "1";
//                 }
//             });
//         }

//         // ===== 更新 UI 狀態 =====
//         function updateUI() {
//             calendar.querySelectorAll("td[data-date]").forEach((td) => {
//                 const dateStr = td.dataset.date.replace(/-/g, "/");
//                 const curr = new Date(dateStr);
//                 const txt = td.querySelector(".txt");
//                 const holidayLabel = td.querySelector(".holiday-label");

//                 td.classList.remove("start-date", "end-date", "in-range", "hover-range", "hover-end");
//                 if (txt) txt.textContent = "";

//                 const isStart = startDate && curr.getTime() === startDate.getTime();
//                 const isEnd = endDate && curr.getTime() === endDate.getTime();

//                 if (isStart) {
//                     td.classList.add("start-date");
//                     if (txt) txt.textContent = "出發";
//                 }

//                 if (isEnd) {
//                     td.classList.add("end-date");
//                     if (txt) txt.textContent = "回程";
//                 }

//                 if (startDate && endDate && curr > startDate && curr < endDate) {
//                     td.classList.add("in-range");
//                 }

//                 // ★ 去程 & 回程格子隱藏節慶文字
//                 if (isStart || isEnd) {
//                     if (holidayLabel) holidayLabel.style.display = "none";
//                 } else {
//                     if (holidayLabel) {
//                         holidayLabel.style.display = "block";
//                         holidayLabel.style.opacity = "1";
//                     }
//                 }
//             });

//             if (statusHint) {
//                 statusHint.textContent = activeMode === "start" ? "請選擇 [出發日期]" :
//                     (activeMode === "end" ? "請選擇 [回程日期]" : "點擊日期重新選擇");
//             }
//         }

//         // ===== 日期格子事件 =====
//         function attachCellEvents() {
//             calendar.querySelectorAll("td[data-date]").forEach((td) => {
//                 if (td.classList.contains("disabled")) return;

//                 td.onclick = (e) => {
//                     e.stopPropagation();
//                     const clicked = new Date(td.dataset.date.replace(/-/g, "/"));

//                     if (activeMode === "start") {
//                         if (endDate && clicked >= endDate) endDate = null;
//                         startDate = clicked;
//                         if (window.innerWidth < 576) lockScroll(true);
//                         else activeMode = "end";
//                     } else if (activeMode === "end") {
//                         if (clicked <= startDate) { startDate = clicked; endDate = null; }
//                         else { endDate = clicked; hideCalendar(); }
//                     } else {
//                         startDate = clicked; endDate = null; activeMode = "end";
//                     }

//                     updateInputText();
//                     updateUI();
//                 };

//                 td.onmouseenter = () => {
//                     if (window.innerWidth < BREAKPOINT || !startDate || endDate) return;
//                     const hDate = new Date(td.dataset.date.replace(/-/g, "/"));
//                     if (hDate <= startDate) return;

//                     calendar.querySelectorAll("td[data-date]").forEach((t) => {
//                         const c = new Date(t.dataset.date.replace(/-/g, "/"));
//                         const tTxt = t.querySelector(".txt");
//                         t.classList.remove("hover-range", "hover-end");
//                         if (c.getTime() !== startDate.getTime() && tTxt) tTxt.textContent = "";

//                         if (c > startDate && c < hDate) t.classList.add("hover-range");
//                         else if (c.getTime() === hDate.getTime()) {
//                             t.classList.add("hover-end");
//                             if (tTxt) tTxt.textContent = "回程";
//                         }
//                     });
//                 };
//             });
//         }

//         // ===== 更新輸入框文字 =====
//         function updateInputText() {
//             const fmt = (d) => d ? `${d.getFullYear()}/${(d.getMonth()+1).toString().padStart(2,"0")}/${d.getDate().toString().padStart(2,"0")}` : "__/__/__";

//             const pcStartVal = container.querySelector('#startVal');
//             const pcEndVal = container.querySelector('#endVal');
//             if (pcStartVal) pcStartVal.textContent = startDate ? fmt(startDate) : "去程日期";
//             if (pcEndVal) pcEndVal.textContent = endDate ? fmt(endDate) : "回程日期";

//             const mS = container.querySelector('.m-value[id^="mStartVal"]');
//             const mE = container.querySelector('.m-value[id^="mEndVal"]');
//             if (mS) mS.textContent = startDate ? fmt(startDate) : "請選擇";
//             if (mE) mE.textContent = endDate ? fmt(endDate) : "請選擇";

//             if (input) {
//                 if (startDate && endDate) {
//                     input.value = `${fmt(startDate)} ~ ${fmt(endDate)}`;
//                 } else if (startDate) {
//                     input.value = `${fmt(startDate)} ~ __/__/__`;
//                 } else {
//                     input.value = "";
//                 }
//             }
//         }

//         // ===== 手機鎖定滾動 =====
//         function lockScroll(lock) {
//             if (lock) {
//                 scrollPos = window.pageYOffset;
//                 document.body.style.top = `-${scrollPos}px`;
//                 document.body.classList.add('calendar-open');
//             } else {
//                 setTimeout(() => {
//                     document.body.classList.remove('calendar-open');
//                     document.body.style.top = '';
//                     window.scrollTo(0, scrollPos);
//                 }, 10);
//             }
//         }

//         // ===== 顯示 / 隱藏月曆 =====
//         function showCalendar(mode) {
//             activeMode = mode;
//             calendar.classList.add("active");
//             if (overlay) overlay.classList.add("active");
//             if (dateWrapper) dateWrapper.classList.add("active-focus");
//             if (window.innerWidth < 576) lockScroll(true);
//             render();
//         }

//         function hideCalendar() {
//             calendar.classList.remove("active");
//             if (overlay) overlay.classList.remove("active");
//             if (dateWrapper) dateWrapper.classList.remove("active-focus");
//             activeMode = "range";
//             if (window.innerWidth < 576) lockScroll(false);
//         }

//         // ===== 綁定按鈕事件 =====
//         const rangeBtn = container.querySelector('#rangeBtn') || input;
//         if (rangeBtn) rangeBtn.onclick = () => showCalendar("range");

//         const mSBtn = container.querySelector('.m-input-group[id^="mStartBtn"]');
//         const mEBtn = container.querySelector('.m-input-group[id^="mEndBtn"]');
//         const pcStartBox = container.querySelector('#startBox');
//         const pcEndBox = container.querySelector('#endBox');

//         if (mSBtn) mSBtn.onclick = () => showCalendar("start");
//         if (mEBtn) mEBtn.onclick = () => showCalendar("end");
//         if (pcStartBox) pcStartBox.onclick = () => showCalendar("start");
//         if (pcEndBox) pcEndBox.onclick = () => showCalendar("end");

//         if (overlay) overlay.onclick = hideCalendar;
//         if (mCloseBtn) mCloseBtn.onclick = hideCalendar;
//         if (pcCloseBtn) pcCloseBtn.onclick = (e) => { e.stopPropagation(); hideCalendar(); };

//         const nextPC = container.querySelector('.next-btn-pc') || container.querySelector('button[id^="nextBtnPC"]');
//         const nextMob = container.querySelector('.next-btn-mobile') || container.querySelector('button[id^="nextBtnMobile"]');
//         const prev = container.querySelector('.prev-btn') || container.querySelector('button[id^="prevBtn"]');

//         const handleNext = (e) => { e.preventDefault(); viewDate.setMonth(viewDate.getMonth() + 1); render(); };
//         const handlePrev = (e) => { e.preventDefault(); viewDate.setMonth(viewDate.getMonth() - 1); render(); };

//         if (nextPC) nextPC.onclick = handleNext;
//         if (nextMob) nextMob.onclick = handleNext;
//         if (prev) prev.onclick = handlePrev;

//         // ===== Render 整個月曆 =====
//         function render() {
//             const m1 = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
//             const m2 = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);

//             const t1 = container.querySelector('.title-text-1') || container.querySelector('span[id^="title1"]');
//             const t2 = container.querySelector('.title-text-2') || container.querySelector('span[id^="title2"]');
//             if (t1) t1.innerText = `${m1.getFullYear()}年${m1.getMonth() + 1}月`;
//             if (t2) t2.innerText = `${m2.getFullYear()}年${m2.getMonth() + 1}月`;

//             const table1 = container.querySelector('.table-container-1') || container.querySelector('div[id^="table1"]');
//             const table2 = container.querySelector('.table-container-2') || container.querySelector('div[id^="table2"]');
//             if (table1) table1.innerHTML = createTableHTML(m1);
//             if (table2) table2.innerHTML = createTableHTML(m2);

//             const prevBtn = container.querySelector('.prev-btn') || container.querySelector('button[id^="prevBtn"]');
//             if (prevBtn) {
//                 const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
//                 prevBtn.disabled = m1 <= thisMonth;
//             }

//             markHolidays();     // 標註節慶
//             updateUI();         // 更新日期狀態
//             attachCellEvents(); // 綁定點擊事件
//         }

//         updateInputText();
//         render();
//     });
// })();



