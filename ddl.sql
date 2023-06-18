CREATE DATABASE ecommerce

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
	sku VARCHAR NOT NULL UNIQUE,
	name VARCHAR NOT NULL,
	image JSON,
	price VARCHAR NOT NULL,
	description TEXT,
	stock INT,
	created_at TIMESTAMP
);

CREATE TABLE categories (
    id INT PRIMARY KEY,
	name VARCHAR NOT NULL,
	slug VARCHAR NOT NULL
);

CREATE TABLE product_categories (
    id SERIAL PRIMARY KEY,
	sku VARCHAR,
	category_id INT,
	CONSTRAINT fk_sku_category
	FOREIGN KEY(sku)
	REFERENCES products(sku)
		ON DELETE CASCADE
		ON UPDATE CASCADE,
	CONSTRAINT fk_category_id
	FOREIGN KEY(category_id)
	REFERENCES categories(id)
		ON DELETE CASCADE
		ON UPDATE CASCADE
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
	sku VARCHAR,
	qty INT,
	created_at TIMESTAMP,
	CONSTRAINT fk_sku_transaction
	FOREIGN KEY(sku)
	REFERENCES products(sku)
		ON DELETE CASCADE
		ON UPDATE CASCADE
);