const { pool } = require("../database");  // Correctly import pool from database.js
const bcrypt = require('bcryptjs');

// Register new account


// Register new account
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  if (!account_firstname || !account_lastname || !account_email || !account_password) {
    throw new Error("All fields must be provided.");
  }
  // Check if the email already exists
  const existingAccount = await checkExistingEmail(account_email);
  if (existingAccount) {
    throw new Error("Email already registered.");
  }
  try {
    const sql = `
      INSERT INTO public.account 
        (account_firstname, account_lastname, account_email, account_password, account_type)
      VALUES
        ($1, $2, $3, $4, 'client')  -- make sure 'client' matches your enum exactly
      RETURNING *`;
    const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_password]);
    return result.rows[0];  // Return the newly created account
  } catch (error) {
    console.error("Error in registerAccount:", error);
    throw new Error("Error registering account. Please try again later.");
  }
}

async function getInventoryByClassificationId(classification_id) {
  const query = `SELECT * FROM inventory WHERE classification_id = $1`;
  const result = await pool.query(query, [classification_id]);
  return results; // Return the query results
};
/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail(account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email]
    );
    return result.rows[0] || null; // Return null if not found
  } catch (error) {
    console.error("Database error in getAccountByEmail:", error);
    throw new Error("Error fetching account data. Please try again later.");
  }
}

async function checkExistingEmail(account_email) {
  const result = await pool.query(  // Use 'pool.query' instead of 'db.query'
    'SELECT account_id FROM account WHERE account_email = $1',
    [account_email]
  );
  return result.rows[0] || null;
}

async function getAccountById(id) {
  try {
    const result = await pool.query(`SELECT * FROM account WHERE account_id = $1`, [id]);
    return result.rows[0] || null; // Return null if account is not found
  } catch (error) {
    console.error("Error fetching account by ID:", error);
    throw new Error("Error fetching account data. Please try again later.");
  }
}

async function updateAccount(id, first, last, email) {
  const sql = `UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4`;
  try {
    const result = await pool.query(sql, [first, last, email, id]);
    return result.rowCount; // Return the number of rows affected (1 if successful)
  } catch (error) {
    console.error("Error updating account:", error);
    throw new Error("Error updating account. Please try again later.");
  }
}

// Function to update the password
async function updatePassword(account_id, newPassword) {
  const hashedPassword = await bcrypt.hash(newPassword, 10);  // 10 is the salt rounds

  try {
    const result = await pool.query(
      'UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING account_id',
      [hashedPassword, account_id]
    );

    if (result.rowCount > 0) {
      return result.rows[0].account_id;
    } else {
      throw new Error('Account not found');
    }
  } catch (error) {
    console.error('Error updating password:', error);
    throw new Error('Error updating password. Please try again later.');
  }
}




/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail(account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email]
    );
    return result.rows[0] || null; // Return null if not found
  } catch (error) {
    console.error("Database error in getAccountByEmail:", error);
    throw new Error("Error fetching account data. Please try again later.");
  }
}

async function checkExistingEmail(account_email) {
  const result = await pool.query(
    'SELECT account_id FROM account WHERE account_email = $1',
    [account_email]
  );
  return result.rows[0] || null;
}



async function getAccountById(accountId) {
  try {
    const result = await pool.query(`SELECT * FROM account WHERE account_id = $1`, [accountId]);
    return result.rows[0]; // Return null if account is not found
  } catch (error) {
    console.error("Error fetching account by ID:", error);
    throw new Error("Error fetching account by ID");
  }
}

async function updateAccount(accountId, account_firstname, account_lastname, account_email) {
  const sql = `UPDATE account SET first_name = $1, last_name = $2, email = $3 WHERE account_id = $4`;
  await pool.query(sql, [account_firstname, account_lastname, account_email, accountId]);
};

async function updatePassword(accountId, newPassword) {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const sql = `UPDATE account SET password = $1 WHERE account_id = $2`;
  await pool.query(sql, [hashedPassword, accountId]);
};




module.exports = { 
  registerAccount, 
  checkExistingEmail, 
  getInventoryByClassificationId,
  getAccountByEmail, 
  getAccountById, 
  updateAccount, 
  updatePassword 
};
