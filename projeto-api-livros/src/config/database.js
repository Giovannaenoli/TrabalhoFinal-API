const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../../database.db');
const db = new Database(dbPath);

// Habilitar foreign keys
db.pragma('foreign_keys = ON');

function setupDatabase() {
    // Criar tabelas
    db.exec(`
        CREATE TABLE IF NOT EXISTS autores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            nacionalidade TEXT,
            data_nascimento TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS livros (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            autor_id INTEGER NOT NULL,
            genero TEXT,
            ano_publicacao INTEGER,
            preco REAL,
            estoque INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (autor_id) REFERENCES autores(id)
        );

        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            senha VARCHAR(255) NOT NULL,
            role VARCHAR(20) DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    console.log('Tabelas criadas ou já existentes.');

    // Verificar se já existem dados
    const countAutores = db.prepare('SELECT COUNT(*) as count FROM autores').get().count;
    
    if (countAutores === 0) {
        // Inserir autores
        const insertAutor = db.prepare('INSERT INTO autores (nome, nacionalidade, data_nascimento) VALUES (?, ?, ?)');
        
        const autores = [
            ['Ali Hazelwood', 'Americana', '1990-01-01'],
            ['Sarah J. Maas', 'Americana', '1986-03-05'],
            ['Colleen Hoover', 'Americana', '1985-12-11'],
            ['Rebecca Yarros', 'Americana', '1981-10-29'],
            ['Taylor Jenkins Reid', 'Americana', '1977-07-20'],
            ['Emily Henry', 'Americana', '1989-01-01'],
            ['Talia Hibbert', 'Britânica', '1988-01-01'],
            ['Christina Lauren', 'Americana', '1980-01-01'],
            ['Jasmine Guillory', 'Americana', '1985-01-01'],
            ['Sylvia Moreno-Garcia', 'Mexicana', '1982-07-30']
        ];

        autores.forEach(autor => insertAutor.run(...autor));

        // Inserir livros
        const insertLivro = db.prepare(`
            INSERT INTO livros (titulo, autor_id, genero, ano_publicacao, preco, estoque) 
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        const livros = [
            // Ali Hazelwood
            ['The Love Hypothesis', 1, 'Romance', 2021, 45.90, 15],
            ['Love on the Brain', 1, 'Romance', 2023, 48.50, 12],
            ['The Deal', 1, 'Romance', 2022, 42.00, 18],
            ['Verity', 1, 'Suspense/Romance', 2018, 55.00, 10],
            
            // Sarah J. Maas
            ['A Court of Thorns and Roses', 2, 'Fantasia', 2015, 65.00, 20],
            ['Crescent City', 2, 'Fantasia', 2020, 70.00, 14],
            ['House of Earth and Blood', 2, 'Fantasia', 2020, 68.00, 16],
            ['A Throne of Glass', 2, 'Fantasia', 2012, 62.00, 11],
            
            // Colleen Hoover
            ['It Ends with Us', 3, 'Drama', 2016, 52.00, 25],
            ['Ugly Love', 3, 'Romance', 2014, 48.00, 19],
            ['November 9', 3, 'Romance', 2015, 50.00, 17],
            ['Reminders of Him', 3, 'Drama', 2022, 54.00, 13],
            
            // Rebecca Yarros
            ['Fourth Wing', 4, 'Fantasia', 2023, 75.00, 22],
            ['Iron Widow', 4, 'Ficção Científica', 2022, 70.00, 9],
            ['The Shadows Between Us', 4, 'Fantasia', 2020, 55.00, 15],
            
            // Taylor Jenkins Reid
            ['The Seven Husbands of Evelyn Hugo', 5, 'Ficção Histórica', 2017, 58.00, 18],
            ['Carrie Soto Is Back', 5, 'Ficção', 2022, 60.00, 14],
            ['Daisy Jones & The Six', 5, 'Ficção', 2019, 56.00, 12],
            
            // Emily Henry
            ['Beach Read', 6, 'Romance', 2020, 52.00, 16],
            ['People We Meet on Vacation', 6, 'Romance', 2021, 54.00, 20],
            
            // Talia Hibbert
            ['Get a Life, Chloe Brown', 7, 'Romance', 2019, 50.00, 11],
            ['Take a Hint, Dani Brown', 7, 'Romance', 2019, 50.00, 13],
            
            // Christina Lauren
            ['The Unhoneymooners', 8, 'Romance', 2019, 51.00, 14],
            ['The Hating Game', 8, 'Romance', 2016, 49.00, 17],
            
            // Jasmine Guillory
            ['The Wedding Date', 9, 'Romance', 2018, 48.00, 15],
            ['Royal Holiday', 9, 'Romance', 2019, 50.00, 10],
            
            // Sylvia Moreno-Garcia
            ['Mexican Gothic', 10, 'Horror', 2020, 60.00, 8],
            ['Gods of Jade and Shadow', 10, 'Fantasia', 2019, 58.00, 9]
        ];

        livros.forEach(livro => insertLivro.run(...livro));

        console.log('Dados de exemplo inseridos com sucesso!');
    } else {
        console.log('Banco de dados já contém dados.');
    }
}

module.exports = { db, setupDatabase };
