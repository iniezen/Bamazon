CREATE DATABASE BamazonDB;

USE BamazonDB;

CREATE TABLE Products (
  ItemID INT NOT NULL AUTO_INCREMENT,
  ProductName VARCHAR(100) NOT NULL,
  DepartmentName VARCHAR(45) NOT NULL,
  Price INT,
  StockQuantity INT,
  PRIMARY KEY (ItemID)
);

