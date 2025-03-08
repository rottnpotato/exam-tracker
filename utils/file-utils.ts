import fs from 'fs';
import path from 'path';

export const downloadAndSaveCSV = async (url: string, filename: string): Promise<string> => {
  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download CSV: ${response.statusText}`);
    }

    const csvContent = await response.text();
    
    // Ensure the data directory exists
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Save the file
    const filePath = path.join(dataDir, filename);
    fs.writeFileSync(filePath, csvContent, 'utf-8');

    return csvContent;
  } catch (error) {
    console.error('Error downloading CSV:', error);
    throw error;
  }
};