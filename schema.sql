DROP DATABASE IF EXISTS product_DB;
CREATE database product_DB;

USE product_DB;

CREATE TABLE topProducts (
  item_id INTEGER(11) AUTO_INCREMENT NOT NULL,
  product_name VARCHAR(100) NULL,
  department_name VARCHAR(100) NULL,
  price DECIMAL(10,4) NULL,
  stock_quantity INTEGER (10) NULL,
  
  PRIMARY KEY (item_id)
);
