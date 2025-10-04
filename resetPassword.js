const bcrypt = require("bcryptjs");
const { pool } = require("./database"); // Adjust the path if needed

async function resetPasswordManually(email, newPassword) {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const sql = `UPDATE account SET account_password = $1 WHERE account_email = $2 RETURNING account_id`;
    const result = await pool.query(sql, [hashedPassword, email]);

    if (result.rowCount > 0) {
      console.log("✅ Password reset successfully for:", email);
    } else {
      console.log("❌ Account not found for email:", email);
    }
  } catch (error) {
    console.error("Error resetting password:", error);
  } finally {
    pool.end(); // Close DB connection
  }
}

// 🔁 CHANGE THESE VALUES!
resetPasswordManually("happy@340.edu", "I@mAnEmpl0y33");
