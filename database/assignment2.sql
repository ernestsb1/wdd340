
-- Query 1: Insert a new record into the account table

INSERT INTO public.account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');


-- Query 2: Update the Tony Stark record
UPDATE public.account
SET account_type = 'Admin'
WHERE account_firstname = 'Tony' AND account_lastname = 'Stark';


-- Query 3: Delete the Tony Stark record
DELETE FROM public.account
WHERE account_firstname = 'Tony' AND account_lastname = 'Stark';


-- Query 4: Update the "GM Hummer" record
UPDATE public.inventory
SET inv_description = REPLACE(inv_description, 'small_interiors', 'a_huge_interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';





-- Query 5: Use an inner join to select data
SELECT i.inv_make, i.inv_model, c.classification_name
FROM public.inventory i
INNER JOIN public.classification c ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';


-- Query 6: Update all records in the inventory table
UPDATE public.inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');


