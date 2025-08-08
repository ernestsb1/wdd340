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



/* ***************************
 *  Export all functions
 * ************************** */
module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById,
  getAllInventory,
  addClassification,
  addInventoryItem
};

