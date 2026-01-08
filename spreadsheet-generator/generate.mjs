import ExcelJS from 'exceljs';

const OUT_PATH = new URL('../Beginner_Productivity_System.xlsx', import.meta.url).pathname;

function setCols(ws, widths) {
  ws.columns = widths.map((w) => ({ width: w }));
}

function styleHeader(cell) {
  cell.font = { bold: true, color: { argb: 'FF0F172A' } };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
  cell.border = {
    top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
  };
  cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
}

function styleNote(cell) {
  cell.font = { italic: true, color: { argb: 'FF475569' } };
}

function addDataValidationList(ws, range, values) {
  ws.dataValidations.add(range, {
    type: 'list',
    allowBlank: true,
    formulae: [`"${values.join(',')}"`],
  });
}

function addr(col, row) {
  return `${col}${row}`;
}

function colName(n) {
  // 1 -> A
  let s = '';
  let x = n;
  while (x > 0) {
    const r = (x - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    x = Math.floor((x - 1) / 26);
  }
  return s;
}

function buildHabitTracker(wb) {
  const ws = wb.addWorksheet('HABIT TRACKER', { views: [{ state: 'frozen', ySplit: 5, xSplit: 1 }] });

  // Columns A..BM (65 columns) to fit helpers; keep readable widths
  const widths = [28]; // A
  for (let i = 0; i < 31; i += 1) widths.push(5.5); // B..AF (30 days + Month% + Streak)
  for (let i = 0; i < 30; i += 1) widths.push(3.2); // AH..BM helpers
  setCols(ws, widths);

  ws.getCell('A1').value = 'Habit Start Monday (date)';
  ws.getCell('B1').value = ''; // user enters
  ws.getCell('A2').value = 'As-of day # (1–30)';
  ws.getCell('B2').value = 30;
  ws.getCell('D1').value = 'Tip: After importing to Google Sheets, select the habit grid and use Insert → Checkbox.';
  styleNote(ws.getCell('D1'));

  // Week labels row 3
  const weekStarts = ['B', 'G', 'L', 'Q', 'V', 'AA'];
  weekStarts.forEach((c, i) => {
    ws.getCell(`${c}3`).value = `Week ${i + 1}`;
    styleHeader(ws.getCell(`${c}3`));
  });

  // Day labels row 4 (Mon-Fri repeated)
  ws.getCell('A4').value = 'Habit';
  styleHeader(ws.getCell('A4'));
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  for (let week = 0; week < 6; week += 1) {
    for (let d = 0; d < 5; d += 1) {
      const col = colName(2 + week * 5 + d); // B=2
      ws.getCell(`${col}4`).value = dayLabels[d];
      styleHeader(ws.getCell(`${col}4`));
    }
  }

  // Date row 5 (B5..AE5)
  for (let week = 0; week < 6; week += 1) {
    for (let d = 0; d < 5; d += 1) {
      const col = colName(2 + week * 5 + d);
      const cell = ws.getCell(`${col}5`);
      if (week === 0 && d === 0) cell.value = { formula: '=$B$1' };
      else if (d === 0) {
        const prevWeekStartCol = colName(2 + (week - 1) * 5);
        cell.value = { formula: `=${prevWeekStartCol}5+7` };
      } else {
        const prevCol = colName(2 + week * 5 + d - 1);
        cell.value = { formula: `=${prevCol}5+1` };
      }
      cell.numFmt = 'm/d';
      styleHeader(cell);
    }
  }

  // Summary headers at AF/AG (row 5 aligns with dates)
  ws.getCell('AF5').value = 'Month % (to-date)';
  ws.getCell('AG5').value = 'Current streak';
  styleHeader(ws.getCell('AF5'));
  styleHeader(ws.getCell('AG5'));

  // Default 15 habit names
  const defaults = [
    'Wake up on time',
    'Plan the day (5 min)',
    'Deep work (30+ min)',
    'Exercise',
    'Healthy meal',
    'Drink water',
    'Read (10 min)',
    'Learn (15 min)',
    'Clean/tidy (5 min)',
    'Walk outside',
    'No social media before noon',
    'Journal (3 lines)',
    'Connect with someone',
    'Sleep routine',
    'Gratitude',
  ];

  for (let i = 0; i < 15; i += 1) {
    const r = 6 + i;
    ws.getCell(`A${r}`).value = defaults[i];

    // Month % to-date (AF)
    ws.getCell(`AF${r}`).value = {
      formula:
        `=IF($A${r}="","",IF(COUNTIF($B${r}:$AE${r},TRUE)+COUNTIF($B${r}:$AE${r},FALSE)=0,"",SUM($B${r}:$AE${r})/(COUNTIF($B${r}:$AE${r},TRUE)+COUNTIF($B${r}:$AE${r},FALSE))))`,
    };
    ws.getCell(`AF${r}`).numFmt = '0%';

    // Streak helper AH..BM: day1 is B, day30 is AE
    const helperStartColNum = 34; // AH
    for (let day = 0; day < 30; day += 1) {
      const dayCol = colName(2 + day); // B..AE
      const helperCol = colName(helperStartColNum + day); // AH..BM
      const c = ws.getCell(`${helperCol}${r}`);
      if (day === 0) {
        c.value = { formula: `=IF($A${r}="","",IF(${dayCol}${r}=TRUE,1,0))` };
      } else {
        const prevHelperCol = colName(helperStartColNum + day - 1);
        c.value = { formula: `=IF($A${r}="","",IF(${dayCol}${r}=TRUE,${prevHelperCol}${r}+1,0))` };
      }
      c.font = { color: { argb: 'FF94A3B8' } };
    }

    // Current streak AG uses As-of day B2, via SUM(IF(...)) (basic functions only)
    const helperCols = Array.from({ length: 30 }, (_, d) => colName(34 + d)); // AH..BM
    const parts = helperCols.map((hc, idx) => `IF($B$2=${idx + 1},${hc}${r},0)`);
    ws.getCell(`AG${r}`).value = { formula: `=IF($A${r}="","",SUM(${parts.join(',')}))` };
  }

  // Daily completion % row (A22 label, B22..AE22 formulas)
  ws.getCell('A22').value = 'Daily completion %';
  styleHeader(ws.getCell('A22'));
  for (let day = 0; day < 30; day += 1) {
    const col = colName(2 + day); // B..AE
    const cell = ws.getCell(`${col}22`);
    cell.value = {
      formula: `=IF(COUNTIF($A$6:$A$20,"<>")=0,"",COUNTIF(${col}$6:${col}$20,TRUE)/COUNTIF($A$6:$A$20,"<>"))`,
    };
    cell.numFmt = '0%';
    styleHeader(cell);
  }

  // Hide helper columns AH..BM
  for (let c = 34; c <= 65; c += 1) {
    ws.getColumn(c).hidden = true;
  }

  // Light borders around the grid area
  for (let r = 6; r <= 20; r += 1) {
    for (let c = 1; c <= 33; c += 1) {
      const cell = ws.getCell(r, c);
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
      if (c >= 2 && c <= 31) cell.alignment = { horizontal: 'center', vertical: 'middle' };
    }
  }

  // Notes
  ws.getCell('A24').value = 'Notes';
  ws.getCell('A25').value = '1) Enter a Monday date in B1. 2) Set as-of day # in B2 (1–30). 3) Use checkboxes in Google Sheets.';
  styleNote(ws.getCell('A25'));
}

function buildTaskTracker(wb) {
  const ws = wb.addWorksheet('TASK & WORK TRACKER', { views: [{ state: 'frozen', ySplit: 1 }] });
  setCols(ws, [30, 14, 12, 14, 16, 12, 12, 14, 16, 18, 18]);

  const headers = ['Task', 'Category', 'Priority', 'Status', 'Planned Week Start (Mon)', 'Estimated (hrs)', 'Actual (hrs)', 'Time Efficiency', 'Done Week Start', '', ''];
  headers.forEach((h, i) => {
    const cell = ws.getCell(1, i + 1);
    cell.value = h;
    styleHeader(cell);
  });

  // Summary cells
  ws.getCell('J1').value = 'Completion %';
  ws.getCell('K1').value = 'Avg Efficiency';
  styleHeader(ws.getCell('J1'));
  styleHeader(ws.getCell('K1'));

  ws.getCell('J2').value = { formula: '=IF(COUNTIF($A$2:$A$200,"<>")=0,"",COUNTIF($D$2:$D$200,"Done")/COUNTIF($A$2:$A$200,"<>"))' };
  ws.getCell('J2').numFmt = '0%';
  ws.getCell('K2').value = { formula: '=IF(COUNTIF($H$2:$H$200,">0")=0,"",AVERAGE($H$2:$H$200))' };
  ws.getCell('K2').numFmt = '0%';

  // Data validations for dropdown columns
  addDataValidationList(ws, 'B2:B200', ['Work', 'Personal', 'Learning']);
  addDataValidationList(ws, 'C2:C200', ['High', 'Medium', 'Low']);
  addDataValidationList(ws, 'D2:D200', ['To Do', 'In Progress', 'Done']);

  for (let r = 2; r <= 200; r += 1) {
    // Actual hours from time log
    ws.getCell(`G${r}`).value = { formula: `=IF(A${r}="","",SUMIF('TIME LOG'!$B:$B,A${r},'TIME LOG'!$C:$C))` };
    // Efficiency min(1, est/actual)
    ws.getCell(`H${r}`).value = { formula: `=IF(A${r}="","",IF(G${r}=0,"",IF(F${r}/G${r}>1,1,F${r}/G${r})))` };
    ws.getCell(`H${r}`).numFmt = '0%';
    // Done week start helper
    ws.getCell(`I${r}`).value = { formula: `=IF(D${r}="Done",E${r},"")` };
  }
}

function buildTimeLog(wb) {
  const ws = wb.addWorksheet('TIME LOG', { views: [{ state: 'frozen', ySplit: 1 }] });
  setCols(ws, [14, 34, 14]);
  ['Date', 'Task', 'Time spent (hrs)'].forEach((h, i) => {
    const cell = ws.getCell(1, i + 1);
    cell.value = h;
    styleHeader(cell);
  });
  ws.getCell('E1').value = 'Tip: In Google Sheets, set column B to a dropdown from TASK & WORK TRACKER!A2:A200.';
  styleNote(ws.getCell('E1'));
}

function buildGoals(wb) {
  // Excel sheet names cannot contain "/" so we use an Excel-safe name.
  // The on-sheet headers still say "GOALS / OKRs".
  const ws = wb.addWorksheet('GOALS - OKRs', { views: [{ state: 'frozen', ySplit: 1 }] });
  setCols(ws, [22, 40, 10, 10, 10, 12, 14]);
  ['Goal', 'Objective', 'KR1 (%)', 'KR2 (%)', 'KR3 (%)', 'Progress %', 'Status'].forEach((h, i) => {
    const cell = ws.getCell(1, i + 1);
    cell.value = h;
    styleHeader(cell);
  });

  for (let r = 2; r <= 50; r += 1) {
    ws.getCell(`F${r}`).value = { formula: `=IF(A${r}="","",AVERAGE(C${r}:E${r}))` };
    ws.getCell(`F${r}`).numFmt = '0%';
    ws.getCell(`G${r}`).value = { formula: `=IF(F${r}="","",IF(F${r}>=1,"Completed",IF(F${r}>=0.7,"On Track","At Risk")))` };
  }
}

function buildDashboard(wb) {
  const ws = wb.addWorksheet('WEEKLY & MONTHLY DASHBOARD', { views: [{ state: 'frozen', ySplit: 4 }] });
  setCols(ws, [18, 16, 16, 16, 16, 18]);

  ws.getCell('A1').value = 'View Start (Monday)';
  ws.getCell('B1').value = { formula: "='HABIT TRACKER'!$B$1" };
  ws.getCell('A2').value = 'As-of day #';
  ws.getCell('B2').value = { formula: "='HABIT TRACKER'!$B$2" };
  styleHeader(ws.getCell('A1'));
  styleHeader(ws.getCell('B1'));
  styleHeader(ws.getCell('A2'));
  styleHeader(ws.getCell('B2'));

  ['Week Start (Mon)', 'Habit %', 'Tasks Planned', 'Tasks Done (planned)', 'Productive Hours'].forEach((h, i) => {
    const cell = ws.getCell(4, i + 1);
    cell.value = h;
    styleHeader(cell);
  });

  // Week start dates (A5..A10)
  for (let w = 0; w < 6; w += 1) {
    const r = 5 + w;
    ws.getCell(`A${r}`).value = w === 0 ? { formula: '=$B$1' } : { formula: `=A${r - 1}+7` };
    ws.getCell(`A${r}`).numFmt = 'm/d';
  }

  // Habit weekly % from HABIT TRACKER daily completion row (B22..AE22)
  const habitRanges = ['B22:F22', 'G22:K22', 'L22:P22', 'Q22:U22', 'V22:Z22', 'AA22:AE22'];
  habitRanges.forEach((rng, i) => {
    const r = 5 + i;
    ws.getCell(`B${r}`).value = { formula: `=IF(COUNTIF('HABIT TRACKER'!${rng},"<>")=0,"",AVERAGE('HABIT TRACKER'!${rng}))` };
    ws.getCell(`B${r}`).numFmt = '0%';
  });

  // Tasks planned/done by week start
  for (let w = 0; w < 6; w += 1) {
    const r = 5 + w;
    ws.getCell(`C${r}`).value = { formula: `=COUNTIF('TASK & WORK TRACKER'!$E$2:$E$200,$A${r})` };
    ws.getCell(`D${r}`).value = { formula: `=COUNTIF('TASK & WORK TRACKER'!$I$2:$I$200,$A${r})` };
    ws.getCell(`E${r}`).value = {
      formula:
        `=SUMIF('TIME LOG'!$A:$A,">="&$A${r},'TIME LOG'!$C:$C)-SUMIF('TIME LOG'!$A:$A,">="&($A${r}+5),'TIME LOG'!$C:$C)`,
    };
  }

  // 30-day summary block
  ws.getCell('A12').value = '30-Day Habit % (to-date)';
  ws.getCell('B12').value = { formula: `=IF(COUNTIF('HABIT TRACKER'!$B$22:$AE$22,"<>")=0,"",AVERAGE('HABIT TRACKER'!$B$22:$AE$22))` };
  ws.getCell('B12').numFmt = '0%';

  ws.getCell('A13').value = 'Tasks Planned (30 days)';
  ws.getCell('B13').value = { formula: '=SUM($C$5:$C$10)' };
  ws.getCell('A14').value = 'Tasks Done (planned, 30 days)';
  ws.getCell('B14').value = { formula: '=SUM($D$5:$D$10)' };
  ws.getCell('A15').value = 'Productive Hours (30 days)';
  ws.getCell('B15').value = { formula: '=SUM($E$5:$E$10)' };
  ws.getCell('A16').value = 'Goal Progress %';
  ws.getCell('B16').value = { formula: `=IF(COUNTIF('GOALS - OKRs'!$A$2:$A$50,"<>")=0,"",AVERAGE('GOALS - OKRs'!$F$2:$F$50))` };
  ws.getCell('B16').numFmt = '0%';

  for (const a of ['A12', 'A13', 'A14', 'A15', 'A16']) styleHeader(ws.getCell(a));
  for (const b of ['B12', 'B13', 'B14', 'B15', 'B16']) styleHeader(ws.getCell(b));
}

function buildScore(wb) {
  const ws = wb.addWorksheet('PRODUCTIVITY SCORE', { views: [{ state: 'frozen', ySplit: 1 }] });
  setCols(ws, [30, 16, 16]);
  ws.getCell('A1').value = 'Component';
  ws.getCell('B1').value = 'Score (0–100)';
  styleHeader(ws.getCell('A1'));
  styleHeader(ws.getCell('B1'));

  ws.getCell('A2').value = 'Habits (40%)';
  ws.getCell('B2').value = { formula: "='WEEKLY & MONTHLY DASHBOARD'!$B$12*100" };

  ws.getCell('A3').value = 'Tasks (30%)';
  ws.getCell('B3').value = { formula: "='TASK & WORK TRACKER'!$J$2*100" };

  ws.getCell('A4').value = 'Time efficiency (20%)';
  ws.getCell('B4').value = { formula: "='TASK & WORK TRACKER'!$K$2*100" };

  ws.getCell('A5').value = 'Goals (10%)';
  ws.getCell('B5').value = { formula: "='WEEKLY & MONTHLY DASHBOARD'!$B$16*100" };

  ws.getCell('A7').value = 'Productivity Score (0–100)';
  ws.getCell('B7').value = { formula: '=IF(B2="","",IF(0.4*B2+0.3*B3+0.2*B4+0.1*B5>100,100,0.4*B2+0.3*B3+0.2*B4+0.1*B5))' };

  ws.getCell('A9').value = 'Plain-English formula';
  ws.getCell('A10').value =
    'Score = 40% habits + 30% tasks done + 20% time efficiency + 10% goal progress. Each part is converted to 0–100.';
  styleNote(ws.getCell('A10'));
}

async function main() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Beginner Productivity System Generator';
  wb.created = new Date();

  buildHabitTracker(wb);
  buildTaskTracker(wb);
  buildTimeLog(wb);
  buildGoals(wb);
  buildDashboard(wb);
  buildScore(wb);

  await wb.xlsx.writeFile(OUT_PATH);
  // eslint-disable-next-line no-console
  console.log(`Wrote: ${OUT_PATH}`);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});

