import * as XLSX from 'xlsx';

const fileName = 'HeroLearningPlatform.xlsx';
let userData = [];

export const saveUserToExcel = (user) => {
  userData.push(user);
  const worksheet = XLSX.utils.json_to_sheet(userData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
  XLSX.writeFile(workbook, fileName);
};

export const readExcel = async () => {
  try {
    const res = await fetch(`/${fileName}`);
    const data = await res.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const users = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    userData = users;
    return users;
  } catch {
    return [];
  }
};
