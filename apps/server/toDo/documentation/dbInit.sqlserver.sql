-- ===================================
-- Database
-- ===================================
USE MASTER;

GO
;

IF EXISTS (
  SELECT
    name
  FROM
    sys.databases
  WHERE
    name = 'mds_api_database'
) BEGIN ALTER DATABASE mds_api_database
SET
  SINGLE_USER WITH ROLLBACK IMMEDIATE;

DROP DATABASE mds_api_database;

END;

CREATE DATABASE mds_api_database;

-- IF EXISTS (
--   SELECT
--     name
--   FROM
--     sys.databases
--   WHERE
--     name = 'mds_api_database_deleted'
-- ) BEGIN ALTER DATABASE mds_api_database_deleted
-- SET
--   SINGLE_USER WITH ROLLBACK IMMEDIATE;
-- DROP DATABASE mds_api_database_deleted;
-- END;
-- CREATE DATABASE mds_api_database_deleted;
GO
;

-- ===================================
-- Create roles
-- ===================================
-- Delete login if exists
IF EXISTS (
  SELECT
    1
  FROM
    sys.server_principals
  WHERE
    name = 'login_admin'
) BEGIN DROP LOGIN login_admin;

END;

IF EXISTS (
  SELECT
    1
  FROM
    sys.server_principals
  WHERE
    name = 'login_customer'
) BEGIN DROP LOGIN login_customer;

END;

IF EXISTS (
  SELECT
    1
  FROM
    sys.server_principals
  WHERE
    name = 'login_supplier'
) BEGIN DROP LOGIN login_supplier;

END;

IF EXISTS (
  SELECT
    1
  FROM
    sys.server_principals
  WHERE
    name = 'login_commercial'
) BEGIN DROP LOGIN login_commercial;

END;

IF EXISTS (
  SELECT
    1
  FROM
    sys.server_principals
  WHERE
    name = 'login_delivery_man'
) BEGIN DROP LOGIN login_delivery_man;

END;

GO
;

-- Create login
CREATE LOGIN login_admin WITH PASSWORD = 'pasS_765_a';

CREATE LOGIN login_customer WITH PASSWORD = 'pasS_765_cu';

CREATE LOGIN login_supplier WITH PASSWORD = 'pasS_765_s';

CREATE LOGIN login_commercial WITH PASSWORD = 'pasS_765_co';

CREATE LOGIN login_delivery_man WITH PASSWORD = 'pasS_765_d';

GO
;

-- Using the new database for all remaining instructions
USE mds_api_database;

-- Delete user if exists
GO
;

IF EXISTS (
  SELECT
    1
  FROM
    sys.database_principals
  WHERE
    name = 'user_admin'
) BEGIN DROP USER user_admin;

END;

IF EXISTS (
  SELECT
    1
  FROM
    sys.database_principals
  WHERE
    name = 'user_customer'
) BEGIN DROP USER user_customer;

END;

IF EXISTS (
  SELECT
    1
  FROM
    sys.database_principals
  WHERE
    name = 'user_supplier'
) BEGIN DROP USER user_supplier;

END;

IF EXISTS (
  SELECT
    1
  FROM
    sys.database_principals
  WHERE
    name = 'user_commercial'
) BEGIN DROP USER user_commercial;

END;

IF EXISTS (
  SELECT
    1
  FROM
    sys.database_principals
  WHERE
    name = 'user_delivery_man'
) BEGIN DROP USER user_delivery_man;

END;

GO
;

-- Create user for customers
CREATE USER user_admin FOR LOGIN login_admin;

CREATE USER user_customer FOR LOGIN login_customer;

CREATE USER user_supplier FOR LOGIN login_supplier;

CREATE USER user_commercial FOR LOGIN login_commercial;

CREATE USER user_delivery_man FOR LOGIN login_delivery_man;

GO
;

-- ===================================
-- Functions
-- ===================================
DROP FUNCTION IF EXISTS dbo.lorem_ipsum;

GO
;

CREATE FUNCTION dbo.lorem_ipsum (@length INT) RETURNS NVARCHAR(MAX) AS BEGIN DECLARE @return NVARCHAR(MAX);

SELECT
  @return = STRING_AGG(text, ' ')
FROM
  (
    SELECT
      TOP (64) text
    FROM
      (
        VALUES
          ('lorem'),
          ('ipsum'),
          ('dolor'),
          ('sit'),
          ('amet'),
          ('consectetur'),
          ('adipiscing'),
          ('elit'),
          ('sed'),
          ('do'),
          ('eiusmod'),
          ('tempor'),
          ('incididunt'),
          ('ut'),
          ('labore'),
          ('et'),
          ('dolore'),
          ('magna'),
          ('aliqua'),
          ('ut'),
          ('enim'),
          ('ad'),
          ('minim'),
          ('veniam'),
          ('quis'),
          ('nostrud'),
          ('exercitation'),
          ('ullamco'),
          ('laboris'),
          ('nisi'),
          ('aliquip'),
          ('ex'),
          ('ea'),
          ('commodo'),
          ('consequat'),
          ('duis'),
          ('aute'),
          ('irure'),
          ('in'),
          ('reprehenderit'),
          ('voluptate'),
          ('velit'),
          ('esse'),
          ('cillum'),
          ('eu'),
          ('fugiat'),
          ('nulla'),
          ('pariatur'),
          ('excepteur'),
          ('sint'),
          ('occaecat'),
          ('cupidatat'),
          ('non'),
          ('proident'),
          ('sunt'),
          ('culpa'),
          ('qui'),
          ('officia'),
          ('deserunt'),
          ('mollit'),
          ('anim'),
          ('id'),
          ('est'),
          ('laborum')
      ) AS a(text)
  ) t;

RETURN UPPER(SUBSTRING(@return, 1, 1)) + SUBSTRING(@return, 2, @length - 1);

END;

GO
;

-- ===================================
-- Drop all table in the right order to properly dismantle Foreign key reference
-- ===================================
DROP TABLE IF EXISTS h_has_specifications;

DROP TABLE IF EXISTS p_product_has_specification;

DROP TABLE IF EXISTS p_product_specification;

DROP TABLE IF EXISTS o_order_contains;

DROP TABLE IF EXISTS c_cart;

DROP TABLE IF EXISTS i_internal_message;

DROP TABLE IF EXISTS c_commercial_handling;

DROP TABLE IF EXISTS c_customer_review;

DROP TABLE IF EXISTS d_delivery;

DROP TABLE IF EXISTS o_order;

DROP TABLE IF EXISTS d_delivery_tour;

DROP TABLE IF EXISTS p_product;

DROP TABLE IF EXISTS p_product_type;

DROP TABLE IF EXISTS u_user;

DROP TABLE IF EXISTS i_image;

-- ===================================
-- Create all table with their property, type and foreign key
-- ===================================
CREATE TABLE u_user(
  u_id_user INT IDENTITY,
  u_role VARCHAR(30) NOT NULL,
  u_registered_at DATETIMEOFFSET NOT NULL,
  u_lastname VARCHAR(50) NOT NULL,
  u_firstname VARCHAR(50) NOT NULL,
  u_mail_adress VARCHAR(100) NOT NULL,
  u_hashed_password VARCHAR(60) NOT NULL,
  u_adress_country VARCHAR(75) NOT NULL,
  u_adress_region_code VARCHAR(20) NOT NULL,
  u_adress_city VARCHAR(75) NOT NULL,
  u_adress_location VARCHAR(75) NOT NULL,
  u_adress_precision VARCHAR(75),
  u_is_deleted BIT NOT NULL,
  PRIMARY KEY(u_id_user)
);

CREATE TABLE o_order(
  o_id_user_order INT IDENTITY,
  o_order_number VARCHAR(20) NOT NULL,
  o_status VARCHAR(30) NOT NULL,
  o_ordered_at DATETIMEOFFSET NOT NULL,
  o_discount MONEY NOT NULL,
  o_final_price MONEY NOT NULL,
  o_delivery_adress_country VARCHAR(75) NOT NULL,
  o_delivery_adress_region_code VARCHAR(20) NOT NULL,
  o_delivery_adress_city VARCHAR(75) NOT NULL,
  o_delivery_adress_location VARCHAR(75) NOT NULL,
  o_delivery_adress_precision VARCHAR(75),
  PRIMARY KEY(o_id_user_order)
);

CREATE TABLE i_internal_message(
  i_id_internal_message INT IDENTITY,
  i_send_at DATETIMEOFFSET NOT NULL,
  i_read_at DATETIMEOFFSET,
  i_message_content VARCHAR(5000) NOT NULL,
  i_id_user_receiver INT NOT NULL,
  i_id_user_sender INT NOT NULL,
  PRIMARY KEY(i_id_internal_message),
  FOREIGN KEY(i_id_user_receiver) REFERENCES u_user(u_id_user),
  FOREIGN KEY(i_id_user_sender) REFERENCES u_user(u_id_user)
);

CREATE TABLE p_product_type(
  p_id_product_type INT IDENTITY,
  p_type_name VARCHAR(50) NOT NULL,
  PRIMARY KEY(p_id_product_type)
);

CREATE TABLE p_product_specification(
  p_id_product_specification INT IDENTITY,
  p_specification_name VARCHAR(100) NOT NULL,
  p_is_specific_value BIT NOT NULL,
  p_possible_value VARCHAR(200),
  PRIMARY KEY(p_id_product_specification)
);

CREATE TABLE i_image(
  i_id_image INT IDENTITY,
  i_image VARBINARY(max) NOT NULL,
  PRIMARY KEY(i_id_image)
);

CREATE TABLE c_commercial_handling(
  c_id_commercial_handling INT IDENTITY,
  c_id_user_handler INT NOT NULL,
  c_id_user_handled INT NOT NULL,
  PRIMARY KEY(c_id_commercial_handling),
  FOREIGN KEY(c_id_user_handler) REFERENCES u_user(u_id_user),
  FOREIGN KEY(c_id_user_handled) REFERENCES u_user(u_id_user)
);

CREATE TABLE d_delivery_tour(
  d_id_delivery_tour INT IDENTITY,
  d_start_at DATETIMEOFFSET NOT NULL,
  d_end_at DATETIMEOFFSET NOT NULL,
  d_id_user INT NOT NULL,
  PRIMARY KEY(d_id_delivery_tour),
  FOREIGN KEY(d_id_user) REFERENCES u_user(u_id_user)
);

CREATE TABLE p_product(
  p_id_product INT IDENTITY,
  p_name VARCHAR(200) NOT NULL,
  p_description VARCHAR(8000) NOT NULL,
  p_price MONEY NOT NULL,
  p_registered_at DATETIMEOFFSET NOT NULL,
  p_is_available BIT NOT NULL,
  p_stock INT NOT NULL,
  p_disable_at DATETIMEOFFSET,
  p_id_product_type INT NOT NULL,
  p_id_user INT NOT NULL,
  PRIMARY KEY(p_id_product),
  FOREIGN KEY(p_id_product_type) REFERENCES p_product_type(p_id_product_type),
  FOREIGN KEY(p_id_user) REFERENCES u_user(u_id_user)
);

CREATE TABLE d_delivery(
  d_id_delivery INT IDENTITY,
  d_delivery_number VARCHAR(50) NOT NULL,
  d_status VARCHAR(30) NOT NULL,
  d_shipped_at DATETIMEOFFSET,
  d_delivered_at DATETIMEOFFSET,
  d_id_delivery_tour INT NOT NULL,
  PRIMARY KEY(d_id_delivery),
  FOREIGN KEY(d_id_delivery_tour) REFERENCES d_delivery_tour(d_id_delivery_tour)
);

CREATE TABLE c_customer_review(
  c_id_customer_review INT IDENTITY,
  c_review_content VARCHAR(5000) NOT NULL,
  c_verified BIT NOT NULL,
  c_rediged_at DATETIMEOFFSET NOT NULL,
  c_id_user INT NOT NULL,
  c_id_product INT NOT NULL,
  PRIMARY KEY(c_id_customer_review),
  FOREIGN KEY(c_id_user) REFERENCES u_user(u_id_user),
  FOREIGN KEY(c_id_product) REFERENCES p_product(p_id_product)
);

CREATE TABLE c_cart(
  c_id_cart INT IDENTITY,
  c_id_user INT,
  c_id_product INT,
  c_quantity SMALLINT NOT NULL,
  PRIMARY KEY(c_id_cart),
  FOREIGN KEY(c_id_user) REFERENCES u_user(u_id_user),
  FOREIGN KEY(c_id_product) REFERENCES p_product(p_id_product)
);

CREATE TABLE h_has_specifications(
  h_id_has_specifications INT IDENTITY,
  h_id_product_type INT,
  h_id_product_specification INT,
  PRIMARY KEY(h_id_has_specifications),
  FOREIGN KEY(h_id_product_type) REFERENCES p_product_type(p_id_product_type),
  FOREIGN KEY(h_id_product_specification) REFERENCES p_product_specification(p_id_product_specification)
);

CREATE TABLE p_product_has_specification(
  p_id_product_has_specification INT IDENTITY,
  p_id_product INT,
  p_id_product_specification INT,
  p_product_specification_value VARCHAR(200),
  PRIMARY KEY(p_id_product_has_specification),
  FOREIGN KEY(p_id_product) REFERENCES p_product(p_id_product),
  FOREIGN KEY(p_id_product_specification) REFERENCES p_product_specification(p_id_product_specification)
);

CREATE TABLE o_order_contains(
  o_id_order_contains INT IDENTITY,
  o_id_user INT,
  o_id_product INT,
  o_id_order INT,
  o_id_delivery INT,
  o_quantity VARCHAR(50),
  o_individual_price MONEY NOT NULL,
  PRIMARY KEY(o_id_order_contains),
  FOREIGN KEY(o_id_user) REFERENCES u_user(u_id_user),
  FOREIGN KEY(o_id_product) REFERENCES p_product(p_id_product),
  FOREIGN KEY(o_id_order) REFERENCES o_order(o_id_user_order),
  FOREIGN KEY(o_id_delivery) REFERENCES d_delivery(d_id_delivery)
);

-- ===================================
-- Grant roles to user on table
-- ===================================
-- Add all rights on all table for admin
DECLARE @sql NVARCHAR(MAX) = '';

SELECT
  @sql = @sql + 'GRANT SELECT, INSERT, UPDATE, DELETE ON [' + SCHEMA_NAME(schema_id) + '].[' + name + '] TO user_admin; '
FROM
  sys.tables
WHERE
  SCHEMA_NAME(schema_id) = 'dbo';

EXEC sp_executesql @sql;

GO
;

-- Lot of rights should be granted on lot of tables for 4 others users
GRANT
SELECT
  ON u_user TO user_customer;

-- ===================================
-- Create index on some table
-- ===================================
-- Create index on user mail because search on it to login is very recurrent
CREATE INDEX index_user_mail_adress ON u_user(u_mail_adress);

-- Used with something like that
-- SELECT * FROM u_user WITH (INDEX(user_mail_adresse)) WHERE u_mail_adress = 'mark795@papazzo.it';
;

-- Create index on product for product type because filter on it is current usage
CREATE INDEX index_product_type ON p_product(p_id_product_type);

-- Used with something like that
-- SELECT * FROM p_product WITH (INDEX(index_product_type)) WHERE p_id_product_type = 3;;
;

-- Create index on order number because customers would search order by number
CREATE INDEX index_order_number ON o_order(o_order_number);

-- Used with something like that
-- SELECT * FROM o_order WITH (INDEX(index_order_number)) WHERE o_order_number = '4E7129BB-E547-4823-8';
;

-- Create index on delivery number because delevery man or customers would search delivery by number
CREATE INDEX index_delivery_number ON d_delivery(d_delivery_number);

-- Used with something like that
-- SELECT * FROM d_delivery WITH (INDEX(index_delivery_number)) WHERE d_delivery_number = '6D1ED619-F934-46E7-9';
;

GO
;

-- ===================================
-- Create view
-- ===================================
CREATE VIEW commercial_supplier_info AS
SELECT
  UPPER(supplier.u_lastname) + ' ' + UPPER(supplier.u_firstname) AS supplier_name,
  UPPER(commercial.u_lastname) + ' ' + UPPER(commercial.u_firstname) AS commercial_name,
  supplier.u_mail_adress AS supplier_mail_adress
FROM
  c_commercial_handling ch
  JOIN u_user commercial ON ch.c_id_user_handler = commercial.u_id_user
  JOIN u_user supplier ON ch.c_id_user_handled = supplier.u_id_user;

GO
;

-- ===================================
-- Insert into to feed database
-- ===================================
-- Start feeding u_user
INSERT INTO
  u_user (
    u_role,
    u_registered_at,
    u_lastname,
    u_firstname,
    u_mail_adress,
    u_hashed_password,
    u_adress_country,
    u_adress_region_code,
    u_adress_city,
    u_adress_location,
    u_adress_precision,
    u_is_deleted
  )
VALUES
  (
    'customer',
    DATEADD(
      DAY,
      - ABS(CHECKSUM(NEWID()) % 365 * 4.3),
      GETDATE()
    ),
    'theToto',
    'theOne',
    'totoTheOne@gmail.com',
    '$2b$10$n.VL6SzhEdfisYpQnDswYOpDyteAyay.8Ukk.Ghlw99yaWyl2fTqa',
    'ils',
    'ont',
    'tous la',
    'même',
    'adresse',
    0
  );

DECLARE @line_limit_u_user INT = 100;

DECLARE @count_u_user INT = 0;

WHILE @count_u_user < @line_limit_u_user BEGIN;

DECLARE @user_last_name VARCHAR(128) = (
  SELECT
    TOP 1 value
  FROM
    (
      VALUES
        ('Jean'),
        ('Richard'),
        ('Durand'),
        ('Bernard'),
        ('LePetit'),
        ('Aubreux'),
        ('Patton'),
        ('Louapre')
    ) AS lastname(value)
  ORDER BY
    NEWID()
);

DECLARE @user_first_name VARCHAR(128) = (
  SELECT
    TOP 1 value
  FROM
    (
      VALUES
        ('Lucas'),
        ('Lise'),
        ('Daphné'),
        ('Mark'),
        ('Alice'),
        ('Mathilde'),
        ('Bob'),
        ('Charlie'),
        ('Steve'),
        ('Eva')
    ) AS firstname(value)
  ORDER BY
    NEWID()
);

DECLARE @random_number INT = FLOOR(RAND() * 1000);

INSERT INTO
  u_user (
    u_role,
    u_registered_at,
    u_lastname,
    u_firstname,
    u_mail_adress,
    u_hashed_password,
    u_adress_country,
    u_adress_region_code,
    u_adress_city,
    u_adress_location,
    u_adress_precision,
    u_is_deleted
  )
VALUES
  (
    CASE
      WHEN RAND() < 0.80 THEN 'customer'
      WHEN RAND() < 0.85 THEN 'supplier'
      WHEN RAND() < 0.90 THEN 'commercial'
      WHEN RAND() < 0.95 THEN 'delivery_man'
      ELSE 'admin'
    END,
    DATEADD(
      DAY,
      - ABS(CHECKSUM(NEWID()) % 365 * 4.3),
      GETDATE()
    ),
    @user_last_name,
    @user_first_name,
    LOWER(
      CONCAT(
        @user_last_name,
        '.',
        @user_first_name,
        @random_number,
        '@',
        (
          SELECT
            TOP 1 value
          FROM
            (
              VALUES
                ('outlook.com'),
                ('yahoo.com'),
                ('orange.fr'),
                ('gmail.com'),
                ('papazzo.it')
            ) AS email_email(value)
          ORDER BY
            NEWID()
        )
      )
    ),
    LEFT(REPLICATE(CONVERT(VARCHAR(40), NEWID()), 2), 60),
    'ils',
    'ont',
    'tous la',
    'même',
    'adresse',
    0
  );

SET
  @count_u_user = @count_u_user + 1;

END;

-- Stop feeding u_user
;

-- Start feeding i_internal_message
DECLARE @line_limit_i_internal_message INT = 300;

DECLARE @count_i_internal_message INT = 0;

WHILE @count_i_internal_message < @line_limit_i_internal_message BEGIN
INSERT INTO
  i_internal_message (
    i_send_at,
    i_read_at,
    i_message_content,
    i_id_user_receiver,
    i_id_user_sender
  )
VALUES
  (
    DATEADD(
      DAY,
      - ABS(CHECKSUM(NEWID()) % 365 * 0.4),
      GETDATE()
    ),
    DATEADD(
      DAY,
      - ABS(CHECKSUM(NEWID()) % 365 * 0.4),
      GETDATE()
    ),
    dbo.lorem_ipsum(50),
    -- Classic customers dosen't should be send message so it's should be filter on only other roles
    FLOOR(RAND() * @line_limit_u_user) + 1,
    FLOOR(RAND() * @line_limit_u_user) + 1
  );

SET
  @count_i_internal_message = @count_i_internal_message + 1;

END;

-- Stop feeding i_internal_message
;

-- Start feeding c_commercial_handling
DECLARE @line_limit_c_commercial_handling INT = 20;

DECLARE @count_c_commercial_handling INT = 0;

WHILE @count_c_commercial_handling < @line_limit_c_commercial_handling BEGIN
INSERT INTO
  c_commercial_handling (c_id_user_handler, c_id_user_handled)
VALUES
  (
    -- There's no verification that only Commercial is handler and only supplier is handled
    FLOOR(RAND() * @line_limit_u_user) + 1,
    FLOOR(RAND() * @line_limit_u_user) + 1
  );

SET
  @count_c_commercial_handling = @count_c_commercial_handling + 1;

END;

-- Stop feeding c_commercial_handling
;

-- Start feeding o_order
DECLARE @line_limit_o_order INT = 150;

DECLARE @count_c_o_order INT = 0;

WHILE @count_c_o_order < @line_limit_o_order BEGIN;

DECLARE @price MONEY = (FLOOR(RAND() * 400000)) / 100;

DECLARE @reduction INT = CASE
  WHEN RAND() < 0.80 THEN 0
  ELSE (FLOOR(RAND() * 6) + 1) * 5
END;

INSERT INTO
  o_order (
    o_order_number,
    o_status,
    o_ordered_at,
    o_discount,
    o_final_price,
    o_delivery_adress_country,
    o_delivery_adress_region_code,
    o_delivery_adress_city,
    o_delivery_adress_location,
    o_delivery_adress_precision
  )
VALUES
  (
    LEFT(NEWID(), 20),
    CASE
      WHEN RAND() < 0.40 THEN 'finish'
      WHEN RAND() < 0.62 THEN 'delivery'
      WHEN RAND() < 0.69 THEN 'preparation'
      WHEN RAND() < 0.82 THEN 'received'
      ELSE 'canceled'
    END,
    DATEADD(
      DAY,
      - ABS(CHECKSUM(NEWID()) % 365 * 4.3),
      GETDATE()
    ),
    @reduction,
    @price * (1 - @reduction / 100),
    'ils',
    'ont encore',
    'tous la',
    'même',
    'adresse'
  );

SET
  @count_c_o_order = @count_c_o_order + 1;

END;

-- Stop feeding o_order
;

-- Start feeding p_product_type
DECLARE @line_limit_p_product_type INT = 20;

INSERT INTO
  p_product_type (p_type_name)
VALUES
  ('motherboard'),
  ('gpu'),
  ('cpu'),
  ('dualshockController'),
  ('keyboard'),
  ('pen'),
  ('mouse'),
  ('speaker'),
  ('microphone'),
  ('monitor'),
  ('ram'),
  ('tv'),
  ('fan'),
  ('cpufan'),
  ('watercooling'),
  ('chair'),
  ('desk'),
  ('light'),
  ('camera'),
  ('phone');

-- Stop feeding p_product_type
;

-- Start feeding p_product_specification
DECLARE @line_limit_p_product_specification INT = 200;

DECLARE @count_c_p_product_specification INT = 0;

WHILE @count_c_p_product_specification < @line_limit_p_product_specification BEGIN;

DECLARE @is_specific_value BIT = CASE
  WHEN RAND() < 0.50 THEN 0
  ELSE 1
END;

INSERT INTO
  p_product_specification (
    p_specification_name,
    p_is_specific_value,
    p_possible_value
  )
VALUES
  (
    (
      SELECT
        TOP 1 value
      FROM
        (
          VALUES
            ('cpuChipset'),
            ('cpuMemoryFormat'),
            ('cpuMemoryFrequency'),
            ('motherboardWidth'),
            ('motherboardHeight'),
            ('motherboardLength')
        ) AS lastname(value)
      ORDER BY
        NEWID()
    ),
    @is_specific_value,
    CASE
      WHEN @is_specific_value = 1 THEN (
        SELECT
          TOP 1 value
        FROM
          (
            VALUES
              ('atx'),
              ('micro-atx'),
              ('mini-atx'),
              ('X750'),
              ('X550'),
              ('4200 Mhz'),
              ('3800 Mhz')
          ) AS lastname(value)
        ORDER BY
          NEWID()
      )
      ELSE NULL
    END
  );

SET
  @count_c_p_product_specification = @count_c_p_product_specification + 1;

END;

-- Stop feeding p_product_specification
;

-- Start feeding d_delivery_tour
DECLARE @line_limit_d_delivery_tour INT = 40;

DECLARE @count_c_d_delivery_tour INT = 0;

WHILE @count_c_d_delivery_tour < @line_limit_d_delivery_tour BEGIN
INSERT INTO
  d_delivery_tour (d_start_at, d_end_at, d_id_user)
VALUES
  (
    -- No logic ties end delivery date and end delivery date, should be
    DATEADD(
      DAY,
      - ABS(CHECKSUM(NEWID()) % 365 * 4.3),
      GETDATE()
    ),
    DATEADD(
      DAY,
      - ABS(CHECKSUM(NEWID()) % 365 * 4.3),
      GETDATE()
    ),
    FLOOR(RAND() * @line_limit_u_user) + 1
  );

SET
  @count_c_d_delivery_tour = @count_c_d_delivery_tour + 1;

END;

-- Stop feeding d_delivery_tour
;

-- Start feeding p_product
DECLARE @line_limit_p_product INT = 500;

DECLARE @count_c_p_product INT = 0;

WHILE @count_c_p_product < @line_limit_p_product BEGIN;

DECLARE @is_product_available BIT = CASE
  WHEN RAND() < 0.7 THEN 1
  ELSE 0
END;

INSERT INTO
  p_product (
    p_name,
    p_description,
    p_price,
    p_registered_at,
    p_is_available,
    p_stock,
    p_disable_at,
    p_id_product_type,
    p_id_user
  )
VALUES
  (
    'My Product',
    'The description of the product',
    (FLOOR(RAND() * 400000)) / 100,
    DATEADD(
      DAY,
      - ABS(CHECKSUM(NEWID()) % 365 * 4.3),
      GETDATE()
    ),
    @is_product_available,
    CASE
      @is_product_available
      WHEN 1 THEN FLOOR(RAND() * 2000)
      ELSE 0
    END,
    CASE
      @is_product_available
      WHEN 1 THEN NULL
      ELSE DATEADD(
        DAY,
        - ABS(CHECKSUM(NEWID()) % 365 * 4.0),
        GETDATE()
      )
    END,
    FLOOR(RAND() * 20) + 1,
    FLOOR(RAND() * @line_limit_u_user) + 1
  );

SET
  @count_c_p_product = @count_c_p_product + 1;

END;

-- Stop feeding p_product
;

-- Start feeding d_delivery
DECLARE @line_limit_d_delivery INT = 100;

DECLARE @count_c_d_delivery INT = 0;

WHILE @count_c_d_delivery < @line_limit_d_delivery BEGIN
INSERT INTO
  d_delivery (
    d_delivery_number,
    d_status,
    d_shipped_at,
    d_delivered_at,
    d_id_delivery_tour
  )
VALUES
  (
    LEFT(NEWID(), 20),
    (
      SELECT
        TOP 1 value
      FROM
        (
          VALUES
            ('delivered'),
            ('returned'),
            ('unableToDeliver'),
            ('onTheWay')
        ) AS lastname(value)
      ORDER BY
        NEWID()
    ),
    -- No logic between when order was ship and when order was deliver
    DATEADD(
      DAY,
      - ABS(CHECKSUM(NEWID()) % 365 * 4.3),
      GETDATE()
    ),
    DATEADD(
      DAY,
      - ABS(CHECKSUM(NEWID()) % 365 * 4.3),
      GETDATE()
    ),
    FLOOR(RAND() * @line_limit_d_delivery_tour) + 1
  );

SET
  @count_c_d_delivery = @count_c_d_delivery + 1;

END;

-- Stop feeding d_delivery
;

-- Start feeding c_customer_review
DECLARE @line_limit_c_customer_review INT = 30;

DECLARE @count_c_c_customer_review INT = 0;

WHILE @count_c_c_customer_review < @line_limit_c_customer_review BEGIN
INSERT INTO
  c_customer_review (
    c_review_content,
    c_verified,
    c_rediged_at,
    c_id_user,
    c_id_product
  )
VALUES
  (
    -- No logic that review is written by a customer that really buy this product
    'Ceci est le formidable commentaires de notre client.',
    CASE
      WHEN RAND() < 0.5 THEN 0
      ELSE 1
    END,
    DATEADD(
      DAY,
      - ABS(CHECKSUM(NEWID()) % 365 * 4.3),
      GETDATE()
    ),
    FLOOR(RAND() * @line_limit_u_user) + 1,
    FLOOR(RAND() * @line_limit_p_product) + 1
  );

SET
  @count_c_c_customer_review = @count_c_c_customer_review + 1;

END;

-- Stop feeding c_customer_review
;

-- Start feeding h_has_specifications
DECLARE @line_limit_h_has_specifications INT = 150;

DECLARE @count_c_h_has_specifications INT = 0;

WHILE @count_c_h_has_specifications < @line_limit_h_has_specifications BEGIN
INSERT INTO
  h_has_specifications (h_id_product_type, h_id_product_specification)
VALUES
  (
    FLOOR(RAND() * @line_limit_p_product_type) + 1,
    FLOOR(RAND() * @line_limit_p_product_specification) + 1
  );

SET
  @count_c_h_has_specifications = @count_c_h_has_specifications + 1;

END;

-- Stop feeding h_has_specifications
;

-- Start feeding p_product_has_specification
DECLARE @line_limit_p_product_has_specification INT = 150;

DECLARE @count_c_p_product_has_specification INT = 0;

WHILE @count_c_p_product_has_specification < @line_limit_p_product_has_specification BEGIN
INSERT INTO
  p_product_has_specification (
    p_id_product,
    p_id_product_specification,
    p_product_specification_value
  )
VALUES
  (
    FLOOR(RAND() * @line_limit_p_product) + 1,
    FLOOR(RAND() * @line_limit_p_product_specification) + 1,
    -- No logic between specification that needs specific value or not and this scecific value
    'Une donnée random pour l''instant'
  );

SET
  @count_c_p_product_has_specification = @count_c_p_product_has_specification + 1;

END;

-- Stop feeding p_product_has_specification
;

-- Start feeding o_order_contains
DECLARE @line_limit_o_order_contains INT = 200;

DECLARE @count_c_o_order_contains INT = 0;

WHILE @count_c_o_order_contains < @line_limit_o_order_contains BEGIN
INSERT INTO
  o_order_contains (
    o_id_user,
    o_id_product,
    o_id_order,
    o_id_delivery,
    o_quantity,
    o_individual_price
  )
VALUES
  (
    FLOOR(RAND() * @line_limit_u_user) + 1,
    FLOOR(RAND() * @line_limit_p_product) + 1,
    FLOOR(RAND() * @line_limit_o_order) + 1,
    FLOOR(RAND() * @line_limit_d_delivery) + 1,
    -- No link between p_product selected and price and quantity
    (FLOOR(RAND() * 1000)) / 100,
    (FLOOR(RAND() * 400000)) / 100
  );

SET
  @count_c_o_order_contains = @count_c_o_order_contains + 1;

END;

-- Stop feeding o_order_contains
;

-- ===================================
-- Insert into to feed database
-- ===================================
GO
;

-- DECLARE @database_name NVARCHAR(128) = 'mds_api_database';
-- DECLARE @deleted_database_name NVARCHAR(128) = 'mds_api_database_deleted';
-- DECLARE @sql NVARCHAR(MAX) = '';
-- Script to copy/paste structure of tables from mds_api_database to mds_api_database_deleted database
-- SELECT
--   @sql = @sql + '
-- IF NOT EXISTS (SELECT * FROM [' + @deleted_database_name + '].sys.objects WHERE object_id = OBJECT_ID(''' + @deleted_database_name + '.dbo.' + t.name + '''))
-- BEGIN
--     SELECT * INTO [' + @deleted_database_name + '].dbo.' + t.name + ' FROM [' + @database_name + '].dbo.' + t.name + ' WHERE 1 = 0;
--     ALTER TABLE [' + @deleted_database_name + '].dbo.' + t.name + ' ADD deleted_time DATETIMEOFFSET;
-- END;
-- '
-- FROM
--   sys.tables t EXEC sp_executesql @sql;
-- Try to create trigger on all table, but not successed (but not far i know)
-- GO
-- ;
-- DECLARE @database_name NVARCHAR(128) = 'mds_api_database';
-- DECLARE @deleted_database_name NVARCHAR(128) = 'mds_api_database_deleted';
-- DECLARE @sql NVARCHAR(MAX) = '';
-- SELECT
--   @sql = @sql + '
-- CREATE TRIGGER trg_' + t.name + '_Delete
-- ON [' + @database_name + '].dbo.' + t.name + '
-- AFTER DELETE
-- AS
-- BEGIN
--     SET NOCOUNT ON;
--     INSERT INTO [' + @deleted_database_name + '].dbo.' + t.name + ' 
--     SELECT *, SYSDATETIMEOFFSET()
--     FROM DELETED;
--     -- Suppression effectuée automatiquement
-- END;
-- '
-- FROM
--   sys.tables t;
-- EXEC sp_executesql @sql;
