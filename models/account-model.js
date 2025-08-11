const db = require("../database/index");

// Register new account
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
    const sql = `
      INSERT INTO public.account 
        (account_firstname, account_lastname, account_email, account_password, account_type)
      VALUES
        ($1, $2, $3, $4, 'client')  -- make sure 'client' matches your enum exactly
      RETURNING *`;
    return await db.query(sql, [account_firstname, account_lastname, account_email, account_password]);
  } catch (error) {
    return error.message;
  }
}

// Get account by email
async function getAccountByEmail(account_email) {
  try {
    const result = await db.query(
      `SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password 
       FROM account WHERE account_email = $1`,
      [account_email]
    );
    return result.rows[0]; // undefined if no match
  } catch (error) {
    console.error("Database error in getAccountByEmail:", error);
    return null;
  }
}

// Check if email exists
async function checkExistingEmail(account_email) {
  const account = await getAccountByEmail(account_email);
  return account ? true : false;
}

module.exports = { registerAccount, checkExistingEmail, getAccountByEmail };
