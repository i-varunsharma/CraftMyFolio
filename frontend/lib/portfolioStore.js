import fs from 'fs';
import path from 'path';

const STORAGE_FILE = path.join(process.cwd(), 'data', 'portfolios.json');

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.dirname(STORAGE_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Load portfolios from file
const loadPortfolios = () => {
  try {
    ensureDataDir();
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading portfolios:', error);
  }
  return [];
};

// Save portfolios to file
const savePortfolios = (portfolios) => {
  try {
    ensureDataDir();
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(portfolios, null, 2));
  } catch (error) {
    console.error('Error saving portfolios:', error);
  }
};

export const getPortfolios = () => {
  return loadPortfolios();
};

export const addPortfolio = (portfolio) => {
  const portfolios = loadPortfolios();
  portfolios.unshift(portfolio);
  savePortfolios(portfolios);
  return portfolio;
};

export const getPortfolioById = (id) => {
  const portfolios = loadPortfolios();
  return portfolios.find(p => p.id == id);
};

export const updatePortfolio = (id, updates) => {
  const portfolios = loadPortfolios();
  const index = portfolios.findIndex(p => p.id == id);
  if (index !== -1) {
    portfolios[index] = { ...portfolios[index], ...updates };
    savePortfolios(portfolios);
    return portfolios[index];
  }
  return null;
};

export const deletePortfolio = (id) => {
  const portfolios = loadPortfolios();
  const index = portfolios.findIndex(p => p.id == id);
  if (index !== -1) {
    const deleted = portfolios.splice(index, 1)[0];
    savePortfolios(portfolios);
    return deleted;
  }
  return null;
};

export const savePortfolio = (portfolio) => {
  return addPortfolio(portfolio);
};