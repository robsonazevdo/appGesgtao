import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('barbearia1.db');

// ==================== HELPERS ====================
const executeQuery = async (sql: string, params: any[] = []): Promise<any> => {
  try {
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      const result = await db.getAllAsync(sql, params);
      return result;
    } else {
      const result = await db.runAsync(sql, params);
      return { insertId: result.lastInsertRowId, changes: result.changes };
    }
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};

const selectQuery = async (sql: string, params: any[] = []): Promise<any[]> => {
  try {
    return await db.getAllAsync(sql, params);
  } catch (error) {
    console.error('Select error:', error);
    return [];
  }
};

const selectOneQuery = async (sql: string, params: any[] = []): Promise<any | null> => {
  try {
    const results = await db.getAllAsync(sql, params);
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('Select one error:', error);
    return null;
  }
};


// ==================== LOAD INITIAL DATA ====================
export const loadInitialData = async (): Promise<void> => {
  try {
    const barbersCount = await selectQuery('SELECT COUNT(*) as count FROM barbers');
    if (barbersCount.length > 0 && barbersCount[0].count > 0) {
      console.log('Dados já existem');
      return;
    }
        // Criar um usuário padrão se não existir
    const usersCount = await selectQuery('SELECT COUNT(*) as count FROM users');
    if (usersCount.length === 0 || usersCount[0].count === 0) {
      console.log('Criando usuário padrão...');
      
      // Criar usuário admin padrão
      await executeQuery(
        `INSERT INTO users (name, email, password, avatar, token) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          'Admin', 
          'admin@email.com', 
          '123456', // Senha simples para teste
          'https://i.pravatar.cc/150?u=admin@email.com',
          null
        ]
      );
      
      console.log('Usuário padrão criado: admin@email.com / 123456');
    }
    
    console.log('Dados iniciais carregados com sucesso!');
  } catch (error) {
    console.error('Erro ao carregar dados iniciais:', error);
  }
};
    
export const migrateDatabase = async (): Promise<void> => {
  try {
    // Verificar se a tabela appointments existe antes de tentar alterar
    const tables = await db.getAllAsync(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='appointments'"
    );
    
    if (tables.length > 0) {
      const appointmentsTableInfo = await db.getAllAsync('PRAGMA table_info(appointments)');
      const hasUserEmail = appointmentsTableInfo.some((col: any) => col.name === 'user_email');
      
      if (!hasUserEmail) {
        console.log('Adicionando coluna user_email na tabela appointments...');
        await db.execAsync('ALTER TABLE appointments ADD COLUMN user_email TEXT');
      }
      
      const hasDuration = appointmentsTableInfo.some((col: any) => col.name === 'duration');
      if (!hasDuration) {
        console.log('Adicionando coluna duration na tabela appointments...');
        await db.execAsync('ALTER TABLE appointments ADD COLUMN duration INTEGER DEFAULT 30');
      }
    }
    
    // Verificar se a tabela users existe
    const usersTables = await db.getAllAsync(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='users'"
    );
    
    if (usersTables.length > 0) {
      const usersTableInfo = await db.getAllAsync('PRAGMA table_info(users)');
      const hasCreatedAt = usersTableInfo.some((col: any) => col.name === 'created_at');
      
      if (!hasCreatedAt) {
        console.log('Adicionando coluna created_at na tabela users...');
        await db.execAsync('ALTER TABLE users ADD COLUMN created_at TEXT');
      }
    }
    
    console.log('Migração concluída');
  } catch (error) {
    console.error('Erro na migração:', error);
  }
};

export const migrateCashflowTable = async () => {
  try {
    // Verificar se a coluna payment_method existe
    const tableInfo = await db.getAllAsync('PRAGMA table_info(cashflow)');
    const hasPaymentMethod = tableInfo.some((col: any) => col.name === 'payment_method');
    
    if (!hasPaymentMethod) {
      console.log('➕ Adicionando coluna payment_method na tabela cashflow...');
      await db.execAsync('ALTER TABLE cashflow ADD COLUMN payment_method TEXT');
      console.log('✅ Coluna payment_method adicionada com sucesso');
    }
  } catch (error) {
    console.error('Erro ao migrar cashflow:', error);
  }
};


// Chame no initDatabase
export const initDatabase = async (): Promise<void> => {
  try {
    // 1. Primeiro, criar tabelas sem dependências (FOREIGN KEYS)
    const tables = [
      // Tabelas independentes (sem FOREIGN KEY)
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        avatar TEXT,
        token TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS barbers (
        id INTEGER PRIMARY KEY,
        name TEXT,
        avatar TEXT,
        stars REAL,
        lat REAL,
        lng REAL,
        loc TEXT
      )`,
      
      `CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      )`,
      
      `CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        phone TEXT,
        email TEXT UNIQUE,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        price REAL NOT NULL,
        cost REAL,
        unit TEXT,
        description TEXT
      )`,
      
      // Tabelas com dependências (FOREIGN KEY)
      `CREATE TABLE IF NOT EXISTS photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        barber_id INTEGER,
        url TEXT,
        FOREIGN KEY(barber_id) REFERENCES barbers(id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS testimonials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        barber_id INTEGER,
        name TEXT,
        rate INTEGER,
        body TEXT,
        FOREIGN KEY(barber_id) REFERENCES barbers(id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS barber_services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        barber_id INTEGER NOT NULL,
        service_id INTEGER NOT NULL,
        price REAL NOT NULL,
        duration INTEGER NOT NULL,
        FOREIGN KEY(barber_id) REFERENCES barbers(id),
        FOREIGN KEY(service_id) REFERENCES services(id),
        UNIQUE(barber_id, service_id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_email TEXT NOT NULL,
        barber_id INTEGER NOT NULL,
        FOREIGN KEY(user_email) REFERENCES users(email),
        FOREIGN KEY(barber_id) REFERENCES barbers(id),
        UNIQUE(user_email, barber_id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS barber_custom_hours (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        barber_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        active INTEGER DEFAULT 0,
        updated_at TEXT,
        FOREIGN KEY (barber_id) REFERENCES barbers(id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER NOT NULL,
        barber_id INTEGER NOT NULL,
        service_id INTEGER NOT NULL,
        datetime TEXT NOT NULL,
        user_email TEXT,
        duration INTEGER DEFAULT 30,
        status TEXT DEFAULT 'scheduled',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(barber_id) REFERENCES barbers(id),
        FOREIGN KEY(client_id) REFERENCES clients(id),
        FOREIGN KEY(service_id) REFERENCES services(id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER NOT NULL,
        barber_id INTEGER,
        opened_at TEXT DEFAULT CURRENT_TIMESTAMP,
        order_number TEXT,
        status TEXT DEFAULT 'aberta',
        total REAL,
        discount REAL DEFAULT 0,
        payment_method TEXT,
        total_final REAL,
        FOREIGN KEY(client_id) REFERENCES clients(id),
        FOREIGN KEY(barber_id) REFERENCES barbers(id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        service_id INTEGER NOT NULL,
        qtd INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY(order_id) REFERENCES orders(id),
        FOREIGN KEY(service_id) REFERENCES services(id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS cashflow (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        barber_id INTEGER,
        type TEXT CHECK(type IN ('entrada', 'saida')),
        description TEXT,
        amount REAL,
        datetime TEXT,
        FOREIGN KEY(barber_id) REFERENCES barbers(id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS stock_control (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        type TEXT CHECK(type IN ('entrada', 'saida')) NOT NULL,
        quantity REAL NOT NULL,
        description TEXT,
        datetime TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(product_id) REFERENCES products(id)
      )`,

      `CREATE TABLE IF NOT EXISTS packages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        duration INTEGER, -- minutos
        expiration_date TEXT
      )`
    
    ];
    
    // Executar cada CREATE TABLE separadamente
    for (const tableSql of tables) {
      try {
        await db.execAsync(tableSql);
        
      } catch (error) {
        console.error('Error creating table:', error);
      }
    }
    
    // Executar migrações apenas se as tabelas existirem
    await migrateDatabase();
    await migrateCashflowTable();
    console.log('Database initialized');
  } catch (error) {
    console.error('Erro no initDatabase:', error);
  }
};
  

    
  

// ==================== API ====================
const Api = {
  // ========== AUTH ==========
// Na API, método signIn
signIn: async (email: string, password: string) => {
  try {
    const user = await selectOneQuery(
      'SELECT * FROM users WHERE email = ? AND password = ?',
      [email, password]
    );
    
    if (!user) {
      return { token: null, error: "E-mail e/ou senha errados!" };
    }
    
    const token = `token_${Date.now()}_${user.id}`;
    await executeQuery('UPDATE users SET token = ? WHERE id = ?', [token, user.id]);
    
    // Salvar no AsyncStorage (feito na tela, mas vamos retornar o email)
    return { 
      token: token,
      email: user.email,  // <-- RETORNAR O EMAIL
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || ''
      }
    };
  } catch (error) {
    console.error('Erro no signIn:', error);
    return { token: null, error: "Erro ao fazer login" };
  }
},

signUp: async (name: string, email: string, password: string) => {
  try {
    // Verificar se o email já está em uso
    const existingUser = await selectOneQuery('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return { token: null, error: "Este email já está cadastrado" };
    }
    
    // Criar avatar padrão
    const avatar = `https://i.pravatar.cc/150?u=${email}`;
    
    // Inserir novo usuário
    const result = await executeQuery(
      'INSERT INTO users (name, email, password, avatar, created_at) VALUES (?, ?, ?, ?, datetime("now"))',
      [name, email, password, avatar]
    );
    
    // Gerar token
    const token = `token_${Date.now()}_${result.insertId}`;
    await executeQuery('UPDATE users SET token = ? WHERE id = ?', [token, result.insertId]);
    
    return { 
      token: token,
      data: {
        id: result.insertId,
        name: name,
        email: email,
        avatar: avatar
      }
    };
  } catch (error: any) {
    console.error('Erro no signUp:', error);
    
    if (error.message?.includes('UNIQUE constraint failed')) {
      return { token: null, error: "Email já está em uso" };
    }
    
    return { token: null, error: "Erro ao criar conta" };
  }
},

  checkToken: async (token: string) => {
    const user = await selectOneQuery('SELECT * FROM users WHERE token = ?', [token]);
    if (user) return { token: user.token, data: { avatar: user.avatar || '', name: user.name, email: user.email } };
    return { error: 'Token inválido' };
  },

logout: async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    
    if (token) {
      await executeQuery('UPDATE users SET token = NULL WHERE token = ?', [token]);
    }
    
    // Limpar AsyncStorage
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('userEmail');
    await AsyncStorage.removeItem('userName');
    
    return { success: true };
  } catch (error) {
    console.error('Erro no logout:', error);
    return { success: false, error: "Erro ao fazer logout" };
  }
},

  // ========== BARBERS ==========
  createBarber: async (data: { 
  name: string; 
  avatar?: string; 
  stars?: number; 
  lat?: number; 
  lng?: number; 
  loc?: string;
  phone?: string;
  email?: string;
  description?: string;

  
}) => {
  try {
    if (!data.name || data.name.trim() === '') {
      return { success: false, error: "Nome do barbeiro é obrigatório" };
    }
    
    const existing = await selectOneQuery(
      'SELECT id FROM barbers WHERE name = ?', 
      [data.name.trim()]
    );
    
    if (existing) {
      return { success: false, error: "Já existe um barbeiro com este nome" };
    }
    
    const lastBarber = await selectOneQuery('SELECT MAX(id) as max_id FROM barbers');
    const newId = (lastBarber?.max_id || 0) + 1;
    
    // Se você tiver uma tabela de usuários para barbeiros
    if (data.email) {
      // Verificar se o email já está em uso
      const existingUser = await selectOneQuery(
        'SELECT id FROM users WHERE email = ?', 
        [data.email]
      );
      
      if (!existingUser) {
        // Criar usuário para o barbeiro
        const tempPassword = Math.random().toString(36).substring(2, 10);
        await executeQuery(
          'INSERT INTO users (name, email, password, avatar) VALUES (?, ?, ?, ?)',
          [data.name.trim(), data.email, tempPassword, data.avatar || `https://i.pravatar.cc/150?img=${newId}`]
        );
      }
    }
    
    await executeQuery(
      `INSERT INTO barbers (id, name, avatar, stars, lat, lng, loc) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        newId,
        data.name.trim(),
        data.avatar || `https://i.pravatar.cc/150?img=${newId}`,
        data.stars || 0,
        data.lat || null,
        data.lng || null,
        data.loc || null
      ]
    );
    
    return { 
      success: true, 
      id: newId,
      barber: {
        id: newId,
        name: data.name.trim(),
        avatar: data.avatar || `https://i.pravatar.cc/150?img=${newId}`,
        stars: data.stars || 0,
        lat: data.lat || null,
        lng: data.lng || null,
        loc: data.loc || null
      }
    };
  } catch (error: any) {
    console.error('Erro no createBarber:', error);
    return { success: false, error: "Erro ao criar barbeiro" };
  }
},

updateBarber: async (data: { 
  id: number; 
  name: string; 
  avatar?: string; 
  stars?: number; 
  lat?: number; 
  lng?: number; 
  loc?: string 
}) => {
  try {
    if (!data.name || data.name.trim() === '') {
      return { success: false, error: "Nome do barbeiro é obrigatório" };
    }
    
    const existing = await selectOneQuery('SELECT id FROM barbers WHERE id = ?', [data.id]);
    if (!existing) {
      return { success: false, error: "Barbeiro não encontrado" };
    }
    
    await executeQuery(
      `UPDATE barbers 
       SET name = ?, avatar = ?, stars = ?, lat = ?, lng = ?, loc = ? 
       WHERE id = ?`,
      [
        data.name.trim(),
        data.avatar || null,
        data.stars || 0,
        data.lat || null,
        data.lng || null,
        data.loc || null,
        data.id
      ]
    );
    
    return { success: true };
  } catch (error) {
    console.error('Erro no updateBarber:', error);
    return { success: false, error: "Erro ao atualizar barbeiro" };
  }
},


saveSchedule: async (data: any) => {
  try {
    const { barber_id, week } = data;
    
    // Validações
    if (!barber_id) {
      return { success: false, error: "ID do barbeiro é obrigatório" };
    }
    if (!week || !Array.isArray(week)) {
      return { success: false, error: "Dados da semana são obrigatórios" };
    }
    
    // Verificar se o barbeiro existe
    const barber = await selectOneQuery('SELECT id FROM barbers WHERE id = ?', [barber_id]);
    if (!barber) {
      return { success: false, error: "Barbeiro não encontrado" };
    }
    
    // Iniciar transação
    await executeQuery('BEGIN TRANSACTION');
    
    try {
      // Apagar horários anteriores do barbeiro
      await executeQuery(
        'DELETE FROM barber_custom_hours WHERE barber_id = ?',
        [barber_id]
      );
      
      // Inserir nova configuração
      let insertedCount = 0;
      const now = new Date().toISOString();
      
      for (const day of week) {
        const date = day.date;
        
        if (!date || !day.hours || !Array.isArray(day.hours)) {
          continue;
        }
        
        for (const hour of day.hours) {
          await executeQuery(
            `INSERT INTO barber_custom_hours 
             (barber_id, date, time, active, updated_at)
             VALUES (?, ?, ?, ?, ?)`,
            [
              barber_id,
              date,
              hour.time,
              hour.active ? 0 : 1, // active: false = disponível, true = ocupado
              now
            ]
          );
          insertedCount++;
        }
      }
      
      // Commit da transação
      await executeQuery('COMMIT');
      
      return { 
        success: true, 
        message: "Horários salvos com sucesso!",
        inserted_count: insertedCount
      };
      
    } catch (error) {
      // Rollback em caso de erro
      await executeQuery('ROLLBACK');
      throw error;
    }
    
  } catch (error) {
    console.error('Erro no saveSchedule:', error);
    return { 
      success: false, 
      error: error.message || "Erro ao salvar horários" 
    };
  }
},




getBarberSchedule: async (barber_id: number, date: string) => {
  try {
    // Validações
    if (!barber_id) {
      return { 
        success: false, 
        error: "ID do barbeiro é obrigatório", 
        date: date,
        hours: [],
        summary: { total: 0, available: 0, booked: 0 }
      };
    }
    
    if (!date) {
      return { 
        success: false, 
        error: "Data é obrigatória",
        date: date, 
        hours: [],
        summary: { total: 0, available: 0, booked: 0 }
      };
    }
    
    // Validar formato da data
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return { 
        success: false, 
        error: "Formato de data inválido. Use YYYY-MM-DD",
        date: date,
        hours: [],
        summary: { total: 0, available: 0, booked: 0 }
      };
    }
    
    // Verificar se o barbeiro existe
    const barber = await selectOneQuery('SELECT id, name FROM barbers WHERE id = ?', [barber_id]);
    if (!barber) {
      return { 
        success: false, 
        error: "Barbeiro não encontrado",
        date: date,
        hours: [],
        summary: { total: 0, available: 0, booked: 0 }
      };
    }
    
    // Buscar horários do barbeiro para a data específica
    const schedule = await selectQuery(
      `SELECT id, time, active, updated_at
       FROM barber_custom_hours 
       WHERE barber_id = ? AND date = ? 
       ORDER BY time ASC`,
      [barber_id, date]
    );
    
    // Se não encontrar horários, gerar horários padrão
    if (!schedule || schedule.length === 0) {
      const defaultHours = generateDefaultHours();
      return {
        success: true,
        barber_id: barber_id,
        barber_name: barber.name,
        date: date,
        hours: defaultHours,
        has_custom_schedule: false,
        summary: {
          total: defaultHours.length,
          available: defaultHours.filter(h => !h.active).length,
          booked: defaultHours.filter(h => h.active).length
        }
      };
    }
    
    // Formatar os dados
    const hours = schedule.map(item => ({
      id: item.id,
      time: item.time,
      active: item.active === 1, // true = ocupado/indisponível, false = disponível
      is_booked: item.active === 1,
      is_available: item.active === 0,
      updated_at: item.updated_at
    }));
    
    const availableHours = hours.filter(h => !h.active);
    const bookedHours = hours.filter(h => h.active);
    
    return {
      success: true,
      barber_id: barber_id,
      barber_name: barber.name,
      date: date,
      hours: hours,
      has_custom_schedule: true,
      summary: {
        total: hours.length,
        available: availableHours.length,
        booked: bookedHours.length,
        available_times: availableHours.map(h => h.time),
        booked_times: bookedHours.map(h => h.time)
      }
    };
    
  } catch (error) {
    console.error('Erro no getBarberSchedule:', error);
    return { 
      success: false, 
      error: "Erro ao buscar horários",
      date: date,
      hours: [],
      summary: { total: 0, available: 0, booked: 0 }
    };
  }
},



// Função auxiliar para gerar horários padrão
generateDefaultHours: () => {
  const hours = [];
  const startHour = 8;
  const endHour = 20;
  
  for (let h = startHour; h < endHour; h++) {
    hours.push({
      time: `${String(h).padStart(2, '0')}:00`,
      active: false, // disponível
      is_available: true,
      is_booked: false
    });
    hours.push({
      time: `${String(h).padStart(2, '0')}:30`,
      active: false,
      is_available: true,
      is_booked: false
    });
  }
  
  return hours;
},


  getAllBarbers: async () => {
    return await selectQuery('SELECT * FROM barbers ORDER BY name');
  },

  getBarber: async (id: number) => {
    return await selectOneQuery('SELECT * FROM barbers WHERE id = ?', [id]);
  },

  getBarberName: async (name: string) => {
    return await selectOneQuery('SELECT * FROM barbers WHERE name = ?', [name]);
  },

  getBarberServices: async (barberId: number) => {
    return await selectQuery(
      `SELECT bs.*, s.name as service_name FROM barber_services bs 
       JOIN services s ON bs.service_id = s.id WHERE bs.barber_id = ?`,
      [barberId]
    );
  },

  getBarberPhotos: async (barberId: number) => {
    return await selectQuery('SELECT url FROM photos WHERE barber_id = ?', [barberId]);
  },

  getTestimonials: async (barberId: number) => {
    return await selectQuery('SELECT * FROM testimonials WHERE barber_id = ?', [barberId]);
  },

searchBarbers: async (name: string) => {
  try {
    if (!name || name.trim() === '') {
      return [];
    }
    
    const barbers = await selectQuery(
      'SELECT * FROM barbers WHERE LOWER(name) LIKE LOWER(?) ORDER BY name',
      [`%${name.trim().toLowerCase()}%`]
    );
    
    return barbers;
  } catch (error) {
    console.error('Erro no searchBarbers:', error);
    return [];
  }
},

// Na API, adicione este método:

deleteBarber: async ({ id }: { id: number }) => {
  try {
    // Verificar se o barbeiro existe
    const barber = await selectOneQuery('SELECT id FROM barbers WHERE id = ?', [id]);
    if (!barber) {
      return { success: false, error: "Barbeiro não encontrado" };
    }
    
    // Verificar se o barbeiro tem agendamentos
    const appointments = await selectOneQuery(
      'SELECT id FROM appointments WHERE barber_id = ? LIMIT 1',
      [id]
    );
    
    if (appointments) {
      return { success: false, error: "Barbeiro possui agendamentos e não pode ser excluído" };
    }
    
    // Verificar se o barbeiro tem serviços vinculados
    const barberServices = await selectOneQuery(
      'SELECT id FROM barber_services WHERE barber_id = ? LIMIT 1',
      [id]
    );
    
    if (barberServices) {
      // Remover os serviços vinculados primeiro
      await executeQuery('DELETE FROM barber_services WHERE barber_id = ?', [id]);
    }
    
    // Remover fotos do barbeiro
    await executeQuery('DELETE FROM photos WHERE barber_id = ?', [id]);
    
    // Remover depoimentos do barbeiro
    await executeQuery('DELETE FROM testimonials WHERE barber_id = ?', [id]);
    
    // Remover disponibilidade
    const availability = await selectQuery('SELECT id FROM availability WHERE barber_id = ?', [id]);
    for (const avail of availability) {
      await executeQuery('DELETE FROM availability_hours WHERE availability_id = ?', [avail.id]);
    }
    await executeQuery('DELETE FROM availability WHERE barber_id = ?', [id]);
    
    // Remover horários personalizados
    await executeQuery('DELETE FROM barber_custom_hours WHERE barber_id = ?', [id]);
    
    // Remover favoritos
    await executeQuery('DELETE FROM favorites WHERE barber_id = ?', [id]);
    
    // Finalmente, deletar o barbeiro
    await executeQuery('DELETE FROM barbers WHERE id = ?', [id]);
    
    return { success: true, message: "Barbeiro excluído com sucesso" };
  } catch (error) {
    console.error('Erro no deleteBarber:', error);
    return { success: false, error: "Erro ao excluir barbeiro" };
  }
},

  getBarbersByLocation: async (loc: string) => {
    return await selectQuery('SELECT * FROM barbers WHERE LOWER(loc) = ?', [loc.toLowerCase()]);
  },

  // ========== FAVORITES ==========
  setFavorite: async (userEmail: string, barberId: number) => {
    const exists = await selectOneQuery('SELECT * FROM favorites WHERE user_email = ? AND barber_id = ?', [userEmail, barberId]);
    if (exists) {
      await executeQuery('DELETE FROM favorites WHERE user_email = ? AND barber_id = ?', [userEmail, barberId]);
      return { favorited: false };
    } else {
      await executeQuery('INSERT INTO favorites (user_email, barber_id) VALUES (?, ?)', [userEmail, barberId]);
      return { favorited: true };
    }
  },

  getFavorites: async (userEmail: string) => {
    return await selectQuery(
      'SELECT b.* FROM barbers b JOIN favorites f ON b.id = f.barber_id WHERE f.user_email = ?',
      [userEmail]
    );
  },

  isFavorited: async (userEmail: string, barberId: number) => {
    const result = await selectOneQuery('SELECT id FROM favorites WHERE user_email = ? AND barber_id = ?', [userEmail, barberId]);
    return !!result;
  },

  // ========== CLIENTS ==========
  getClients: async () => {
    return await selectQuery('SELECT * FROM clients ORDER BY name');
  },

  // Na sua API (Api.tsx)
closeDatabase: async () => {
  try {
    await db.closeAsync();
    console.log('✅ Banco de dados fechado');
    return true;
  } catch (error) {
    console.error('Erro ao fechar banco:', error);
    return false;
  }
},

 getClientsSerch: async (nameOrObject: string | { name: string }) => {
  // Suporta ambos os formatos
  const searchName = typeof nameOrObject === 'string' 
    ? nameOrObject 
    : nameOrObject.name;
  
  const result = await selectQuery('SELECT * FROM clients WHERE name LIKE ?', [`%${searchName}%`]);
  
  // Retorna no formato que seu componente espera
  return result;
},

  getClientById: async (id: number) => {
    return await selectOneQuery('SELECT * FROM clients WHERE id = ?', [id]);
  },

 setClients: async (data: { name: string; phone: string; email: string; created_at: string }) => {
  try {
    // Validações básicas
    if (!data.name || data.name.trim() === '') {
      return { success: false, error: 'Nome é obrigatório' };
    }
    
    if (!data.email || data.email.trim() === '') {
      return { success: false, error: 'Email é obrigatório' };
    }
    
    // Verificar se já existe cliente com mesmo email
    const existing = await selectOneQuery('SELECT id FROM clients WHERE email = ?', [data.email]);
    if (existing) {
      return { success: false, error: 'Já existe um cliente com este email' };
    }
    
    // Verificar se já existe cliente com mesmo nome
    const existingName = await selectOneQuery('SELECT id FROM clients WHERE name = ?', [data.name]);
    if (existingName) {
      return { success: false, error: 'Já existe um cliente com este nome' };
    }
    
    const result = await executeQuery(
      'INSERT INTO clients (name, phone, email, created_at) VALUES (?, ?, ?, ?)', 
      [data.name.trim(), data.phone, data.email.trim(), data.created_at]
    );
    
    return { 
      success: true,
      id: result.insertId, 
      client: {
        id: result.insertId,
        name: data.name,
        phone: data.phone,
        email: data.email,
        created_at: data.created_at
      }
    };
  } catch (error: any) {
    console.error('Erro no setClients:', error);
    
    if (error.message?.includes('UNIQUE constraint failed')) {
      if (error.message?.includes('email')) {
        return { success: false, error: 'Este email já está cadastrado' };
      }
      if (error.message?.includes('name')) {
        return { success: false, error: 'Este nome já está cadastrado' };
      }
      return { success: false, error: 'Cliente já existe' };
    }
    
    return { 
      success: false, 
      error: 'Erro ao salvar cliente. Tente novamente.' 
    };
  }
},

 updateClient: async (data: { id: number; name: string; phone: string; email: string; created_at: string }) => {
  try {
    // Validações
    if (!data.id) {
      return { success: false, error: "ID do cliente é obrigatório" };
    }
    if (!data.name || data.name.trim() === '') {
      return { success: false, error: "Nome do cliente é obrigatório" };
    }
    if (!data.email || data.email.trim() === '') {
      return { success: false, error: "Email do cliente é obrigatório" };
    }
    
    // Verificar se o cliente existe
    const client = await selectOneQuery('SELECT id FROM clients WHERE id = ?', [data.id]);
    if (!client) {
      return { success: false, error: "Cliente não encontrado" };
    }
    
    // Verificar se o email já está em uso por outro cliente
    const existingEmail = await selectOneQuery(
      'SELECT id FROM clients WHERE email = ? AND id != ?',
      [data.email.trim(), data.id]
    );
    if (existingEmail) {
      return { success: false, error: "Este email já está em uso por outro cliente" };
    }
    
    // Atualizar o cliente
    await executeQuery(
      'UPDATE clients SET name = ?, phone = ?, email = ? WHERE id = ?', 
      [data.name.trim(), data.phone || '', data.email.trim(), data.id]
    );
    
    return { 
      success: true, 
      message: "Cliente atualizado com sucesso",
      client: {
        id: data.id,
        name: data.name,
        phone: data.phone,
        email: data.email,
        created_at: data.created_at
      }
    };
  } catch (error) {
    console.error('Erro no updateClient:', error);
    return { success: false, error: "Erro ao atualizar cliente" };
  }
},

 deleteClient: async (clientId: number) => {
  try {
    // Validação
    if (!clientId) {
      return { success: false, error: "ID do cliente é obrigatório" };
    }
    
    // Verificar se o cliente existe
    const client = await selectOneQuery('SELECT id FROM clients WHERE id = ?', [clientId]);
    if (!client) {
      return { success: false, error: "Cliente não encontrado" };
    }
    
    // Verificar se o cliente tem agendamentos
    const appointments = await selectOneQuery(
      'SELECT id FROM appointments WHERE client_id = ? LIMIT 1',
      [clientId]
    );
    
    if (appointments) {
      return { success: false, error: "Cliente possui agendamentos e não pode ser excluído" };
    }
    
    // Verificar se o cliente tem ordens/comandas
    const orders = await selectOneQuery(
      'SELECT id FROM orders WHERE client_id = ? LIMIT 1',
      [clientId]
    );
    
    if (orders) {
      return { success: false, error: "Cliente possui comandas e não pode ser excluído" };
    }
    
    // Deletar o cliente
    await executeQuery('DELETE FROM clients WHERE id = ?', [clientId]);
    
    return { success: true, message: "Cliente excluído com sucesso" };
  } catch (error) {
    console.error('Erro no deleteClient:', error);
    return { success: false, error: "Erro ao excluir cliente" };
  }
},

  // ========== SERVICES ==========

getServices: async () => {
  try {
    const services = await selectQuery('SELECT * FROM services ORDER BY name');
    return { error: "", data: services };
  } catch (error) {
    console.error('Erro no getServices:', error);
    return { error: "Erro ao buscar serviços", data: [] };
  }
},

getServiceSearchName: async (name: string) => {
  try {
    if (!name || name.trim() === '') {
      return { error: "Nome não fornecido", data: [] };
    }
    
    const services = await selectQuery(
      `SELECT * FROM services WHERE LOWER(name) LIKE LOWER(?) ORDER BY name`,
      [`%${name.trim()}%`]
    );
    
    return {
      error: "",
      data: services
    };
  } catch (error) {
    console.error('Erro no getServiceSearchName:', error);
    return { error: "Erro ao buscar serviços", data: [] };
  }
},

setServices: async (data: { name: string }) => {
  try {
    if (!data.name || data.name.trim() === '') {
      return { success: false, error: "Nome do serviço é obrigatório" };
    }
    
    const existing = await selectOneQuery('SELECT id FROM services WHERE name = ?', [data.name.trim()]);
    if (existing) {
      return { success: false, error: "Serviço já existe" };
    }
    
    const result = await executeQuery(
      'INSERT INTO services (name) VALUES (?)',
      [data.name.trim()]
    );
    
    return { 
      success: true, 
      id: result.insertId,
      service: { id: result.insertId, name: data.name }
    };
  } catch (error: any) {
    console.error('Erro no setServices:', error);
    return { success: false, error: "Erro ao criar serviço" };
  }
},

// CORREÇÃO: Nome do método com U maiúsculo para compatibilidade
UpdateService: async (data: { id: number; name: string }) => {
  try {
    if (!data.name || data.name.trim() === '') {
      return { success: false, error: "Nome do serviço é obrigatório" };
    }
    
    const existing = await selectOneQuery('SELECT id FROM services WHERE id = ?', [data.id]);
    if (!existing) {
      return { success: false, error: "Serviço não encontrado" };
    }
    
    await executeQuery(
      'UPDATE services SET name = ? WHERE id = ?',
      [data.name.trim(), data.id]
    );
    
    return { 
      success: true,
      service: { id: data.id, name: data.name }
    };
  } catch (error) {
    console.error('Erro no UpdateService:', error);
    return { success: false, error: "Erro ao atualizar serviço" };
  }
},

// Também mantenha a versão com letra minúscula para consistência
updateService: async (id: number, name: string) => {
  try {
    await executeQuery('UPDATE services SET name = ? WHERE id = ?', [name, id]);
    return { success: true };
  } catch (error) {
    console.error('Erro no updateService:', error);
    return { success: false, error: "Erro ao atualizar serviço" };
  }
},

deleteService: async ({ service_id }: { service_id: number }) => {
  try {
    // Verificar se o serviço está em uso
    const inUse = await selectOneQuery(
      'SELECT id FROM barber_services WHERE service_id = ? LIMIT 1',
      [service_id]
    );
    
    if (inUse) {
      return { success: false, error: "Serviço está vinculado a um barbeiro e não pode ser excluído" };
    }
    
    await executeQuery('DELETE FROM services WHERE id = ?', [service_id]);
    return { success: true };
  } catch (error) {
    console.error('Erro no deleteService:', error);
    return { success: false, error: "Erro ao deletar serviço" };
  }
},
  // ========== BARBER SERVICES ==========
setBarberService: async (data: { barber_id: number; service_id: number; price: number; duration: number }) => {
  try {
    // Validações
    if (!data.barber_id) {
      return { success: false, error: "ID do barbeiro é obrigatório" };
    }
    if (!data.service_id) {
      return { success: false, error: "ID do serviço é obrigatório" };
    }
    if (!data.price || data.price <= 0) {
      return { success: false, error: "Preço deve ser maior que zero" };
    }
    if (!data.duration || data.duration <= 0) {
      return { success: false, error: "Duração deve ser maior que zero" };
    }
    
    // Verificar se o barbeiro existe
    const barber = await selectOneQuery('SELECT id FROM barbers WHERE id = ?', [data.barber_id]);
    if (!barber) {
      return { success: false, error: "Barbeiro não encontrado" };
    }
    
    // Verificar se o serviço existe
    const service = await selectOneQuery('SELECT id FROM services WHERE id = ?', [data.service_id]);
    if (!service) {
      return { success: false, error: "Serviço não encontrado" };
    }
    
    // Verificar se já existe uma configuração para este barbeiro e serviço
    const existing = await selectOneQuery(
      'SELECT id FROM barber_services WHERE barber_id = ? AND service_id = ?',
      [data.barber_id, data.service_id]
    );
    
    if (existing) {
      // Se já existe, atualizar em vez de inserir
      await executeQuery(
        'UPDATE barber_services SET price = ?, duration = ? WHERE barber_id = ? AND service_id = ?',
        [data.price, data.duration, data.barber_id, data.service_id]
      );
      return { 
        success: true, 
        message: "Configuração atualizada com sucesso",
        id: existing.id 
      };
    }
    
    // Inserir nova configuração
    const result = await executeQuery(
      'INSERT INTO barber_services (barber_id, service_id, price, duration) VALUES (?, ?, ?, ?)',
      [data.barber_id, data.service_id, data.price, data.duration]
    );
    
    return { 
      success: true, 
      id: result.insertId,
      message: "Configuração salva com sucesso"
    };
  } catch (error: any) {
    console.error('Erro no setBarberService:', error);
    
    if (error.message?.includes('UNIQUE constraint failed')) {
      return { success: false, error: "Esta configuração já existe" };
    }
    
    return { success: false, error: "Erro ao salvar configuração" };
  }
},


getServicesByBarberSearch: async (data: { data: { barber_id: number } }) => {
  try {
    
    if (!data.data.barber_id) {
      return { success: false, error: "barber_id não fornecido", data: [] };
    }
    
    const services = await selectQuery(`
      SELECT 
        bs.id AS barber_service_id,
        s.id AS service_id,
        s.name AS service_name,
        bs.price,
        bs.duration
      FROM barber_services bs
      JOIN services s ON s.id = bs.service_id
      WHERE bs.barber_id = ?
      ORDER BY s.name ASC
    `, [data.data.barber_id]);
    
    return { success: true, data: services };
  } catch (error) {
    console.error('Erro:', error);
    return { success: false, error: "Erro ao buscar serviços", data: [] };
  }
},

  updateBarberService: async (barberId: number, serviceId: number, price: number, duration: number) => {
    await executeQuery('UPDATE barber_services SET price = ?, duration = ? WHERE barber_id = ? AND service_id = ?',
      [price, duration, barberId, serviceId]);
    return { success: true };
  },

  searchServiceWithBarber: async (serviceName: string) => {
    return await selectQuery(
      `SELECT s.name as service_name, b.name as barber_name, bs.price, bs.duration
       FROM barber_services bs
       JOIN services s ON bs.service_id = s.id
       JOIN barbers b ON bs.barber_id = b.id
       WHERE s.name LIKE ?`,
      [`%${serviceName}%`]
    );
  },

  getFullServices: async () => {
    return await selectQuery(
      `SELECT s.id as service_id, s.name as service_name, bs.id as barber_service_id,
              bs.barber_id, b.name as barber_name, bs.price, bs.duration
       FROM services s
       LEFT JOIN barber_services bs ON bs.service_id = s.id
       LEFT JOIN barbers b ON b.id = bs.barber_id
       ORDER BY s.name ASC`
    );
  },

  // ========== PRODUCTS ==========

  getProductsSearch: async (name: string) => {
    return await selectQuery('SELECT * FROM products WHERE name LIKE ?', [`%${name}%`]);
  },

  deleteProdutcs: async ({ products_id }: { products_id: number }) => {
  try {
    // Validação
    if (!products_id) {
      return { success: false, error: "ID do produto é obrigatório" };
    }
    
    // Verificar se o produto existe
    const product = await selectOneQuery('SELECT id, name FROM products WHERE id = ?', [products_id]);
    if (!product) {
      return { success: false, error: "Produto não encontrado" };
    }
    
    // Verificar se o produto tem movimentações de estoque
    const hasStockMovements = await selectOneQuery(
      'SELECT id FROM stock_control WHERE product_id = ? LIMIT 1',
      [products_id]
    );
    
    if (hasStockMovements) {
      return { 
        success: false, 
        error: `Produto "${product.name}" possui movimentações de estoque e não pode ser excluído` 
      };
    }
    
    // Verificar se o produto está vinculado a algum pedido
    const hasOrderItems = await selectOneQuery(
      'SELECT id FROM order_items WHERE product_id = ? LIMIT 1',
      [products_id]
    );
    
    if (hasOrderItems) {
      return { 
        success: false, 
        error: `Produto "${product.name}" está vinculado a pedidos e não pode ser excluído` 
      };
    }
    
    // Deletar o produto
    await executeQuery('DELETE FROM products WHERE id = ?', [products_id]);
    
    return { 
      success: true, 
      message: `Produto "${product.name}" excluído com sucesso`,
      product_id: products_id,
      product_name: product.name
    };
    
  } catch (error) {
    console.error('Erro no deleteProdutcs:', error);
    return { 
      success: false, 
      error: "Erro ao excluir produto" 
    };
  }
},
 

setProducts: async (data: { name: string; price: number; cost: number; unit: string; description: string }) => {
  try {
    console.log('📦 Dados recebidos:', data);
    
    // Validações
    if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
      return { success: false, error: "Nome do produto é obrigatório" };
    }
    
    const nameValue = data.name.trim();
    const priceValue = Number(data.price);
    const costValue = Number(data.cost);
    const unitValue = data.unit ? String(data.unit).trim() : '';
    const descriptionValue = data.description ? String(data.description).trim() : '';
    
    console.log('📦 Dados processados:', { nameValue, priceValue, costValue, unitValue, descriptionValue });
    
    if (isNaN(priceValue) || priceValue <= 0) {
      return { success: false, error: "Preço deve ser maior que zero" };
    }
    
    if (isNaN(costValue) || costValue <= 0) {
      return { success: false, error: "Custo deve ser maior que zero" };
    }
    
    if (!unitValue) {
      return { success: false, error: "Unidade é obrigatória" };
    }
    
    // Verificar se produto já existe
    const existing = await selectOneQuery('SELECT id FROM products WHERE name = ?', [nameValue]);
    console.log('📦 Produto existente:', existing);
    
    if (existing) {
      return { success: false, error: "Produto já existe com este nome" };
    }
    
    // Inserir produto
    const result = await executeQuery(
      'INSERT INTO products (name, price, cost, unit, description) VALUES (?, ?, ?, ?, ?)',
      [nameValue, priceValue, costValue, unitValue, descriptionValue]
    );
    
    console.log('✅ Produto inserido com ID:', result.insertId);
    
    return { 
      success: true, 
      id: result.insertId,
      message: "Produto salvo com sucesso"
    };
  } catch (error: any) {
    console.error('❌ Erro no setProducts:', error);
    console.error('❌ Mensagem:', error.message);
    
    if (error.message?.includes('UNIQUE constraint failed')) {
      return { success: false, error: "Produto já existe com este nome" };
    }
    
    if (error.message?.includes('no such table')) {
      return { success: false, error: "Tabela de produtos não encontrada. Reinicie o aplicativo." };
    }
    
    return { success: false, error: "Erro ao salvar produto: " + error.message };
  }
},


getStockSerch: async (data: { name: string }) => {
  try {
    if (!data.name || data.name.trim() === '') {
      return { success: false, error: "Nome não fornecido", data: [] };
    }
    
    const movements = await selectQuery(
      `SELECT 
        sc.id, 
        p.name as product_name, 
        sc.type, 
        sc.quantity, 
        sc.description, 
        sc.datetime
       FROM stock_control sc
       JOIN products p ON sc.product_id = p.id
       WHERE p.name LIKE ?
       ORDER BY sc.datetime DESC`,
      [`%${data.name.trim()}%`]
    );
    
    return { 
      success: true, 
      data: movements,
      count: movements.length
    };
  } catch (error) {
    console.error('Erro no getStockSerch:', error);
    return { success: false, error: "Erro ao buscar movimentações de estoque", data: [] };
  }
},

UpdateProdutcs: async (data: { 
  id: number; 
  name: string; 
  price: number; 
  cost: number; 
  unit: string; 
  description: string;
}) => {
  try {
    // Validações
    if (!data.id) {
      return { success: false, error: "ID do produto é obrigatório" };
    }
    
    if (!data.name || data.name.trim() === '') {
      return { success: false, error: "Nome do produto é obrigatório" };
    }
    
    if (!data.price || data.price <= 0) {
      return { success: false, error: "Preço deve ser maior que zero" };
    }
    
    if (!data.cost || data.cost <= 0) {
      return { success: false, error: "Custo deve ser maior que zero" };
    }
    
    if (!data.unit || data.unit.trim() === '') {
      return { success: false, error: "Unidade é obrigatória" };
    }
    
    // Verificar se o produto existe
    const existing = await selectOneQuery('SELECT id FROM products WHERE id = ?', [data.id]);
    if (!existing) {
      return { success: false, error: "Produto não encontrado" };
    }
    
    // Verificar se outro produto já tem este nome (se o nome mudou)
    const duplicateName = await selectOneQuery(
      'SELECT id FROM products WHERE name = ? AND id != ?',
      [data.name.trim(), data.id]
    );
    if (duplicateName) {
      return { success: false, error: "Já existe outro produto com este nome" };
    }
    
    // Atualizar o produto
    await executeQuery(
      `UPDATE products 
       SET name = ?, price = ?, cost = ?, unit = ?, description = ? 
       WHERE id = ?`,
      [
        data.name.trim(),
        data.price,
        data.cost,
        data.unit.trim(),
        data.description || '',
        data.id
      ]
    );
    
    // Buscar o produto atualizado
    const updatedProduct = await selectOneQuery(
      'SELECT * FROM products WHERE id = ?',
      [data.id]
    );
    
    return { 
      success: true, 
      message: "Produto atualizado com sucesso",
      product: updatedProduct,
      service: updatedProduct // Para compatibilidade com o código existente
    };
  } catch (error) {
    console.error('Erro no UpdateProdutcs:', error);
    return { 
      success: false, 
      error: "Erro ao atualizar produto" 
    };
  }
},

getStock: async () => {
  try {
    const stockMovements = await selectQuery(
      `SELECT 
        sc.id,
        sc.product_id,
        sc.type,
        sc.quantity,
        sc.description,
        sc.datetime,
        p.name as product_name
       FROM stock_control sc
       LEFT JOIN products p ON sc.product_id = p.id
       ORDER BY sc.datetime DESC`
    );
    
    const formattedStock = stockMovements.map(stock => ({
      id: stock.id,
      product_id: stock.product_id,
      product_name: stock.product_name || 'Produto não encontrado',
      type: stock.type,
      quantity: stock.quantity,
      description: stock.description || '',
      datetime: stock.datetime,
      data_formatada: new Date(stock.datetime).toLocaleDateString('pt-BR'),
      hora_formatada: new Date(stock.datetime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }));
    
    return {
      error: "",
      stock: formattedStock,
      total: formattedStock.length
    };
  } catch (error) {
    console.error('Erro no getStock:', error);
    return { 
      error: "Erro ao buscar movimentações de estoque", 
      stock: [],
      total: 0
    };
  }
},

// Buscar todos os produtos
getProducts: async () => {
  try {
    const products = await selectQuery('SELECT * FROM products ORDER BY name');
    return { success: true, data: products };
  } catch (error) {
    console.error('Erro no getProducts:', error);
    return { success: false, error: "Erro ao buscar produtos", data: [] };
  }
},

// Buscar produtos por nome
// getProdutcsSerch: async (data: { name: string }) => {
//   try {
//     if (!data.name || data.name.trim() === '') {
//       return { success: false, error: "Nome não fornecido", data: [] };
//     }
    
//     const products = await selectQuery(
//       'SELECT * FROM products WHERE name LIKE ? ORDER BY name',
//       [`%${data.name.trim()}%`]
//     );
    
//     return { success: true, data: products };
//   } catch (error) {
//     console.error('Erro no getProdutcsSerch:', error);
//     return { success: false, error: "Erro ao buscar produtos", data: [] };
//   }
// },

// Buscar produto por ID


getProductById: async (id: number) => {
  try {
    const product = await selectOneQuery('SELECT * FROM products WHERE id = ?', [id]);
    if (!product) {
      return { success: false, error: "Produto não encontrado", data: null };
    }
    return { success: true, data: product };
  } catch (error) {
    console.error('Erro no getProductById:', error);
    return { success: false, error: "Erro ao buscar produto", data: null };
  }
},

// Atualizar produto
updateProducts: async (data: { id: number; name: string; price: number; cost: number; unit: string; description: string }) => {
  try {
    if (!data.name || data.name.trim() === '') {
      return { success: false, error: "Nome do produto é obrigatório" };
    }
    
    const existing = await selectOneQuery('SELECT id FROM products WHERE id = ?', [data.id]);
    if (!existing) {
      return { success: false, error: "Produto não encontrado" };
    }
    
    await executeQuery(
      'UPDATE products SET name = ?, price = ?, cost = ?, unit = ?, description = ? WHERE id = ?',
      [data.name.trim(), data.price, data.cost, data.unit, data.description, data.id]
    );
    
    return { success: true, message: "Produto atualizado com sucesso" };
  } catch (error) {
    console.error('Erro no updateProducts:', error);
    return { success: false, error: "Erro ao atualizar produto" };
  }
},

// Deletar produto
deleteProducts: async (productId: number) => {
  try {
    const existing = await selectOneQuery('SELECT id FROM products WHERE id = ?', [productId]);
    if (!existing) {
      return { success: false, error: "Produto não encontrado" };
    }
    
    await executeQuery('DELETE FROM products WHERE id = ?', [productId]);
    return { success: true, message: "Produto excluído com sucesso" };
  } catch (error) {
    console.error('Erro no deleteProducts:', error);
    return { success: false, error: "Erro ao excluir produto" };
  }
},

// Opções de produtos (para selects)
getProductOptions: async () => {
  try {
    const products = await selectQuery('SELECT id, name, price FROM products ORDER BY name');
    return { success: true, data: products };
  } catch (error) {
    console.error('Erro no getProductOptions:', error);
    return { success: false, error: "Erro ao buscar opções", data: [] };
  }
},


  // ========== STOCK ==========
  getStockMovements: async (name: string) => {
    return await selectQuery(
      `SELECT sc.id, p.name as product_name, sc.type, sc.quantity, sc.description, sc.datetime
       FROM stock_control sc
       JOIN products p ON sc.product_id = p.id
       WHERE p.name LIKE ?
       ORDER BY sc.datetime DESC`,
      [`%${name}%`]
    );
  },

setStock: async (data: { 
  product_id: number; 
  type: string; 
  quantity: number; 
  description: string; 
  datetime: string 
}) => {
  try {
    // Validações
    if (!data.product_id) {
      return { success: false, error: "Produto é obrigatório" };
    }
    
    if (!data.quantity || data.quantity <= 0) {
      return { success: false, error: "Quantidade deve ser maior que zero" };
    }
    
    // Normalizar o tipo (aceitar variações)
    let normalizedType = '';
    const typeLower = String(data.type).toLowerCase().trim();
    
    if (typeLower === 'entrada' || typeLower === 'entrada') {
      normalizedType = 'entrada';
    } else if (typeLower === 'saida' || typeLower === 'saída' || typeLower === 'saida') {
      normalizedType = 'saida';
    } else {
      return { success: false, error: "Tipo deve ser 'entrada' ou 'saida'" };
    }
    
    // Verificar se o produto existe
    const product = await selectOneQuery('SELECT id FROM products WHERE id = ?', [data.product_id]);
    if (!product) {
      return { success: false, error: "Produto não encontrado" };
    }
    
    const result = await executeQuery(
      'INSERT INTO stock_control (product_id, type, quantity, description, datetime) VALUES (?, ?, ?, ?, ?)',
      [data.product_id, normalizedType, data.quantity, data.description || '', data.datetime || new Date().toISOString()]
    );
    
    return { 
      success: true, 
      id: result.insertId,
      message: "Movimentação registrada com sucesso"
    };
  } catch (error: any) {
    console.error('Erro no setStock:', error);
    return { success: false, error: "Erro ao registrar movimentação" };
  }
},

UpdateStock: async (data: { id: number; name: string; price: number; cost: number; unit: string; description: string }) => {
  try {
    // Validações
    if (!data.id) {
      return { success: false, error: "ID do produto é obrigatório" };
    }
    
    if (!data.name || data.name.trim() === '') {
      return { success: false, error: "Nome do produto é obrigatório" };
    }
    
    if (!data.price || data.price <= 0) {
      return { success: false, error: "Preço deve ser maior que zero" };
    }
    
    // Verificar se o produto existe
    const existing = await selectOneQuery('SELECT id FROM products WHERE id = ?', [data.id]);
    if (!existing) {
      return { success: false, error: "Produto não encontrado" };
    }
    
    // Verificar se outro produto já tem este nome
    const duplicateName = await selectOneQuery(
      'SELECT id FROM products WHERE name = ? AND id != ?',
      [data.name.trim(), data.id]
    );
    if (duplicateName) {
      return { success: false, error: "Já existe outro produto com este nome" };
    }
    
    // Atualizar o produto
    await executeQuery(
      `UPDATE products 
       SET name = ?, price = ?, cost = ?, unit = ?, description = ? 
       WHERE id = ?`,
      [
        data.name.trim(),
        data.price,
        data.cost || 0,
        data.unit || '',
        data.description || '',
        data.id
      ]
    );
    
    return { 
      success: true, 
      message: "Produto atualizado com sucesso",
      product: {
        id: data.id,
        name: data.name,
        price: data.price,
        cost: data.cost,
        unit: data.unit,
        description: data.description
      }
    };
  } catch (error) {
    console.error('Erro no UpdateStock:', error);
    return { success: false, error: "Erro ao atualizar produto" };
  }
},

  deleteStock: async (stockId: number) => {
    await executeQuery('DELETE FROM stock_control WHERE id = ?', [stockId]);
    return { success: true };
  },

  // ========== AVAILABILITY ==========
  getAvailability: async (barberId: number, date: string) => {
    const availability = await selectOneQuery('SELECT id FROM availability WHERE barber_id = ? AND date = ?', [barberId, date]);
    if (!availability) return [];
    return await selectQuery('SELECT id as hour_id, hour, is_booked FROM availability_hours WHERE availability_id = ? ORDER BY hour', [availability.id]);
  },

  addAvailability: async (barberId: number, date: string, slots: string[]) => {
    let availability = await selectOneQuery('SELECT id FROM availability WHERE barber_id = ? AND date = ?', [barberId, date]);
    let availabilityId = availability?.id;
    
    if (!availabilityId) {
      const result = await executeQuery('INSERT INTO availability (barber_id, date) VALUES (?, ?)', [barberId, date]);
      availabilityId = result.insertId;
    }
    
    let added = 0;
    for (const hour of slots) {
      const result = await executeQuery('INSERT OR IGNORE INTO availability_hours (availability_id, hour, is_booked) VALUES (?, ?, 0)', [availabilityId, hour]);
      if (result.changes > 0) added++;
    }
    return { success: true, availability_id: availabilityId, added_slots: added };
  },

  getBarberCustomHours: async (barberId: number, date: string) => {
    return await selectQuery('SELECT * FROM barber_custom_hours WHERE barber_id = ? AND date = ? ORDER BY time', [barberId, date]);
  },


  getBarberServiceById: async (barberId: number, serviceId: number) => {
  try {
    const service = await selectOneQuery(
      `SELECT bs.*, s.name as service_name 
       FROM barber_services bs
       JOIN services s ON bs.service_id = s.id
       WHERE bs.barber_id = ? AND bs.service_id = ?`,
      [barberId, serviceId]
    );
    
    if (!service) {
      return { success: false, error: "Serviço não encontrado para este barbeiro", data: null };
    }
    
    return { 
      success: true, 
      data: {
        id: service.id,
        barber_id: service.barber_id,
        service_id: service.service_id,
        service_name: service.service_name,
        price: service.price,
        duration: service.duration
      }
    };
  } catch (error) {
    console.error('Erro no getBarberServiceById:', error);
    return { success: false, error: "Erro ao buscar serviço", data: null };
  }
},

  // ========== APPOINTMENTS ==========
createAppointment: async (data: { 
  client_id: number; 
  barber_id: number; 
  service_id: number; 
  datetime: string; 
  user_email: string 
}) => {
  try {
    // Verifica campos obrigatórios (igual ao Flask)
    if (!data.client_id || !data.barber_id || !data.service_id || !data.datetime || !data.user_email) {
      return { success: false, error: "Dados incompletos" };
    }
    
    // Buscar duração do serviço
    const barberService = await selectOneQuery(
      `SELECT duration FROM barber_services 
       WHERE barber_id = ? AND service_id = ?`,
      [data.barber_id, data.service_id]
    );
    
    const duration = barberService?.duration || 30;
    
    // Inserir agendamento
    const result = await executeQuery(
      `INSERT INTO appointments 
       (client_id, barber_id, service_id, datetime, user_email, duration, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'scheduled')`,
      [data.client_id, data.barber_id, data.service_id, data.datetime, data.user_email, duration]
    );
    
    return { 
      success: true, 
      id: result.insertId 
    };
    
  } catch (error) {
    console.error('Erro no createAppointment:', error);
    return { success: false, error: "Erro ao criar agendamento" };
  }
},

getAppointments: async (): Promise<any> => {
  try {
    // Pega o email do usuário logado (usar a chave correta)
    const userEmail = await AsyncStorage.getItem('userEmail'); // <-- USAR 'userEmail'
    
    
    if (!userEmail) {
      return { error: "Usuário não encontrado", appointments: [] };
    }
    
    // Pega o token
    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
      return { error: "Token não fornecido", appointments: [] };
    }
    
    // Verifica se o token é válido (opcional, já que confiamos no userEmail)
    const user = await selectOneQuery('SELECT * FROM users WHERE token = ? AND email = ?', [token, userEmail]);
    
    if (!user) {
      return { error: "Token inválido ou expirado", appointments: [] };
    }
    
    const appointments = await selectQuery(
      `SELECT 
          a.id,
          a.barber_id,
          COALESCE(c.name, 'Cliente não informado') as client_name,
          COALESCE(s.name, 'Serviço não informado') as service_name,
          a.datetime,
          COALESCE(b.name, 'Barbeiro não informado') as barber_name,
          b.avatar as barber_avatar,
          COALESCE(bs.price, 0) as price,
          a.client_id,
          a.status
       FROM appointments a
       LEFT JOIN barbers b ON a.barber_id = b.id
       LEFT JOIN barber_services bs ON bs.barber_id = a.barber_id AND bs.service_id = a.service_id
       LEFT JOIN services s ON s.id = a.service_id
       LEFT JOIN clients c ON c.id = a.client_id
       WHERE a.user_email = ?
       ORDER BY a.datetime DESC`,
      [userEmail]
    );
    
    return {
      error: "",
      appointments: appointments
    };
  } catch (error) {
    console.error('Erro no getAppointments:', error);
    return {
      error: "Erro ao buscar agendamentos",
      appointments: []
    };
  }
},

rescheduleAppointment: async (
  appointmentId: number | null,
  data: { date: string; time: string }
) => {
  try {
    // Validações
    if (!appointmentId) {
      return { success: false, error: "ID do agendamento é obrigatório" };
    }
    
    if (!data.date || !data.time) {
      return { success: false, error: "Data ou horário não informados" };
    }
    
    const newDatetime = `${data.date} ${data.time}:00`;
    
    // Buscar agendamento existente
    const appointment = await selectOneQuery(
      `SELECT * FROM appointments WHERE id = ?`,
      [appointmentId]
    );
    
    if (!appointment) {
      return { success: false, error: "Agendamento não encontrado" };
    }
    
    // Verificar se o novo horário está disponível
    const isUnavailable = await checkSlotUnavailable(
      appointment.barber_id,
      newDatetime
    );
    
    if (isUnavailable) {
      return { success: false, error: "Horário indisponível" };
    }
    
    // Iniciar transação
    await executeQuery('BEGIN TRANSACTION');
    
    try {
      // Liberar horário antigo
      await releaseAppointmentSlots(appointmentId);
      
      // Deletar agendamento antigo
      await executeQuery('DELETE FROM appointments WHERE id = ?', [appointmentId]);
      
      // Criar novo agendamento
      const result = await createNewAppointment(
        appointment.client_id,
        appointment.barber_id,
        appointment.service_id,
        newDatetime,
        appointment.user_email,
        appointment.duration || 30
      );
      
      // Registrar histórico
      await insertAppointmentHistory(appointmentId, "remarcado");
      
      await executeQuery('COMMIT');
      
      return {
        success: true,
        message: "Agendamento remarcado com sucesso",
        old_appointment_id: appointmentId,
        new_appointment_id: result.insertId,
        new_datetime: newDatetime
      };
      
    } catch (error) {
      await executeQuery('ROLLBACK');
      throw error;
    }
    
  } catch (error) {
    console.error('Erro no rescheduleAppointment:', error);
    return { 
      success: false, 
      error: error.message || "Erro ao remarcar agendamento" 
    };
  }
},


getProdutcsSerch: async (data: { name: string }) => {
  try {
    // Validação
    if (!data.name || data.name.trim() === '') {
      return { 
        success: false, 
        error: "Nome do produto é obrigatório", 
        data: [] 
      };
    }
    
    // Buscar produtos pelo nome (case insensitive)
    const products = await selectQuery(
      `SELECT 
        id, 
        name, 
        price, 
        cost, 
        unit, 
        description 
       FROM products 
       WHERE LOWER(name) LIKE LOWER(?) 
       ORDER BY name ASC`,
      [`%${data.name.trim()}%`]
    );
    
    return { 
      success: true,
      error: "", 
      data: products,
      count: products.length
    };
  } catch (error) {
    console.error('Erro no getProdutcsSerch:', error);
    return { 
      success: false,
      error: "Erro ao buscar produtos", 
      data: [] 
    };
  }
},

  getAppointmentsByUser: async (userEmail: string) => {
    return await selectQuery(
      `SELECT a.id, a.barber_id, c.name as client_name, s.name as service_name, a.datetime, 
              b.name as barber_name, b.avatar as barber_avatar, bs.price, a.client_id
       FROM appointments a
       JOIN barbers b ON a.barber_id = b.id
       LEFT JOIN barber_services bs ON bs.barber_id = a.barber_id AND bs.service_id = a.service_id
       LEFT JOIN services s ON s.id = a.service_id
       LEFT JOIN clients c ON c.id = a.client_id
       WHERE a.user_email = ?
       ORDER BY a.datetime DESC`,
      [userEmail]
    );
  },

  cancelAppointment: async (appointmentId: number) => {
    const appointment = await selectOneQuery('SELECT barber_id, datetime, duration FROM appointments WHERE id = ?', [appointmentId]);
    if (appointment) {
      const startDt = new Date(appointment.datetime);
      const endDt = new Date(startDt.getTime() + appointment.duration * 60000);
      const dateStr = appointment.datetime.split(' ')[0];
      let current = startDt;
      
      while (current < endDt) {
        const timeStr = current.toTimeString().slice(0, 5);
        await executeQuery('UPDATE barber_custom_hours SET active = 0 WHERE barber_id = ? AND date = ? AND time = ?', 
          [appointment.barber_id, dateStr, timeStr]);
        current = new Date(current.getTime() + 30 * 60000);
      }
    }
    await executeQuery('DELETE FROM appointments WHERE id = ?', [appointmentId]);
    return { success: true };
  },

  getTodaySummary: async () => {
    const today = new Date().toISOString().split('T')[0];
    const appointments = await selectQuery(
      `SELECT a.service_id, a.barber_id FROM appointments a WHERE DATE(a.datetime) = ?`,
      [today]
    );
    
    let totalRevenue = 0;
    for (const apt of appointments) {
      const service = await selectOneQuery('SELECT price FROM barber_services WHERE barber_id = ? AND service_id = ?', 
        [apt.barber_id, apt.service_id]);
      if (service) totalRevenue += service.price;
    }
    
    return [{
      date: today,
      total_clients: appointments.length,
      total_revenue: totalRevenue
    }];
  },


  cancelComanda: async (id: number): Promise<any> => {
  try {
    // Validação
    if (!id) {
      return { success: false, error: "ID da comanda é obrigatório" };
    }
    
    // Verificar se a comanda existe
    const order = await selectOneQuery(
      `SELECT id, order_number, status, client_id, total 
       FROM orders 
       WHERE id = ?`,
      [id]
    );
    
    if (!order) {
      return { success: false, error: "Comanda não encontrada" };
    }
    
    // Verificar se a comanda já está finalizada ou cancelada
    if (order.status === 'finalizada') {
      return { success: false, error: "Comanda já está finalizada e não pode ser cancelada" };
    }
    
    if (order.status === 'cancelada') {
      return { success: false, error: "Comanda já está cancelada" };
    }
    
    // Verificar se a comanda tem itens (opcional)
    const itemsCount = await selectOneQuery(
      `SELECT COUNT(*) as total FROM order_items WHERE order_id = ?`,
      [id]
    );
    
    // Iniciar transação
    await executeQuery('BEGIN TRANSACTION');
    
    try {
      // Remover itens da comanda primeiro
      await executeQuery('DELETE FROM order_items WHERE order_id = ?', [id]);
      
      // Cancelar/Deletar a comanda
      // Opção 1: Deletar permanentemente
      await executeQuery('DELETE FROM orders WHERE id = ?', [id]);
      
      // Opção 2: Apenas atualizar status (se preferir manter histórico)
      // await executeQuery(
      //   `UPDATE orders SET status = 'cancelada' WHERE id = ?`,
      //   [id]
      // );
      
      // Commit da transação
      await executeQuery('COMMIT');
      
      return {
        success: true,
        message: `Comanda ${order.order_number} cancelada com sucesso`,
        order_id: id,
        order_number: order.order_number,
        items_removed: itemsCount?.total || 0
      };
      
    } catch (error) {
      // Rollback em caso de erro
      await executeQuery('ROLLBACK');
      throw error;
    }
    
  } catch (error) {
    console.error('❌ Erro no cancelComanda:', error);
    return { 
      success: false, 
      error: error.message || "Erro ao cancelar comanda" 
    };
  }
},


getHistorySales: async (
  clientId: number | null,
  barberId: number | null,
  start: string,
  end: string
) => {
  try {
    let query = `
      SELECT 
        o.id,
        o.order_number,
        o.total_final,
        o.opened_at,
        u.name AS barber_name,
        c.name AS client_name,
        o.discount,
        o.payment_method,
        o.total as total_original
      FROM orders o
      LEFT JOIN barbers u ON u.id = o.barber_id
      LEFT JOIN clients c ON c.id = o.client_id
      WHERE o.status = 'finalizada'
    `;
    
    const params: any[] = [];
    
    if (start) {
      query += " AND date(o.opened_at) >= ?";
      params.push(start);
    }
    
    if (end) {
      query += " AND date(o.opened_at) <= ?";
      params.push(end);
    }
    
    if (barberId) {
      query += " AND o.barber_id = ?";
      params.push(barberId);
    }
    
    if (clientId) {
      query += " AND o.client_id = ?";
      params.push(clientId);
    }
    
    query += " ORDER BY o.opened_at DESC";
    
    const rows = await selectQuery(query, params);
    
    // Formatar os dados
    const data = rows.map(row => ({
      id: row.id,
      order_number: row.order_number,
      total_final: row.total_final || 0,
      opened_at: row.opened_at,
      barber_name: row.barber_name || 'Não informado',
      client_name: row.client_name || 'Não informado',
      discount: row.discount || 0,
      payment_method: row.payment_method || 'Não informado',
      total_original: row.total_original || 0,
      data_formatada: new Date(row.opened_at).toLocaleDateString('pt-BR'),
      valor_formatado: `R$ ${(row.total_final || 0).toFixed(2)}`
    }));
    
    return {
      success: true,
      data: data,
      total: data.length,
      total_vendas: data.reduce((sum, item) => sum + (item.total_final || 0), 0)
    };
  } catch (error) {
    console.error('Erro no getHistorySales:', error);
    return { 
      success: false, 
      error: "Erro ao buscar histórico de vendas", 
      data: [] 
    };
  }
},

getSumaryToday: async (): Promise<any> => {
  try {
    const userEmail = await AsyncStorage.getItem('userEmail');
    
    if (!userEmail) {
      return { error: "Usuário não encontrado", summary: [] };
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    // Buscar apenas agendamentos do usuário logado
    const result = await selectQuery(
      `SELECT 
        COUNT(DISTINCT a.id) as total_clients,
        COALESCE(SUM(bs.price), 0) as total_revenue
       FROM appointments a
       LEFT JOIN barber_services bs ON bs.service_id = a.service_id AND bs.barber_id = a.barber_id
       WHERE DATE(a.datetime) = ? AND a.user_email = ? AND a.status != 'cancelled'`,
      [today, userEmail]
    );
    
    const summary = result[0] || { total_clients: 0, total_revenue: 0 };
    
    return [{
      date: today,
      total_clients: summary.total_clients,
      total_revenue: summary.total_revenue
    }];
  } catch (error) {
    console.error('Erro no getSumaryToday:', error);
    return [{
      date: new Date().toISOString().split('T')[0],
      total_clients: 0,
      total_revenue: 0
    }];
  }
},

// Adicionar na API
getCurrentUser: async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    const userEmail = await AsyncStorage.getItem('userEmail');
    
    if (!token || !userEmail) {
      return { success: false, error: "Usuário não logado", user: null };
    }
    
    const user = await selectOneQuery(
      'SELECT id, name, email, avatar FROM users WHERE token = ? AND email = ?',
      [token, userEmail]
    );
    
    if (!user) {
      return { success: false, error: "Sessão inválida", user: null };
    }
    
    return { success: true, user: user };
  } catch (error) {
    console.error('Erro no getCurrentUser:', error);
    return { success: false, error: "Erro ao buscar usuário", user: null };
  }
},
  // ========== ORDERS ==========
  getOrders: async () => {
    return await selectQuery(
      `SELECT o.id, c.name as client_name, o.status, o.opened_at, o.order_number
       FROM orders o
       JOIN clients c ON c.id = o.client_id
       WHERE o.status = 'aberta'
       ORDER BY o.id`
    );
  },

  getOrder: async (id: number): Promise<any> => {
  try {
    // Validação
    if (!id) {
      return { error: "ID da comanda é obrigatório", items: [], total: 0, status: null };
    }
    
    // Buscar informações da comanda
    const order = await selectOneQuery(
      `SELECT total, status FROM orders WHERE id = ?`,
      [id]
    );
    
    if (!order) {
      return { error: "Comanda não encontrada", items: [], total: 0, status: null };
    }
    
    // Buscar itens da comanda
    const items = await selectQuery(
      `SELECT 
        oi.id AS item_id,
        oi.qtd,
        oi.price AS item_price,
        (oi.qtd * oi.price) AS subtotal,
        s.id AS service_id,
        s.name AS service_name,
        COALESCE(bs.price, 0) AS barber_price,
        COALESCE(bs.duration, 0) AS duration,
        b.id AS barber_id,
        b.name AS barber_name,
        oi.order_id
      FROM order_items oi
      JOIN services s ON s.id = oi.service_id
      JOIN orders o ON o.id = oi.order_id
      LEFT JOIN barber_services bs ON bs.service_id = s.id AND bs.barber_id = o.barber_id
      LEFT JOIN barbers b ON b.id = o.barber_id
      WHERE oi.order_id = ?`,
      [id]
    );
    
    // Formatar os itens
    const formattedItems = items.map(item => ({
      item_id: item.item_id,
      qtd: item.qtd,
      item_price: item.item_price,
      subtotal: item.subtotal,
      service_id: item.service_id,
      service_name: item.service_name,
      barber_price: item.barber_price,
      duration: item.duration,
      barber_id: item.barber_id,
      barber_name: item.barber_name,
      order_id: item.order_id
    }));
    
    return {
      items: formattedItems,
      total: order.total || 0,
      status: order.status
    };
    
  } catch (error) {
    console.error('Erro no getOrder:', error);
    return { 
      error: "Erro ao buscar itens da comanda", 
      items: [], 
      total: 0, 
      status: null 
    };
  }
},

  getOrdersSeach: async (): Promise<any> => {
  try {
    const orders = await selectQuery(
      `SELECT 
        o.id,
        o.order_number,
        o.client_id,
        c.name as client_name,
        o.barber_id,
        b.name as barber_name,
        o.opened_at,
        o.status,
        o.total,
        o.discount,
        o.payment_method,
        o.total_final,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as items_count
       FROM orders o
       LEFT JOIN clients c ON o.client_id = c.id
       LEFT JOIN barbers b ON o.barber_id = b.id
       WHERE o.status = 'aberta'
       ORDER BY o.opened_at DESC`
    );
    
    return { 
      success: true, 
      data: orders,
      error: ""
    };
  } catch (error) {
    console.error('Erro no getOrdersSeach:', error);
    return { 
      success: false, 
      data: [], 
      error: "Erro ao buscar pedidos" 
    };
  }
},

  getOrderById: async (id: number) => {
    return await selectOneQuery('SELECT * FROM orders WHERE id = ?', [id]);
  },

getOrderByNumber: async (orderNumber: number) => {
  try {
    if (!orderNumber || orderNumber.trim() === '') {
      return { success: false, error: "Número da comanda é obrigatório", data: null };
    }
    
    const order = await selectOneQuery(
      `SELECT o.*, c.name as client_name, b.name as barber_name
       FROM orders o
       LEFT JOIN clients c ON o.client_id = c.id
       LEFT JOIN barbers b ON o.barber_id = b.id
       WHERE o.order_number = ? AND o.status = 'aberta'`,
      [orderNumber]
    );
    
    if (!order) {
      return { success: false, error: "Comanda não encontrada ou já finalizada", data: null };
    }
    
    return { success: true, data: order };
  } catch (error) {
    console.error('Erro no getOrderByNumber:', error);
    return { success: false, error: "Erro ao buscar comanda", data: null };
  }
},

  createOrder: async (data: { client_id: number; barber_id?: number; order_number: string }) => {
    const result = await executeQuery(
      'INSERT INTO orders (client_id, barber_id, order_number, status, opened_at) VALUES (?, ?, ?, "aberta", datetime("now"))',
      [data.client_id, data.barber_id || null, data.order_number]
    );
    return { id: result.insertId, ...data };
  },

  cancelOrder: async (orderId: number) => {
    await executeQuery('DELETE FROM orders WHERE id = ?', [orderId]);
    return { success: true };
  },

  getOrderItems: async (orderId: number) => {
    return await selectQuery(
      `SELECT oi.*, s.name as service_name FROM order_items oi 
       JOIN services s ON oi.service_id = s.id WHERE oi.order_id = ?`,
      [orderId]
    );
  },

  addOrderItem: async (data: { order_id: number; service_id: number; qtd: number; price: number }) => {
    const result = await executeQuery(
      'INSERT INTO order_items (order_id, service_id, qtd, price) VALUES (?, ?, ?, ?)',
      [data.order_id, data.service_id, data.qtd, data.price]
    );
    
    await executeQuery(
      `UPDATE orders SET total = (SELECT COALESCE(SUM(price * qtd), 0) FROM order_items WHERE order_id = ?) WHERE id = ?`,
      [data.order_id, data.order_id]
    );
    
    return { id: result.insertId, ...data };
  },

  deleteOrderItem: async (itemId: number) => {
    const item = await selectOneQuery('SELECT order_id FROM order_items WHERE id = ?', [itemId]);
    if (item) {
      await executeQuery('DELETE FROM order_items WHERE id = ?', [itemId]);
      await executeQuery(
        `UPDATE orders SET total = (SELECT COALESCE(SUM(price * qtd), 0) FROM order_items WHERE order_id = ?) WHERE id = ?`,
        [item.order_id, item.order_id]
      );
    }
    return { success: true };
  },

  createOrcamento: async (data: {
  client_id: number;
  barber_id?: number;
}): Promise<any> => {
  try {
    // Validações
    if (!data.client_id) {
      return { success: false, error: "client_id é obrigatório" };
    }
    
    // Verificar se o cliente existe
    const client = await selectOneQuery('SELECT id, name FROM clients WHERE id = ?', [data.client_id]);
    if (!client) {
      return { success: false, error: "Cliente não encontrado" };
    }
    
    // Verificar se o barbeiro existe (se foi informado)
    let barberName = null;
    if (data.barber_id) {
      const barber = await selectOneQuery('SELECT id, name FROM barbers WHERE id = ?', [data.barber_id]);
      if (!barber) {
        return { success: false, error: "Barbeiro não encontrado" };
      }
      barberName = barber.name;
    }
    
    // Gerar número do orçamento
    const orderNumber = await generateOrderNumber();
    
    // Data atual
    const now = new Date();
    const openedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    // Inserir orçamento
    const result = await executeQuery(
      `INSERT INTO orders (
        client_id, 
        barber_id, 
        order_number, 
        status, 
        total, 
        total_final, 
        discount,
        opened_at
      ) VALUES (?, ?, ?, 'aberta', 0, 0, 0, ?)`,
      [data.client_id, data.barber_id || null, orderNumber, openedAt]
    );
    
    const orderId = result.insertId;
    
    return {
      success: true,
      message: "Orçamento criado com sucesso",
      order_id: orderId,
      order_number: orderNumber,
      opened_at: openedAt,
      client: {
        id: client.id,
        name: client.name
      },
      barber: data.barber_id ? {
        id: data.barber_id,
        name: barberName
      } : null
    };
    
  } catch (error) {
    console.error('❌ Erro no createOrcamento:', error);
    return { success: false, error: "Erro ao criar orçamento" };
  }
},

 finalizarComanda: async (order_number: string, forma_pagamento: string, desconto: number, nomeCliente: string) => {
  try {
    // Validações
    if (!order_number) {
      return { success: false, error: "Número da comanda é obrigatório" };
    }
    if (!forma_pagamento) {
      return { success: false, error: "Forma de pagamento é obrigatória" };
    }
    
    const descontoValue = Number(desconto) || 0;
    
    // Buscar comanda aberta
    const order = await selectOneQuery(
      `SELECT id, barber_id, status, total 
       FROM orders 
       WHERE order_number = ? AND status = 'aberta'
       ORDER BY opened_at DESC
       LIMIT 1`,
      [order_number]
    );
    
    if (!order) {
      return { success: false, error: "Nenhuma comanda aberta com este número" };
    }
    
    const orderId = order.id;
    const barberId = order.barber_id;
    
    // Buscar itens da comanda
    const items = await selectQuery(
      `SELECT price, qtd FROM order_items WHERE order_id = ?`,
      [orderId]
    );
    
    // Calcular total
    let total = 0;
    for (const item of items) {
      total += (item.price || 0) * (item.qtd || 0);
    }
    
    const totalFinal = Math.max(0, total - descontoValue);
    
    // Iniciar transação
    await executeQuery('BEGIN TRANSACTION');
    
    try {
      // Atualizar comanda
      const updateResult = await executeQuery(
        `UPDATE orders
         SET status = 'finalizada',
             total = ?,
             discount = ?,
             total_final = ?,
             payment_method = ?
         WHERE id = ? AND status = 'aberta'`,
        [total, descontoValue, totalFinal, forma_pagamento, orderId]
      );
      
      if (updateResult.changes === 0) {
        await executeQuery('ROLLBACK');
        return { success: false, error: "Comanda já está finalizada ou cancelada" };
      }
      
      // Inserir no fluxo de caixa
      await executeQuery(
        `INSERT INTO cashflow (barber_id, type, description, amount, datetime, payment_method)
         VALUES (?, 'entrada', ?, ?, datetime('now'), ?)`,
        [
          barberId || null,
          `Comanda ${order_number} - ${nomeCliente || 'Cliente'}`,
          totalFinal,
          forma_pagamento
        ]
      );
      
      // Commit da transação
      await executeQuery('COMMIT');
      
      return {
        success: true,
        order_id: orderId,
        order_number: order_number,
        barber_id: barberId,
        total_original: total,
        desconto: descontoValue,
        total_final: totalFinal,
        forma_pagamento: forma_pagamento,
        fluxo_registrado: true,
        status: "finalizada"
      };
      
    } catch (error) {
      // Rollback em caso de erro
      await executeQuery('ROLLBACK');
      throw error;
    }
    
  } catch (error) {
    console.error('Erro no finalizarComanda:', error);
    return { 
      success: false, 
      error: "Erro ao finalizar comanda",
      message: (error instanceof Error) ? error.message : String(error)
    };
  }
},


createOrderItem: async (data: {
  comanda_id: number;
  service_id: number;
  client_id: number;
  barber_id: number;
  qtd: number;
}): Promise<any> => {
  try {
    console.log('📝 Criando item com dados:', data);
    
    // Validações - CORREÇÃO: acessar diretamente os campos
    if (!data.comanda_id) {
      return { success: false, error: "comanda_id é obrigatório" };
    }
    if (!data.service_id) {
      return { success: false, error: "service_id é obrigatório" };
    }
    if (!data.barber_id) {
      return { success: false, error: "barber_id é obrigatório" };
    }
    
    const qtd = data.qtd || 1;
    
    // Verificar se a comanda existe e está aberta
    const order = await selectOneQuery(
      'SELECT id, status, total FROM orders WHERE id = ?',
      [data.comanda_id]
    );
    
    if (!order) {
      return { success: false, error: "Comanda não encontrada" };
    }
    
    if (order.status !== 'aberta') {
      return { success: false, error: "Comanda não está aberta" };
    }
    
    // Buscar preço do serviço para este barbeiro
    const barberService = await selectOneQuery(
      `SELECT price, duration 
       FROM barber_services 
       WHERE barber_id = ? AND service_id = ?`,
      [data.barber_id, data.service_id]
    );
    
    if (!barberService) {
      return { success: false, error: "Serviço não encontrado para este barbeiro" };
    }
    
    const price = barberService.price;
    const totalItem = price * qtd;
    
    // Inserir item na comanda - CORREÇÃO: usar data.comanda_id diretamente
    const result = await executeQuery(
      `INSERT INTO order_items (order_id, service_id, qtd, price) 
       VALUES (?, ?, ?, ?)`,
      [data.comanda_id, data.service_id, qtd, price]
    );
    
    console.log('✅ Item inserido com ID:', result.insertId);
    
    // Atualizar total da comanda
    await executeQuery(
      `UPDATE orders 
       SET total = (
         SELECT COALESCE(SUM(price * qtd), 0)
         FROM order_items
         WHERE order_id = ?
       )
       WHERE id = ?`,
      [data.comanda_id, data.comanda_id]
    );
    
    // Buscar o novo total atualizado
    const updatedOrder = await selectOneQuery(
      'SELECT total FROM orders WHERE id = ?',
      [data.comanda_id]
    );
    
    return {
      success: true,
      message: "Item adicionado com sucesso",
      item_id: result.insertId,
      item_total: totalItem,
      price_unitario: price,
      qtd: qtd,
      novo_total: updatedOrder?.total || 0
    };
    
  } catch (error) {
    console.error('❌ Erro no createOrderItem:', error);
    return { success: false, error: "Erro ao adicionar item" };
  }
},

  // ========== CASHFLOW ==========
  getCashflowDaily: async () => {
    const today = new Date().toISOString().split('T')[0];
    return await selectQuery('SELECT * FROM cashflow WHERE DATE(datetime) = ? ORDER BY datetime DESC', [today]);
  },

  getFluxoMensal: async (date: string) => {
  try {
    // Se não fornecer data, usa o mês atual
    let mes = date;
    if (!mes) {
      const now = new Date();
      mes = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }
    
   
    
    // Buscar dados agrupados por dia
    const resultados = await selectQuery(
      `SELECT 
        strftime('%d', datetime) AS dia,
        COALESCE(SUM(CASE WHEN type = 'entrada' THEN amount ELSE 0 END), 0) AS entradas,
        COALESCE(SUM(CASE WHEN type = 'saida' THEN amount ELSE 0 END), 0) AS saidas,
        COALESCE(SUM(CASE WHEN type = 'entrada' THEN amount ELSE -amount END), 0) AS liquido
       FROM cashflow
       WHERE strftime('%Y-%m', datetime) = ?
       GROUP BY dia
       ORDER BY dia`,
      [mes]
    );
    
    // Calcular totais
    let total_entradas = 0;
    let total_saidas = 0;
    let total_liquido = 0;
    
    const dias = resultados.map(row => {
      const entradas = Number(row.entradas) || 0;
      const saidas = Number(row.saidas) || 0;
      const liquido = Number(row.liquido) || 0;
      
      total_entradas += entradas;
      total_saidas += saidas;
      total_liquido += liquido;
      
      return {
        dia: row.dia,
        entradas: entradas,
        saidas: saidas,
        liquido: liquido,
        entradas_formatado: `R$ ${entradas.toFixed(2)}`,
        saidas_formatado: `R$ ${saidas.toFixed(2)}`,
        liquido_formatado: `R$ ${liquido.toFixed(2)}`
      };
    });
    
    return {
      success: true,
      mes: mes,
      total_entradas: total_entradas,
      total_saidas: total_saidas,
      total_liquido: total_liquido,
      total_entradas_formatado: `R$ ${total_entradas.toFixed(2)}`,
      total_saidas_formatado: `R$ ${total_saidas.toFixed(2)}`,
      total_liquido_formatado: `R$ ${total_liquido.toFixed(2)}`,
      dias: dias,
      total_dias: dias.length
    };
  } catch (error) {
    console.error('Erro no getFluxoMensal:', error);
    return {
      success: false,
      error: "Erro ao buscar fluxo de caixa mensal",
      total_entradas: 0,
      total_saidas: 0,
      total_liquido: 0,
      dias: []
    };
  }
},

getCashflowReport: async (month: number, year: number) => {
  try {
    // Validações
    if (!month || month < 1 || month > 12) {
      return { 
        success: false, 
        error: "Mês inválido", 
        entradas: [], 
        saidas: [], 
        saldo: 0 
      };
    }
    
    if (!year || year < 2000 || year > 2100) {
      return { 
        success: false, 
        error: "Ano inválido", 
        entradas: [], 
        saidas: [], 
        saldo: 0 
      };
    }
    
    const mesString = String(month).padStart(2, '0');
    const anoString = String(year);
    
    
    
    // Buscar entradas por categoria
    const entradasResult = await selectQuery(
      `SELECT description, SUM(amount) as total
       FROM cashflow
       WHERE type = 'entrada'
         AND strftime('%m', datetime) = ?
         AND strftime('%Y', datetime) = ?
       GROUP BY description
       ORDER BY total DESC`,
      [mesString, anoString]
    );
    
    // Buscar saídas por categoria
    const saidasResult = await selectQuery(
      `SELECT description, SUM(amount) as total
       FROM cashflow
       WHERE type = 'saida'
         AND strftime('%m', datetime) = ?
         AND strftime('%Y', datetime) = ?
       GROUP BY description
       ORDER BY total DESC`,
      [mesString, anoString]
    );
    
    // Formatar entradas
    const entradas = entradasResult.map(item => ({
      categoria: item.description,
      valor: item.total,
      valor_formatado: `R$ ${(item.total || 0).toFixed(2)}`
    }));
    
    // Formatar saídas
    const saidas = saidasResult.map(item => ({
      categoria: item.description,
      valor: item.total,
      valor_formatado: `R$ ${(item.total || 0).toFixed(2)}`
    }));
    
    // Calcular totais
    const total_entradas = entradas.reduce((sum, item) => sum + (item.valor || 0), 0);
    const total_saidas = saidas.reduce((sum, item) => sum + (item.valor || 0), 0);
    const saldo = total_entradas - total_saidas;
    

    
    return {
      success: true,
      mes: month,
      ano: year,
      entradas: entradas,
      saidas: saidas,
      total_entradas: total_entradas,
      total_saidas: total_saidas,
      saldo: saldo,
      total_entradas_formatado: `R$ ${total_entradas.toFixed(2)}`,
      total_saidas_formatado: `R$ ${total_saidas.toFixed(2)}`,
      saldo_formatado: `R$ ${saldo.toFixed(2)}`,
      total_entradas_count: entradas.length,
      total_saidas_count: saidas.length
    };
  } catch (error) {
    console.error('❌ Erro no getCashflowReport:', error);
    return { 
      success: false,
      error: "Erro ao buscar relatório financeiro", 
      entradas: [], 
      saidas: [], 
      saldo: 0 
    };
  }
},

  addCashflow: async (data: { barber_id?: number; type: string; description: string; amount: number; datetime: string }) => {
    const result = await executeQuery(
      'INSERT INTO cashflow (barber_id, type, description, amount, datetime) VALUES (?, ?, ?, ?, ?)',
      [data.barber_id || null, data.type, data.description, data.amount, data.datetime]
    );
    return { id: result.insertId, ...data };
  },

  createCashflowExit: async (data: {
  descricao: string;
  valor: number;
  tipo: string;
  date: string;
}): Promise<any> => {
  try {
    // Validações
    if (!data.descricao || data.descricao.trim() === '') {
      return { success: false, error: "Descrição é obrigatória" };
    }
    
    if (!data.valor || data.valor <= 0) {
      return { success: false, error: "Valor deve ser maior que zero" };
    }
    
    if (!data.tipo || (data.tipo !== 'entrada' && data.tipo !== 'saida')) {
      return { success: false, error: "Tipo deve ser 'entrada' ou 'saida'" };
    }
    
    if (!data.date) {
      return { success: false, error: "Data é obrigatória" };
    }
    
    // Validar formato da data
    const dateRegex = /^\d{4}-\d{2}-\d{2}/;
    if (!dateRegex.test(data.date)) {
      return { success: false, error: "Formato de data inválido. Use YYYY-MM-DD" };
    }
    
    // Inserir no fluxo de caixa
    const result = await executeQuery(
      `INSERT INTO cashflow (type, description, amount, datetime) 
       VALUES (?, ?, ?, datetime('now'))`,
      [data.tipo, data.descricao.trim(), data.valor, data.date]
    );
    
    return {
      success: true,
      message: "Lançamento salvo com sucesso!",
      id: result.insertId,
      cashflow: {
        id: result.insertId,
        descricao: data.descricao,
        valor: data.valor,
        tipo: data.tipo,
        data: data.date
      }
    };
  } catch (error) {
    console.error('Erro no createCashflowExit:', error);
    return { 
      success: false, 
      error: "Erro ao salvar lançamento" 
    };
  }
},

  getFluxoDiario: async () => {
  try {
    const hoje = new Date().toISOString().split('T')[0];
    
    // Buscar transações do dia
    const transacoes = await selectQuery(
      `SELECT id, description, amount, type, datetime, payment_method
       FROM cashflow 
       WHERE DATE(datetime) = ? 
       ORDER BY datetime DESC`,
      [hoje]
    );
    
    // Calcular entradas e saídas
    let entradas = 0;
    let saidas = 0;
    
    const transacoesFormatadas = transacoes.map(transacao => {
      if (transacao.type === 'entrada') {
        entradas += transacao.amount || 0;
      } else if (transacao.type === 'saida') {
        saidas += transacao.amount || 0;
      }
      
      return {
        id: transacao.id,
        descricao: transacao.description,
        valor: transacao.amount,
        tipo: transacao.type,
        data: transacao.datetime,
        payment_method: transacao.payment_method || null
      };
    });
    
    const saldo = entradas - saidas;
    
    return {
      success: true,
      entradas: entradas,
      saidas: saidas,
      saldo: saldo,
      transacoes: transacoesFormatadas,
      data: hoje,
      total_transacoes: transacoesFormatadas.length
    };
  } catch (error) {
    console.error('Erro no getFluxoDiario:', error);
    return {
      success: false,
      error: "Erro ao buscar fluxo de caixa diário",
      entradas: 0,
      saidas: 0,
      saldo: 0,
      transacoes: []
    };
  }
},


  getPackages: async () => {
    const packages = await selectQuery('SELECT * FROM packages');
    const result = [];
    for (const pkg of packages) {
      const services = await selectQuery(
        `SELECT s.id, s.name FROM package_services ps JOIN services s ON ps.service_id = s.id WHERE ps.package_id = ?`,
        [pkg.id]
      );
      result.push({ ...pkg, services });
    }
    return result;
  },

  getPackageSearch: async (name: string) => {
    
    const packages = await selectQuery('SELECT * FROM packages WHERE name LIKE ?', [`%${name.name}%`]);
   
    return packages;
  },

  getPackageById: async (packageId: number) => {
    const pkg = await selectOneQuery('SELECT * FROM packages WHERE id = ?', [packageId]);
    if (pkg) {
      const services = await selectQuery(
        `SELECT s.id, s.name FROM package_services ps JOIN services s ON ps.service_id = s.id WHERE ps.package_id = ?`,
        [packageId]
      );
      return { ...pkg, services };
    }
    return null;
  },

  deletePackage: async (packageId: number) => {
    await executeQuery('DELETE FROM package_services WHERE package_id = ?', [packageId]);
    await executeQuery('DELETE FROM packages WHERE id = ?', [packageId]);
    return { success: true };
  },


  // Buscar todos os pacotes
getAllPackages: async () => {
  try {
    const packages = await selectQuery(
      `SELECT 
        p.id,
        p.name,
        p.price,
        p.duration,
        p.expiration_date
       FROM packages p
       ORDER BY p.name ASC`
    );
    
    // Buscar serviços de cada pacote
    for (const pkg of packages) {
      const services = await selectQuery(
        `SELECT s.id, s.name, s.price, s.duration
         FROM package_services ps
         JOIN services s ON ps.service_id = s.id
         WHERE ps.package_id = ?`,
        [pkg.id]
      );
      pkg.services = services;
    }
    
    return { success: true, data: packages };
  } catch (error) {
    console.error('Erro no getAllPackages:', error);
    return { success: false, error: "Erro ao buscar pacotes", data: [] };
  }
},

// Criar pacote
setPackage: async (data: { 
  name: string; 
  price: number; 
  duration: number; 
  expiration_date: string;
}) => {
  try {
    if (!data.name || data.name.trim() === '') {
      return { success: false, error: "Nome do pacote é obrigatório" };
    }
    
    if (!data.price || data.price <= 0) {
      return { success: false, error: "Preço deve ser maior que zero" };
    }
    
    // Inserir pacote
    const result = await executeQuery(
      `INSERT INTO packages (name, price, duration, expiration_date) 
       VALUES (?, ?, ?, ?)`,
      [data.name.trim(), data.price, data.duration || 0, data.expiration_date || null]
    );
    
    const packageId = result.insertId;
    
    
    return { 
      success: true, 
      id: packageId,
      message: "Pacote criado com sucesso"
    };
  } catch (error) {
    console.error('Erro no setPackage:', error);
    return { success: false, error: "Erro ao criar pacote" };
  }
},

// Adicione na sua API
logoutUser: async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    
    if (token) {
      // Limpar token no banco local
      await executeQuery('UPDATE users SET token = NULL WHERE token = ?', [token]);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Erro no logout:', error);
    return { success: false, error: "Erro ao fazer logout" };
  }
},

updatePackages: async (data: { 
  id: number; 
  name: string; 
  price: number; 
  duration: number; 
  expiration_date: string;
}) => {
  try {
    if (!data.id) {
      return { success: false, error: "ID do pacote é obrigatório" };
    }
    
    if (!data.name || data.name.trim() === '') {
      return { success: false, error: "Nome do pacote é obrigatório" };
    }
    
    if (!data.price || data.price <= 0) {
      return { success: false, error: "Preço deve ser maior que zero" };
    }
    
    const existing = await selectOneQuery('SELECT id FROM packages WHERE id = ?', [data.id]);
    if (!existing) {
      return { success: false, error: "Pacote não encontrado" };
    }
    
    await executeQuery(
      `UPDATE packages 
       SET name = ?, price = ?, duration = ?, expiration_date = ? 
       WHERE id = ?`,
      [
        data.name.trim(),
        data.price,
        data.duration || 0,
        data.expiration_date || null,
        data.id
      ]
    );
    
    return { 
      success: true, 
      message: "Pacote atualizado com sucesso" 
    };
  } catch (error) {
    console.error('Erro no updatePackages:', error);
    return { success: false, error: "Erro ao atualizar pacote" };
  }
},

// // Deletar pacote
// deletePackage: async (packageId: number) => {
//   try {
//     const existing = await selectOneQuery('SELECT id FROM packages WHERE id = ?', [packageId]);
//     if (!existing) {
//       return { success: false, error: "Pacote não encontrado" };
//     }
    
//     // Deletar relações primeiro
//     await executeQuery('DELETE FROM package_services WHERE package_id = ?', [packageId]);
    
//     // Deletar pacote
//     await executeQuery('DELETE FROM packages WHERE id = ?', [packageId]);
    
//     return { success: true, message: "Pacote excluído com sucesso" };
//   } catch (error) {
//     console.error('Erro no deletePackage:', error);
//     return { success: false, error: "Erro ao excluir pacote" };
//   }
// },



  // ========== PROFILE ==========
// Buscar perfil do usuário
getProfile: async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    const userEmail = await AsyncStorage.getItem('userEmail');
    
    if (!token || !userEmail) {
      return { error: "Token não fornecido", name: "", email: "", avatar: "" };
    }
    
    const user = await selectOneQuery(
      'SELECT name, email, avatar FROM users WHERE token = ? AND email = ?',
      [token, userEmail]
    );
    
    if (!user) {
      return { error: "Usuário não encontrado", name: "", email: "", avatar: "" };
    }
    
    return { 
      name: user.name, 
      email: user.email, 
      avatar: user.avatar || '' 
    };
  } catch (error) {
    console.error('Erro no getProfile:', error);
    return { error: "Erro ao buscar perfil", name: "", email: "", avatar: "" };
  }
},

// Atualizar perfil completo (com avatar)
updateProfile: async (data: { 
  name: string; 
  email: string; 
  avatar?: string 
}) => {
  try {
    const { name, email, avatar } = data;
    
    if (!name || name.trim() === '') {
      return { success: false, error: "Nome é obrigatório" };
    }
    
    if (!email || email.trim() === '') {
      return { success: false, error: "Email é obrigatório" };
    }
    
    const token = await AsyncStorage.getItem('token');
    const userEmail = await AsyncStorage.getItem('userEmail');
    
    if (!token || !userEmail) {
      return { success: false, error: "Usuário não está logado" };
    }
    
    const user = await selectOneQuery(
      'SELECT id FROM users WHERE token = ? AND email = ?',
      [token, userEmail]
    );
    
    if (!user) {
      return { success: false, error: "Usuário não encontrado" };
    }
    
    // Verificar email duplicado
    if (email !== userEmail) {
      const existingUser = await selectOneQuery(
        'SELECT id FROM users WHERE email = ? AND email != ?',
        [email.trim(), userEmail]
      );
      if (existingUser) {
        return { success: false, error: "Este email já está em uso" };
      }
    }
    
    // Atualizar usuário
    await executeQuery(
      'UPDATE users SET name = ?, email = ?, avatar = ? WHERE token = ? AND email = ?',
      [name.trim(), email.trim(), avatar || null, token, userEmail]
    );
    
    // Atualizar AsyncStorage
    if (email !== userEmail) {
      await AsyncStorage.setItem('userEmail', email.trim());
    }
    
    return { 
      success: true, 
      message: "Perfil atualizado com sucesso",
      user: { name, email, avatar }
    };
  } catch (error) {
    console.error('Erro no updateProfile:', error);
    return { success: false, error: "Erro ao atualizar perfil" };
  }
},


// Adicione estes métodos na API para suportar backup
getAllDataForBackup: async () => {
  try {
    const barbers = await selectQuery('SELECT * FROM barbers');
    const clients = await selectQuery('SELECT * FROM clients');
    const services = await selectQuery('SELECT * FROM services');
    const appointments = await selectQuery('SELECT * FROM appointments');
    const products = await selectQuery('SELECT * FROM products');
    const orders = await selectQuery('SELECT * FROM orders');
    
    return {
      barbers,
      clients,
      services,
      appointments,
      products,
      orders
    };
  } catch (error) {
    console.error('Erro ao buscar dados para backup:', error);
    return null;
  }
},


  // ========== DASHBOARD ==========
  getBarbersReport: async () => {
    return await selectQuery(
      `SELECT u.id, u.name, COUNT(o.id) as atendimentos, SUM(o.total_final) as total_vendido, AVG(o.total_final) as ticket_medio
       FROM orders o
       JOIN users u ON u.id = o.barber_id
       WHERE o.status = 'finalizada'
       GROUP BY u.id`
    );
  }
};

export default Api;

// Função para gerar número do orçamento no formato ORC-ANO-SEQ
const generateOrderNumber = async (): Promise<string> => {
  try {
    const currentYear = new Date().getFullYear();
    
    // Contar quantos pedidos existem no ano atual
    const result = await selectOneQuery(
      `SELECT COUNT(*) as total 
       FROM orders 
       WHERE strftime('%Y', opened_at) = ?`,
      [String(currentYear)]
    );
    
    const count = result?.total || 0;
    const sequence = count + 1;
    const sequenceFormatted = String(sequence).padStart(3, '0');
    
    return `ORC-${currentYear}-${sequenceFormatted}`;
  } catch (error) {
    console.error('Erro ao gerar número do orçamento:', error);
    // Fallback: usar timestamp
    return `ORC-${new Date().getFullYear()}-${Date.now()}`;
  }
};

// Função para gerar horários padrão (08:00 às 20:00 com intervalos de 30 minutos)
const generateDefaultHours = () => {
  const hours = [];
  const startHour = 8;
  const endHour = 20;
  
  for (let h = startHour; h < endHour; h++) {
    hours.push({
      time: `${String(h).padStart(2, '0')}:00`,
      active: false, // disponível
      is_available: true,
      is_booked: false
    });
    hours.push({
      time: `${String(h).padStart(2, '0')}:30`,
      active: false,
      is_available: true,
      is_booked: false
    });
  }
  
  return hours;
};


// Verificar se o horário está ocupado
const checkSlotUnavailable = async (barberId: number, datetime: string): Promise<boolean> => {
  try {
    // Verificar se existe agendamento no mesmo horário
    const existing = await selectOneQuery(
      `SELECT id FROM appointments 
       WHERE barber_id = ? AND datetime = ? AND status != 'cancelled'`,
      [barberId, datetime]
    );
    
    if (existing) {
      return true;
    }
    
    // Verificar horário personalizado do barbeiro
    const date = datetime.split(' ')[0];
    const time = datetime.split(' ')[1].slice(0, 5);
    
    const customHour = await selectOneQuery(
      `SELECT active FROM barber_custom_hours 
       WHERE barber_id = ? AND date = ? AND time = ?`,
      [barberId, date, time]
    );
    
    if (customHour && customHour.active === 1) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Erro ao verificar disponibilidade:', error);
    return true; // Retorna true em caso de erro (bloqueia)
  }
};

// Liberar slots do agendamento antigo
const releaseAppointmentSlots = async (appointmentId: number) => {
  try {
    const appointment = await selectOneQuery(
      `SELECT barber_id, datetime, duration FROM appointments WHERE id = ?`,
      [appointmentId]
    );
    
    if (appointment) {
      const startDt = new Date(appointment.datetime);
      const endDt = new Date(startDt.getTime() + appointment.duration * 60000);
      const dateStr = appointment.datetime.split(' ')[0];
      let current = startDt;
      
      while (current < endDt) {
        const timeStr = current.toTimeString().slice(0, 5);
        await executeQuery(
          `UPDATE barber_custom_hours 
           SET active = 0 
           WHERE barber_id = ? AND date = ? AND time = ?`,
          [appointment.barber_id, dateStr, timeStr]
        );
        current = new Date(current.getTime() + 30 * 60000);
      }
    }
  } catch (error) {
    console.error('Erro ao liberar slots:', error);
    throw error;
  }
};

// Criar novo agendamento
const createNewAppointment = async (
  clientId: number,
  barberId: number,
  serviceId: number,
  datetime: string,
  userEmail: string,
  duration: number
) => {
  try {
    // Bloquear slots
    const startDt = new Date(datetime);
    const endDt = new Date(startDt.getTime() + duration * 60000);
    const dateStr = datetime.split(' ')[0];
    let current = startDt;
    
    while (current < endDt) {
      const timeStr = current.toTimeString().slice(0, 5);
      await executeQuery(
        `UPDATE barber_custom_hours 
         SET active = 1, updated_at = ? 
         WHERE barber_id = ? AND date = ? AND time = ?`,
        [new Date().toISOString(), barberId, dateStr, timeStr]
      );
      current = new Date(current.getTime() + 30 * 60000);
    }
    
    // Inserir novo agendamento
    const result = await executeQuery(
      `INSERT INTO appointments 
       (client_id, barber_id, service_id, datetime, user_email, duration, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, 'scheduled', datetime('now'))`,
      [clientId, barberId, serviceId, datetime, userEmail, duration]
    );
    
    return result;
  } catch (error) {
    console.error('Erro ao criar novo agendamento:', error);
    throw error;
  }
};

// Registrar histórico
const insertAppointmentHistory = async (appointmentId: number, action: string) => {
  try {
    // Criar tabela de histórico se não existir
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS appointment_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        appointment_id INTEGER,
        action TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await executeQuery(
      `INSERT INTO appointment_history (appointment_id, action, created_at) 
       VALUES (?, ?, datetime('now'))`,
      [appointmentId, action]
    );
  } catch (error) {
    console.error('Erro ao inserir histórico:', error);
    // Não interrompe o fluxo principal
  }
};