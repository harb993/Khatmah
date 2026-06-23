import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'khatmas.json');

export interface Part {
  juz: number;
  assignedTo: string | null;
  assignedName: string | null;
  completed: boolean;
}

export interface Khatma {
  id: string;
  name: string;
  creatorId: string;
  creatorName: string;
  createdAt: string;
  parts: Part[];
}

function ensureDataFile(): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
  }
}

export function getKhatmas(): Khatma[] {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

export function getKhatma(id: string): Khatma | undefined {
  const khatmas = getKhatmas();
  return khatmas.find((k) => k.id === id);
}

export function saveKhatmas(khatmas: Khatma[]): void {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(khatmas, null, 2), 'utf-8');
}

export function createKhatma(name: string, creatorId: string, creatorName: string): Khatma {
  const khatmas = getKhatmas();

  const parts: Part[] = [];
  for (let i = 1; i <= 30; i++) {
    parts.push({
      juz: i,
      assignedTo: null,
      assignedName: null,
      completed: false,
    });
  }

  const khatma: Khatma = {
    id: Date.now().toString(36) + Math.random().toString(36).substring(2, 8),
    name,
    creatorId,
    creatorName,
    createdAt: new Date().toISOString(),
    parts,
  };

  khatmas.push(khatma);
  saveKhatmas(khatmas);
  return khatma;
}

export function deleteKhatma(id: string): boolean {
  const khatmas = getKhatmas();
  const index = khatmas.findIndex((k) => k.id === id);
  if (index === -1) return false;
  khatmas.splice(index, 1);
  saveKhatmas(khatmas);
  return true;
}

export function assignPart(khatmaId: string, juz: number, userId: string, userName: string): Khatma | null {
  const khatmas = getKhatmas();
  const khatma = khatmas.find((k) => k.id === khatmaId);
  if (!khatma) return null;

  const part = khatma.parts.find((p) => p.juz === juz);
  if (!part) return null;
  if (part.assignedTo && part.assignedTo !== userId) return null; // Already assigned to someone else

  part.assignedTo = userId;
  part.assignedName = userName;
  saveKhatmas(khatmas);
  return khatma;
}

export function unassignPart(khatmaId: string, juz: number, userId: string): Khatma | null {
  const khatmas = getKhatmas();
  const khatma = khatmas.find((k) => k.id === khatmaId);
  if (!khatma) return null;

  const part = khatma.parts.find((p) => p.juz === juz);
  if (!part) return null;
  if (part.assignedTo !== userId) return null; // Can only unassign yourself

  part.assignedTo = null;
  part.assignedName = null;
  part.completed = false;
  saveKhatmas(khatmas);
  return khatma;
}

export function completePart(khatmaId: string, juz: number, userId: string): Khatma | null {
  const khatmas = getKhatmas();
  const khatma = khatmas.find((k) => k.id === khatmaId);
  if (!khatma) return null;

  const part = khatma.parts.find((p) => p.juz === juz);
  if (!part) return null;
  if (part.assignedTo !== userId) return null; // Can only complete your own

  part.completed = true;
  saveKhatmas(khatmas);
  return khatma;
}
