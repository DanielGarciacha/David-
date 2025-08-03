CREATE DATABASE emprendeu;

USE emprendeu;

CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    gender ENUM('Masculino', 'Femenino', 'Otro') NOT NULL,
    role_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE usuarios_eliminados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    gender ENUM('Masculino', 'Femenino', 'Otro') NOT NULL,
    role_id INT NOT NULL,
    deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ordenes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    cantidad INT NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES usuarios(id),
    FOREIGN KEY (product_id) REFERENCES productos(id)
);

-- Insertar datos predefinidos en roles
INSERT INTO roles (name) VALUES ('Administrador'), ('Soporte'), ('Usuario');

-- Insertar usuarios predefinidos
INSERT INTO usuarios (full_name, phone, email, password, gender, role_id) VALUES
('Hernando Jose De Moya', '1234567890', 'hernando@example.com', 'password', 'Masculino',1),
('Angel Guzman', '0987654321', 'angel@example.com', 'password', 'Masculino',3),
('Keyner Garcia', '1122334455', 'keyner@example.com', 'password', 'Masculino',2);

-- Insertar productos de prueba
INSERT INTO productos (name, description, price) VALUES
('Vasija de Cerámica', 'Vasija hecha a mano, perfecta para decorar tu hogar.', 45.00),
('Colgante de Madera', 'Un colgante rústico y elegante hecho con madera reciclada.', 15.50),
('Bufanda de Lana', 'Bufanda tejida a mano, ideal para el invierno.', 25.00),
('Pulsera de Cuero', 'Pulsera de cuero genuino con diseño ajustable.', 20.00),
('Bolso de Tela', 'Bolso hecho con materiales reciclados, ideal para el día a día.', 30.00),
('Cuadro Pintado a Mano', 'Cuadro único pintado a mano por artistas locales.', 60.00);
