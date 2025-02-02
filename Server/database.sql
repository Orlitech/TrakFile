CREATE DATABASE oftms;

CREATE TABLE folder_registration (
    id SERIAL PRIMARY KEY,
    hospital_number VARCHAR(255) NOT NULL,
    date_enrollment VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Available', -- Default status
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    modification_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,-- Automatically sets the timestamp
    archived BOOLEAN DEFAULT FALSE -- Indicates if the record is archived
);


CREATE TABLE folder_collectors(
foco_id SERIAL PRIMARY KEY,
first_name VARCHAR(255),
other_name VARCHAR(255),
designation VARCHAR(25),
phone VARCHAR(11)
);

-- Create the purpose table
CREATE TABLE purpose (
    purpose_id SERIAL PRIMARY KEY, -- Auto-incrementing primary key
    purpose_name VARCHAR(255) NOT NULL -- Name of the purpose
);

-- Insert purposes into the table
INSERT INTO purpose (purpose_name)
VALUES 
    ('Refill'),
    ('Viral Load Sample Collection'),
    ('Cervical Cancer Screening'),
	('TPT Completion'),
	('Biometric Recapture'),
	('EAC Session'),
	('Clinical Visit'),
	('Transferring'),
	('Proper Documentation'),
	('Folder Audit'),
	('Tracking'),
	('Index Contact Testing'),
	('TB Case'),
	('Result Filling'),
	('Source Document filling'),
	('Mental Health Session');


CREATE TABLE folder_transactions (
    ft_id BIGSERIAL PRIMARY KEY,
    folder_id INT NOT NULL,
    purpose_id INT NOT NULL,
    date_collected DATE,
    collectedby INT,
    date_returned DATE,
    folder_status VARCHAR(10) CHECK (folder_status IN ('In Store', 'Out Store')),
    FOREIGN KEY (folder_id) REFERENCES folder_registration(id) ON DELETE CASCADE,
    FOREIGN KEY (purpose_id) REFERENCES purpose(purpose_id) ON DELETE SET NULL,
    FOREIGN KEY (collectedby) REFERENCES folder_collectors(foco_id) ON DELETE SET NULL
);
