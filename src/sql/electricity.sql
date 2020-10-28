CREATE TABLE `sensors`.`electricity` ( 
    `sensor_id` VARCHAR(255) NOT NULL , 
    `equipment_id` VARCHAR(255) NOT NULL , 
    `timestamp` DATE NOT NULL , 
    `tariff1_received` DOUBLE NOT NULL , 
    `tariff2_received` DOUBLE NOT NULL , 
    `actual_received` DOUBLE NOT NULL , 
    `tariff1_delivered` DOUBLE NOT NULL , 
    `tariff2_delivered` DOUBLE NOT NULL , 
    `actual_delivered` DOUBLE NOT NULL , 
    `tariff_indicator` INT NOT NULL , 
    `valve_position` VARCHAR(255) NOT NULL 
) ENGINE = InnoDB;