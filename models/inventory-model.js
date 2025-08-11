const pool = require("../database/");

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name");
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
       JOIN public.classification AS c 
       ON i.classification_id = c.classification_id 
       WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getInventoryByClassificationId error " + error);
    throw error;
  }
}

/* ***************************
 *  Get a single vehicle by ID
 * ************************** */
async function getVehicleById(invId) {
  try {
    const query = `SELECT * FROM public.inventory WHERE inv_id = $1`;
    const result = await pool.query(query, [invId]);
    return result.rows[0];
  } catch (error) {
    throw new Error("Vehicle not found");
  }
}
async function getAllInventory() {
  return await pool.query('SELECT * FROM inventory ORDER BY inv_make');
}



async function addClassification(classification_name) {
  const sql = 'INSERT INTO classification (classification_name) VALUES ($1)';
  return pool.query(sql, [classification_name]);
}


async function getClassifications() {
  const sql = 'SELECT classification_id, classification_name FROM classification ORDER BY classification_name';
  return pool.query(sql);
}

async function addInventoryItem(data) {
  const sql = `INSERT INTO inventory
    (inv_make, inv_model, inv_year, inv_description,
     inv_price, inv_miles, inv_color, classification_id,
     inv_image, inv_thumbnail)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`;
  const params = [
    data.inv_make, data.inv_model, data.inv_year,
    data.inv_description, data.inv_price, data.inv_miles,
    data.inv_color, data.classification_id,
    data.inv_image, data.inv_thumbnail
  ];
  return pool.query(sql, params);
}


/**
 * Get a single vehicle from inventory by its ID
 */
async function getInventoryById(inv_id) {
  try {
    const sql = "SELECT * FROM inventory WHERE inv_id = $1";
    const result = await pool.query(sql, [inv_id]);
    return result.rows[0];
  } catch (error) {
    console.error("getInventoryById error:", error);
    throw error;
  }
}


// models/inventory-model.js


async function updateInventory(
  inv_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    const sql = `
      UPDATE public.inventory
      SET inv_make = $1, inv_model = $2, inv_description = $3,
          inv_image = $4, inv_thumbnail = $5, inv_price = $6,
          inv_year = $7, inv_miles = $8, inv_color = $9,
          classification_id = $10
      WHERE inv_id = $11
      RETURNING *;
    `;
    const data = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id,
    ]);
    return data.rows[0];
  } catch (error) {
    console.error("Model error: " + error);
    throw error;
  }
}


  // ... other exported model functions


/* ***************************
 *  Export all functions
 * ************************** */
module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById,
  getAllInventory,
  addClassification,
  addInventoryItem, getInventoryById, updateInventory
};

