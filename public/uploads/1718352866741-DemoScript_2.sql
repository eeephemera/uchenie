create database Uvelire;

use Uvelire;

create table [User] (
id_user int primary key,
role_user nvarchar(20),
FIO_user nvarchar(70),
login_user nvarchar(50),
password_user nvarchar(10),
)

select * from [User];

create table [Product] (
id_product int primary key,
article_product nvarchar(6),
name_product nvarchar(20),
ed_product nvarchar (3),
price_product int,
max_size_product int,
manufacterer_product nvarchar(20),
provider_product nvarchar(20),
category_product nvarchar(20),
skidka_product int,
count_product int
)

select * from [Product];

create table [Place] (
id_place int primary key,
adress_place nvarchar(50)
)

select * from [Place];

create table [Order] (
id_order int primary key,
structure_order nvarchar(20),
date_order date,
date_dilivery date,
place_id int,
FIO_client nvarchar(50),
code_order int,
status_order nvarchar(20),

foreign key (place_id) references [Place] (id_place)
)