/*
  MRO Lite local seed script (manual only, not used in deploy)
  Requires: npm install mssql
  Run: node seed.local.js
*/

const sql = require('mssql');

const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'YourStrong!Passw0rd',
  server: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'MroLite',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

const FIRST_NAMES = [
  'Juan', 'Carlos', 'Lucia', 'Sofia', 'Pedro', 'Maria', 'Ana', 'Jose', 'Luis', 'Valentina',
  'Diego', 'Camila', 'Javier', 'Mariana', 'Andres', 'Paula', 'Miguel', 'Laura', 'Fernando',
  'Natalia', 'Rocio', 'Gonzalo', 'Lorena', 'Bruno', 'Julieta', 'Hector', 'Agustin', 'Martin',
  'Alejandro', 'Patricia', 'Isabel', 'Raul', 'Sergio', 'Ricardo', 'Emilia', 'Nicolas',
  'Gabriel', 'Pablo', 'Luciano', 'Daniela', 'Violeta', 'Ignacio', 'Cecilia', 'Esteban',
  'Adriana', 'Matias', 'Cristina', 'Roman', 'Silvia'
];

const LAST_NAMES = [
  'Perez', 'Gomez', 'Martinez', 'Ruiz', 'Sanchez', 'Lopez', 'Garcia', 'Fernandez', 'Diaz',
  'Romero', 'Torres', 'Flores', 'Ramos', 'Herrera', 'Medina', 'Navarro', 'Vargas', 'Castro',
  'Ortega', 'Ibarra', 'Vega', 'Silva', 'Molina', 'Suarez', 'Delgado', 'Paredes', 'Morales',
  'Cabrera', 'Rojas', 'Nunez', 'Prieto', 'Aguilar', 'Mendez', 'Mendoza', 'Cardozo', 'Godoy',
  'Campos', 'Arias', 'Benitez', 'Dominguez'
];

const COMPANIES = [
  'Seaburity Solutions',
  'YPF',
  'TechOil',
  'PetroAndes',
  'AeroAndes',
  'SkyLog',
  'Iberflight',
  'AirNova',
  'LATAM',
  'Aerolineas Argentinas',
  'Flybondi',
  'JetSmart',
  'AndesAir',
  'Patagonia Wings',
  'Andes Cargo',
  'AeroSur',
  'AirPatagonia',
  'GlobalAir Tech',
  'PetroSur',
  'Energia Austral'
];

const EQUIPMENT_TASKS = [
  'Inspeccion APU',
  'Revision tren de aterrizaje',
  'Calibracion de altimetros',
  'Cambio de sensores hidraulicos',
  'Revision sistema electrico',
  'Prueba de presion hidraulica',
  'Mantenimiento de motores',
  'Inspeccion de cabina',
  'Chequeo de avionica',
  'Verificacion de frenos',
  'Reemplazo de filtros de combustible',
  'Revision de compresores',
  'Inspeccion de alas',
  'Control de sistema de oxigeno',
  'Prueba de luces de navegacion',
  'Chequeo de tren principal',
  'Revision de puertas',
  'Inspeccion de fuselaje',
  'Lubricacion de actuadores',
  'Verificacion de flaps'
];

const PLANE_MODELS = [
  'A320-214',
  'A321-231',
  'A330-200',
  'A350-900',
  'B737-800',
  'B737-900',
  'B777-300ER',
  'B787-9',
  'E190',
  'E195',
  'ATR-72',
  'CRJ-700',
  'CRJ-200'
];

const GENERAL_NOTES = [
  'Revision programada de rutina.',
  'Verificacion de checklist completada.',
  'Se requiere inspeccion visual adicional.',
  'Cambio preventivo de componentes menores.',
  'Ajuste de parametros de control realizado.'
];

const COMPLETION_NOTES = [
  'Trabajo finalizado sin observaciones.',
  'Inspeccion completada y registrada en bitacora.',
  'Mantenimiento completado y verificado por QA.',
  'Cierre conforme a procedimientos internos.'
];

const ANOMALY_NOTES = [
  'Fuga detectada en sistema hidraulico.',
  'Desgaste excesivo en componentes de freno.',
  'Lectura anomala en sensores de temperatura.',
  'Vibracion fuera de rango en motor derecho.',
  'Corrosion localizada en panel inferior.'
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickOne(list) {
  return list[randomInt(0, list.length - 1)];
}

function normalizeName(name) {
  return name.trim().toLowerCase();
}

function randomStatus() {
  const roll = Math.random();
  if (roll < 0.5) return 'Completado';
  if (roll < 0.8) return 'EnProceso';
  return 'Pendiente';
}

function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function addDays(date, days) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function addHours(date, hours) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function randomDateBetween(start, end) {
  const startMs = start.getTime();
  const endMs = end.getTime();
  const delta = endMs - startMs;
  return new Date(startMs + Math.random() * delta);
}

function randomPlane() {
  if (Math.random() < 0.6) {
    return pickOne(PLANE_MODELS);
  }

  const prefixes = ['LV', 'EC', 'CC', 'XA', 'N', 'PR'];
  const prefix = pickOne(prefixes);
  const letters = Array.from({ length: 3 }, () => String.fromCharCode(65 + randomInt(0, 25))).join('');
  return `${prefix}-${letters}`;
}

function buildJobKey(equipment, company, plane, createdAt) {
  const day = createdAt.toISOString().slice(0, 10);
  return `${equipment}|${company}|${plane}|${day}`.toLowerCase();
}

function sampleUnique(list, count) {
  const copy = list.slice();
  const result = [];
  for (let i = 0; i < count && copy.length; i += 1) {
    const index = randomInt(0, copy.length - 1);
    result.push(copy.splice(index, 1)[0]);
  }
  return result;
}

async function seedTechnicians(pool) {
  const existing = await pool.request().query('SELECT Id, Name FROM Technicians');
  const existingRecords = existing.recordset.map((row) => ({ id: row.Id, name: row.Name }));
  const existingNames = new Set(existingRecords.map((tech) => normalizeName(tech.name)));

  const minTarget = 40;
  const maxTarget = 60;
  const target = randomInt(minTarget, maxTarget);
  const existingCount = existingRecords.length;

  let toCreate = 0;
  if (existingCount >= maxTarget) {
    console.log(`[seed] Technicians already at ${existingCount}. Skipping creation.`);
  } else {
    toCreate = Math.max(0, target - existingCount);
  }

  const plannedNames = [];
  let attempts = 0;
  while (plannedNames.length < toCreate && attempts < toCreate * 10) {
    const name = `${pickOne(FIRST_NAMES)} ${pickOne(LAST_NAMES)}`;
    const key = normalizeName(name);
    if (!existingNames.has(key)) {
      existingNames.add(key);
      plannedNames.push(name);
    }
    attempts += 1;
  }

  const created = [];
  for (const name of plannedNames) {
    const result = await pool
      .request()
      .input('Name', sql.NVarChar(200), name)
      .query('INSERT INTO Technicians (Name) OUTPUT INSERTED.Id VALUES (@Name)');

    created.push({ id: result.recordset[0].Id, name });
  }

  console.log(
    `[seed] Technicians existing: ${existingCount}, created: ${created.length}, total: ${
      existingCount + created.length
    }`
  );

  return [...existingRecords, ...created];
}

function buildJobDraft(technicianIds, existingKeys) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const status = randomStatus();
    const equipment = pickOne(EQUIPMENT_TASKS);
    const company = pickOne(COMPANIES);
    const plane = randomPlane();

    let createdAt;
    let updatedAt;

    if (status === 'Completado') {
      createdAt = randomDateBetween(daysAgo(180), daysAgo(14));
      updatedAt = randomDateBetween(addDays(createdAt, 1), daysAgo(1));
    } else if (status === 'EnProceso') {
      createdAt = randomDateBetween(daysAgo(90), daysAgo(2));
      updatedAt = randomDateBetween(addHours(createdAt, 2), new Date());
    } else {
      createdAt = randomDateBetween(daysAgo(60), new Date());
      updatedAt = randomDateBetween(createdAt, new Date());
    }

    const key = buildJobKey(equipment, company, plane, createdAt);
    if (existingKeys.has(key)) {
      continue;
    }

    existingKeys.add(key);

    const anomaly = Math.random() < 0.15;
    let notes = null;

    if (status === 'Completado') {
      notes = pickOne(COMPLETION_NOTES);
    }

    if (anomaly) {
      notes = `Anomalia: ${pickOne(ANOMALY_NOTES)}`;
    }

    if (!notes && Math.random() < 0.35) {
      notes = pickOne(GENERAL_NOTES);
    }

    const assignedTechs = sampleUnique(technicianIds, randomInt(1, 3));

    return {
      equipment,
      company,
      plane,
      status,
      notes,
      anomaly,
      createdAt,
      updatedAt,
      technicianIds: assignedTechs
    };
  }

  return null;
}

async function seedJobs(pool, technicians) {
  const existingJobs = await pool
    .request()
    .query(
      'SELECT Id, Equipment, Company, Plane, Status, Notes, Anomaly, CreatedAt, UpdatedAt FROM MaintenanceJobs'
    );

  const existingCount = existingJobs.recordset.length;
  const minTarget = 150;
  const maxTarget = 250;
  const target = randomInt(minTarget, maxTarget);

  let toCreate = 0;
  if (existingCount >= maxTarget) {
    console.log(`[seed] MaintenanceJobs already at ${existingCount}. Skipping creation.`);
  } else {
    toCreate = Math.max(0, target - existingCount);
  }

  if (!toCreate) {
    return;
  }

  if (!technicians.length) {
    console.log('[seed] No technicians available. Skipping jobs.');
    return;
  }

  const technicianIds = technicians.map((tech) => tech.id);
  const existingKeys = new Set(
    existingJobs.recordset.map((row) =>
      buildJobKey(row.Equipment, row.Company, row.Plane, new Date(row.CreatedAt))
    )
  );

  const transaction = new sql.Transaction(pool);
  let createdJobs = 0;
  let createdLinks = 0;

  await transaction.begin();

  try {
    for (let i = 0; i < toCreate; i += 1) {
      const draft = buildJobDraft(technicianIds, existingKeys);
      if (!draft) {
        break;
      }

      const insertJob = new sql.Request(transaction)
        .input('Equipment', sql.NVarChar(200), draft.equipment)
        .input('Company', sql.NVarChar(200), draft.company)
        .input('Plane', sql.NVarChar(200), draft.plane)
        .input('Status', sql.NVarChar(50), draft.status)
        .input('Notes', sql.NVarChar(sql.MAX), draft.notes)
        .input('Anomaly', sql.Bit, draft.anomaly)
        .input('CreatedAt', sql.DateTime2, draft.createdAt)
        .input('UpdatedAt', sql.DateTime2, draft.updatedAt);

      const result = await insertJob.query(
        'INSERT INTO MaintenanceJobs (Equipment, Company, Plane, Status, Notes, Anomaly, CreatedAt, UpdatedAt) OUTPUT INSERTED.Id VALUES (@Equipment, @Company, @Plane, @Status, @Notes, @Anomaly, @CreatedAt, @UpdatedAt)'
      );

      const jobId = result.recordset[0].Id;
      createdJobs += 1;

      for (const techId of draft.technicianIds) {
        await new sql.Request(transaction)
          .input('MaintenanceJobId', sql.Int, jobId)
          .input('TechnicianId', sql.Int, techId)
          .query(
            'INSERT INTO MaintenanceJobTechnician (MaintenanceJobId, TechnicianId) VALUES (@MaintenanceJobId, @TechnicianId)'
          );
        createdLinks += 1;
      }
    }

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }

  console.log(
    `[seed] MaintenanceJobs existing: ${existingCount}, created: ${createdJobs}, total: ${
      existingCount + createdJobs
    }`
  );
  console.log(`[seed] Technician links created: ${createdLinks}`);
}

async function main() {
  console.log('[seed] Connecting to SQL Server...');

  const pool = await sql.connect(config);

  try {
    const technicians = await seedTechnicians(pool);
    await seedJobs(pool, technicians);
    console.log('[seed] Done.');
  } catch (error) {
    console.error('[seed] Error:', error);
    process.exitCode = 1;
  } finally {
    await sql.close();
  }
}

main().catch((error) => {
  console.error('[seed] Unhandled error:', error);
  process.exitCode = 1;
});
