const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'data.sqlite');
let db;

function ensureDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        name TEXT,
        role TEXT,
        active INTEGER
      );
      CREATE TABLE IF NOT EXISTS assessments (
        id TEXT PRIMARY KEY,
        title TEXT,
        col TEXT,
        dueIn TEXT,
        archived INTEGER
      );
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        assessmentId TEXT,
        name TEXT,
        status TEXT,
        due TEXT
      );
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        assessmentId TEXT,
        user TEXT,
        time TEXT,
        text TEXT
      );
      CREATE TABLE IF NOT EXISTS attachments (
        id TEXT PRIMARY KEY,
        assessmentId TEXT,
        name TEXT,
        created TEXT,
        modified TEXT,
        size TEXT
      );
    `);
  }
}

function saveAll(snapshot) {
  ensureDb();
  const tx = db.transaction((snap) => {
    db.exec('DELETE FROM users; DELETE FROM assessments; DELETE FROM tasks; DELETE FROM messages; DELETE FROM attachments;');
    const upUser = db.prepare('INSERT INTO users (id,email,name,role,active) VALUES (?,?,?,?,?)');
    for (const u of snap.users || []) {
      upUser.run(u.id, u.email, u.name, u.role, u.active ? 1 : 0);
    }
    const upAsm = db.prepare('INSERT INTO assessments (id,title,col,dueIn,archived) VALUES (?,?,?,?,?)');
    for (const a of snap.assessments || []) {
      upAsm.run(a.id, a.title, a.col, a.dueIn, a.archived ? 1 : 0);
    }
    const upTask = db.prepare('INSERT INTO tasks (id,assessmentId,name,status,due) VALUES (?,?,?,?,?)');
    for (const [aid, list] of Object.entries(snap.tasksByAssessment || {})) {
      for (const t of list) { upTask.run(t.id, aid, t.name, t.status, t.due); }
    }
    const upMsg = db.prepare('INSERT INTO messages (id,assessmentId,user,time,text) VALUES (?,?,?,?,?)');
    for (const [aid, list] of Object.entries(snap.messagesByAssessment || {})) {
      for (const m of list) { upMsg.run(m.id, aid, m.user, m.time, m.text); }
    }
    const upAtt = db.prepare('INSERT INTO attachments (id,assessmentId,name,created,modified,size) VALUES (?,?,?,?,?,?)');
    for (const [aid, list] of Object.entries(snap.attachmentsByAssessment || {})) {
      for (const f of list) { upAtt.run(f.id, aid, f.name, f.created, f.modified, f.size); }
    }
  });
  tx(snapshot);
}

function exportAll() {
  ensureDb();
  const out = { users: [], assessments: [], tasksByAssessment: {}, messagesByAssessment: {}, attachmentsByAssessment: {} };
  out.users = db.prepare('SELECT id,email,name,role,active FROM users').all().map(u => ({...u, active: !!u.active}));
  out.assessments = db.prepare('SELECT id,title,col,dueIn,archived FROM assessments').all().map(a => ({...a, archived: !!a.archived}));
  for (const row of db.prepare('SELECT * FROM tasks').iterate()) {
    out.tasksByAssessment[row.assessmentId] ||= []; out.tasksByAssessment[row.assessmentId].push({ id: row.id, name: row.name, status: row.status, due: row.due });
  }
  for (const row of db.prepare('SELECT * FROM messages').iterate()) {
    out.messagesByAssessment[row.assessmentId] ||= []; out.messagesByAssessment[row.assessmentId].push({ id: row.id, user: row.user, time: row.time, text: row.text });
  }
  for (const row of db.prepare('SELECT * FROM attachments').iterate()) {
    out.attachmentsByAssessment[row.assessmentId] ||= []; out.attachmentsByAssessment[row.assessmentId].push({ id: row.id, name: row.name, created: row.created, modified: row.modified, size: row.size });
  }
  return out;
}

module.exports = { saveAll, exportAll };
