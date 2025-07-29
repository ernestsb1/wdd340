const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

module.exports = { getClassifications }





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
        )
        return data.rows
    } catch (error) {
        console.error("getclassificationsbyid error " + error)
    }
}


const getInventoryItem = async (invId) => {
  // query your database to retrieve the inventory item
  const query = 'SELECT * FROM public.inventory WHERE inv_id = $1';
  const result = await db.query(query, [invId]);
  return result.rows[0];
};

module.exports = { getInventoryItem };



module.exports = { getClassifications, getInventoryByClassificationId };
