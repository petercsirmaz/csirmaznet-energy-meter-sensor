CREATE TABLE `sensors`.`gas` ( 
    `sensor_id` VARCHAR(255) NOT NULL , 
    `equipment_id` VARCHAR(255) NOT NULL , 
    `timestamp` DATE NOT NULL , 
    `reading` DOUBLE NOT NULL , 
    `valve_position` VARCHAR(255) NOT NULL 
) ENGINE = InnoDB;