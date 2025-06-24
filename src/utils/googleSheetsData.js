// src/utils/googleSheetsData.js

const SPREADSHEET_ID = "1IpYWDgvItVLCBhUa3F3fy7y-u5oUxgafA-ycOLRqOxo"; // Ganti dengan ID spreadsheet Anda
// For client-side code, set your API key directly or use a build tool to inject it
const API_KEY = "AIzaSyAZ1aJVdOVCv4Of60ZwPRsabQsgLaBxzQU"; // Replace with your actual API key or use environment injection

// Fungsi untuk mengambil data dari Google Sheets
export const fetchSheetData = async (sheetName = "Sheet1", range = "A:Z") => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${sheetName}!${range}?key=${API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }
    const data = await response.json();
    const rows = data.values;

    if (!rows || rows.length === 0) {
      return []; // Return empty array if no data
    }

    // Mengambil header (baris pertama)
    const headers = rows[0];
    // Mengubah setiap baris data menjadi objek menggunakan header sebagai kunci
    const jsonData = rows.slice(1).map((row) => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });

    return jsonData;
  } catch (error) {
    console.error("Failed to fetch data from Google Sheets:", error);
    return [];
  }
};
