$(document).ready(function () {
    // ==========================================
    // 1. 更新顯示資訊與高亮樣式
    // ==========================================
    function updateDetailUI(row) {
        const $row = $(row);
        
        // 移除所有已存在的高亮，並對當前點選的 row 加上高亮
        $('.datemain-container').removeClass('highlight-row');
        $row.addClass('highlight-row');

        // 抓取資料並更新 UI
        const date = $row.find(".departure-date").text().trim();
        const seats = $row.find(".seats-flight").text().trim();
        const statusText = $row.find(".status").text().trim();
        const price = $row.find(".number").text().trim();
        
        const statusClass = $row.find(".status").hasClass("green") ? "green" :
                            $row.find(".status").hasClass("blue") ? "blue" : "red";

        $("#display-date").text(date);
        $("#display-status").html(`<span class="status ${statusClass}">${statusText}</span>`);
        $(".info-item.seat .blue").text(seats);
        $(".info-item.fee .number").text(price);
    }

    // ==========================================
    // 2. 切換月份
    // ==========================================
    function switchMonth(tripDate) {
        $('.tourist-table table').hide();
        const $targetTable = $('.tourist-table table[trip-date="' + tripDate + '"]');
        $targetTable.show();

        const formattedDate = tripDate.replace("-", " 年 ") + " 月";
        $('.month-header .dateContent').text(formattedDate);

        // [關鍵]：切換月時，自動選定第一筆並高亮
        const $firstRow = $targetTable.find('.datemain-container').first();
        if ($firstRow.length > 0) {
            updateDetailUI($firstRow);
        }
    }

    // ==========================================
    // 3. 事件監聽 (使用事件委派)
    // ==========================================
    $('.tourist-table').on('click', '.datemain-container', function () {
        updateDetailUI(this);
    });

    $('#nextMonth, #prevMonth').click(function () {
        const $tables = $('.tourist-table table');
        const $current = $tables.filter(':visible');
        const index = $tables.index($current);
        const newIndex = $(this).attr('id') === 'nextMonth' 
            ? (index + 1) % $tables.length 
            : (index - 1 + $tables.length) % $tables.length;
        
        switchMonth($tables.eq(newIndex).attr('trip-date'));
    });

    // 初始載入
    const initialDate = $('.tourist-table table:first').attr('trip-date');
    switchMonth(initialDate);
});
// 行程列表頁 抓取日期
document.addEventListener("DOMContentLoaded", function () {

  // ==========================================
  // 0. 防止瀏覽器捲動
  // ==========================================
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  // ==========================================
  // 1. 日期格式
  // ==========================================
  function normalize(date) {
    if (!date) return "";

    return date
      .replace(/\([^)]+\)/g, "")           
      .replace(/[\(\)\uff08\uff09]/g, "")   
      .replace(/\s/g, "")                  
      .trim();                             
  }

  // ==========================================
  // 2. 
  // ==========================================
  function getActiveRows() {
    const activeTable =
      document.querySelector('.tourist-table table[style*="display: table"]') ||
      document.querySelector('.tourist-table table:not([style*="none"])');

    return activeTable
      ? activeTable.querySelectorAll(".datemain-container")
      : [];
  }

  // ==========================================
  // 3. 
  // ==========================================
  document.querySelectorAll(".datemain-container").forEach((row) => {

    const clickedElements = row.querySelectorAll(
      "[onclick*='window.location.href']"
    );

    clickedElements.forEach((el) => {
      const originalOnclick = el.getAttribute("onclick");

      if (originalOnclick && !row.hasAttribute("data-url-extracted")) {

        const match = originalOnclick.match(
          /window\.location\.href\s*=\s*['"]\.?([^'"]+)['"]/
        );

        if (match && match[1]) {
          const fullMatchUrl = match[1];
          let baseUrl = fullMatchUrl.split("?")[0];

          if (!baseUrl.startsWith(".")) {
            baseUrl = "." + baseUrl;
          }

          // 
          const urlParams = new URLSearchParams(fullMatchUrl.split("?")[1] || "");
          let tourNo = urlParams.get("tourNo") || urlParams.get("tour_no") || "";

          // 如
          if (!tourNo) {
            tourNo = row.querySelector(".tour-number, .tour-no, .product-number")?.innerText.trim() || "";
          }

          // 
          row.setAttribute("data-target-url", baseUrl);
          row.setAttribute("data-tour-no", tourNo);
          row.setAttribute("data-url-extracted", "true");

          // 
          const rawDate = row.querySelector(".departure-date")?.innerText.trim() || "";
          const cleanDate = normalize(rawDate); 

          let prefetchUrl = `${baseUrl}?date=${cleanDate}`;
          if (tourNo) {
            prefetchUrl += `&tourNo=${encodeURIComponent(tourNo)}`;
          }

          const link = document.createElement("link");
          link.rel = "prefetch";
          link.href = prefetchUrl;
          document.head.appendChild(link);
        }
      }

      //
      el.removeAttribute("onclick");
      el.style.cursor = "pointer";
    });
  });

  // ==========================================
  // 4. 同步更新右側
  // ==========================================
  function updateRow(row) {
    if (!row) return;

    // 清除畫面上所有 rows 的高亮外框
    document.querySelectorAll(".datemain-container").forEach((r) => {
      r.classList.remove("highlight-row");
    });

    // 點選或目標 row 加上高亮
    row.classList.add("highlight-row");

    // 抓取該列的各項欄位資料
    const date = row.querySelector(".departure-date")?.innerText.trim() || "";
    const seat = row.querySelector(".seats-flight")?.innerText.trim() || "";
    const statusEl = row.querySelector(".status");
    const status = statusEl?.innerText.trim() || "";

    //  class 顏色代碼
    const color =
      statusEl?.classList.contains("green")
        ? "green"
        : statusEl?.classList.contains("blue")
        ? "blue"
        : "red";

    const price = row.querySelector(".number")?.innerText.trim() || "";

    // 將資料同步渲染到右側對應的 ID 畫面上
    if (document.getElementById("display-date")) {
      document.getElementById("display-date").innerText = date;
    }

    if (document.getElementById("display-status")) {
      document.getElementById("display-status").innerHTML =
        `<span class="status ${color}">${status}</span>`;
    }

    if (document.getElementById("display-seat")) {
      document.getElementById("display-seat").innerHTML =
        `<span class="blue">${seat}</span>席`;
    }

    if (document.querySelector(".fee .number")) {
      document.querySelector(".fee .number").innerText = price;
    }
  }

  
  // 5. Row 的點擊跳轉
  
  document.querySelectorAll(".datemain-container").forEach((row) => {
    row.style.cursor = "pointer"; // 讓整行滑鼠移上去都變手指

    row.addEventListener("click", function (e) {
      // 
      if (e.target.tagName === "A" || e.target.closest("a")) {
        return;
      }

      const rawDate = this.querySelector(".departure-date")?.innerText.trim() || "";
      const cleanDate = normalize(rawDate); 

      let tourNo = this.getAttribute("data-tour-no") || "";
      if (!tourNo) {
        tourNo = this.querySelector(".tour-number, .tour-no, .product-number")?.innerText.trim() || "";
      }

      let baseUrl = this.getAttribute("data-target-url") || "./A.html";

      const currentFilename = window.location.pathname.split("/").pop() || "";
      const targetFilename = baseUrl.split("/").pop();

      // ------------------------------------------
      // 
      // ------------------------------------------
      if (currentFilename === targetFilename) {
        updateRow(this);

        this.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        let newUrl = `${window.location.pathname}?date=${cleanDate}`;
        if (tourNo) {
          newUrl += `&tourNo=${encodeURIComponent(tourNo)}`;
        }
        history.replaceState(null, "", newUrl);
        return;
      }

      // ------------------------------------------
      // 
      // ------------------------------------------
      sessionStorage.setItem("userClickedDate", "true");
      updateRow(this);

      let nextUrl = `${baseUrl}?date=${cleanDate}`;
      if (tourNo) {
        nextUrl += `&tourNo=${encodeURIComponent(tourNo)}`;
      }
      window.location.href = nextUrl;
    });
  });

  //
  // 6. 頁面載入後，「網址參數解析與自動月份表格及標題切換」
  //
  const params = new URLSearchParams(window.location.search);
  const rawTargetDate = params.get("date");
  const targetDate = rawTargetDate ? decodeURIComponent(rawTargetDate) : null; 
  const currentFilename = window.location.pathname.split("/").pop() || "";

  // 
  if (targetDate) {
    // 
    const dateMatch = targetDate.match(/(\d{4})\/(\d{1,2})/);
    if (dateMatch) {
      const year = dateMatch[1];
      const month = parseInt(dateMatch[2], 10); 
      const targetTripDate = `${year}-${month}`; 

      // 1. 尋找畫面上所有的 table[trip-date] 
      const tables = document.querySelectorAll('.tourist-table table[trip-date]');
      tables.forEach(table => {
        if (table.getAttribute('trip-date') === targetTripDate) {
          table.style.display = 'table'; // 顯示符合網址月份的表格
        } else {
          table.style.display = 'none';  // 隱藏其他月份的表格
        }
      });

      // 2. 同步更新畫面 
      const dateContentHeader = document.querySelector('.month-header .dateContent');
      if (dateContentHeader) {
        dateContentHeader.innerText = `${year} 年 ${month} 月`;
      }
    }
  }

  //
  let rows = getActiveRows();
  let targetRow = null;

  // 
  if (targetDate) {
    rows.forEach((row) => {
      const rowDate = row.querySelector(".departure-date")?.innerText.trim();
      if (rowDate && normalize(rowDate) === normalize(targetDate)) {
        targetRow = row; 
      }
    });
  }

  // 
  if (!targetRow && rows.length > 0) {
    const fileRowMap = {
      "B.html": 1,
      "C.html": 2,
      "D.html": 3,
      "E.html": 4,
      "F.html": 5,
      "Product_List.html": 6,
      "Special-Event.html": 7,
    };

    const matchedKey = Object.keys(fileRowMap).find((key) =>
      currentFilename.includes(key)
    );

    const targetIndex = matchedKey ? fileRowMap[matchedKey] : 0;
    targetRow = rows[targetIndex] || rows[0];
  }

  // ==========================================
  // 7. 畫面同步
  // ==========================================
  if (targetRow) {
    // 執行同步
    updateRow(targetRow);

    const hasDateParam = params.has("date");
    const isFromClick = sessionStorage.getItem("userClickedDate") === "true";

    const defaultRawDate = targetRow.querySelector(".departure-date")?.innerText.trim() || "";
    const defaultCleanDate = normalize(defaultRawDate); 
    
    let defaultTourNo = targetRow.getAttribute("data-tour-no") || 
                        targetRow.querySelector(".tour-number, .tour-no, .product-number")?.innerText.trim() || "";

    // 
    if (!window.location.search) {
      let autoUrl = `${window.location.pathname}?date=${defaultCleanDate}`;
      if (defaultTourNo) {
        autoUrl += `&tourNo=${encodeURIComponent(defaultTourNo)}`;
      }
      history.replaceState(null, "", autoUrl);
    }

    // 
    if (hasDateParam && !isFromClick) {
      setTimeout(() => {
        const scrollContainer = targetRow.closest(".tourist-table");
        if (scrollContainer) {
          const targetOffsetTop = targetRow.offsetTop;
          const containerHeight = scrollContainer.clientHeight;
          
          scrollContainer.scrollTop = targetOffsetTop - (containerHeight / 2) + (targetRow.clientHeight / 2);
        }

        if (defaultTourNo && !params.has("tourNo")) {
          const newUrl = `${window.location.pathname}?date=${targetDate}&tourNo=${encodeURIComponent(defaultTourNo)}`;
          history.replaceState(null, "", newUrl);
        }
      }, 100);
    }

    // 
    if (isFromClick) {
      setTimeout(() => {
        targetRow.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        
        sessionStorage.removeItem("userClickedDate");
      }, 150);
    }
  }
});
