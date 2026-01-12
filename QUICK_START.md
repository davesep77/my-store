# Quick Start Guide - Inventory Management System

## Get Your System Running in 5 Minutes

This guide will help you set up your complete inventory management system with all features working seamlessly.

---

## Step 1: Prerequisites (2 minutes)

### Install XAMPP
1. Download XAMPP from https://www.apachefriends.org/
2. Install it (default settings are fine)
3. Open XAMPP Control Panel

### Start Services
1. Click "Start" next to **Apache** - wait for it to turn green
2. Click "Start" next to **MySQL** - wait for it to turn green
3. Both should show green/running status

---

## Step 2: Setup Database (1 minute)

Choose ONE of these methods:

### Option A: Using Setup Page (Easiest - Recommended)
1. Copy all project files to `C:\xampp\htdocs\inventory\`
2. Open your browser
3. Go to: `http://localhost/inventory/setup.html`
4. Click "Setup Database" button
5. Wait for success message
6. Done!

### Option B: Using phpMyAdmin
1. Open `http://localhost/phpmyadmin`
2. Click "Import" tab
3. Click "Choose File"
4. Select `complete_database_setup.sql` from your project folder
5. Click "Go"
6. Wait for success message

### Option C: Using Browser Script
1. Copy all project files to XAMPP htdocs folder
2. Open browser: `http://localhost/inventory/api/setup_database.php`
3. You'll see JSON response with success message

---

## Step 3: Start Application (1 minute)

### Method 1: Using XAMPP htdocs
1. Copy project to `C:\xampp\htdocs\inventory\`
2. Open: `http://localhost/inventory/`

### Method 2: Using npm dev server
1. Open terminal in project folder
2. Run: `npm install` (first time only)
3. The dev server starts automatically
4. Open: `http://localhost:5173/`

---

## Step 4: First Login (1 minute)

1. You'll see the login/signup screen
2. Click "Switch to Sign Up"
3. Fill in:
   - Username: admin
   - Full Name: Your Name
   - Email: your@email.com
   - Country: Select your country
   - Subscription Plan: Starter (default)
   - Password: yourpassword
4. Click "Sign Up"
5. You'll be logged in automatically!

---

## Verify Everything Works

After login, check these features:

### Dashboard
- [ ] View sales summary
- [ ] See inventory overview
- [ ] Check recent transactions

### Inventory Management
- [ ] Go to "Management" tab
- [ ] Try adding a department
- [ ] Add your first inventory item

### Settings
- [ ] Go to Settings
- [ ] Update your store information
- [ ] Set currency and locale

---

## Database Connection Settings

Your database is configured in `/api/db.php`:

```php
$host = 'localhost';
$db = 'store_inventory';
$user = 'root';
$pass = ''; // empty by default
$port = '3310';
```

**If you get connection errors:**
1. Check XAMPP - MySQL must be green/running
2. Verify port number (might be 3306 instead of 3310)
3. Try accessing phpMyAdmin to confirm MySQL is working

---

## What's Included

Your database now has **19 tables** for complete functionality:

### Core Features
✓ Users & Authentication
✓ Inventory Items & Stock Tracking
✓ Sales & Purchase Transactions
✓ Departments & Categories

### Customer Management
✓ Customer Records
✓ Customer-Specific Pricing
✓ Back Orders

### Vendor Management
✓ Vendor/Supplier Records
✓ Vendor Contact Info
✓ Purchase Order Details

### Employee Management
✓ Employee Records
✓ Time Clock (Clock In/Out)
✓ Payroll Data

### Advanced Features
✓ Product Bundles (Kits)
✓ Product Variants (Styles)
✓ Mix & Match Pricing Rules
✓ Special Promotions
✓ Financial Settlements
✓ Payment Methods

### Settings
✓ Global Settings
✓ Invoice Configuration
✓ Subscription Management

---

## Common Issues & Solutions

### Issue: "Can't connect to database"
**Solution:**
1. Open XAMPP Control Panel
2. Make sure MySQL is green/running
3. Click "Admin" next to MySQL to open phpMyAdmin
4. If phpMyAdmin opens, your MySQL is working

### Issue: "Unexpected end of JSON input"
**Solution:**
1. Database needs to be set up first
2. Run setup using one of the methods above
3. Clear browser cache (Ctrl+Shift+Delete)
4. Try again

### Issue: "Table doesn't exist"
**Solution:**
1. Database wasn't created properly
2. Run setup again using setup.html
3. Check phpMyAdmin to see if tables exist

### Issue: "Port 3310 connection failed"
**Solution:**
Your MySQL might be on port 3306 instead:
1. Open `/api/db.php`
2. Change line 16: `$port = getenv('DB_PORT') ?: '3306';`
3. Save and try again

### Issue: "Apache won't start"
**Solution:**
1. Another program is using port 80 (probably Skype or IIS)
2. Close other programs using port 80
3. Or change Apache port in XAMPP config

---

## Testing All Features

After setup, test each module:

### 1. Inventory (2 min)
- Add a department (e.g., "Electronics")
- Add an item with SKU, price, stock
- Verify item appears in inventory list

### 2. Transactions (2 min)
- Go to Sales tab
- Add a sale transaction
- Check stock decreased
- View in Reports

### 3. Customers (1 min)
- Go to Management → Customers
- Add a customer
- Save customer details

### 4. Employees (1 min)
- Go to Management → Employees
- Add an employee with PIN
- Test clock in/out

### 5. Pricing (2 min)
- Go to Pricing Rules
- Create a "Buy 2 Get 1 Free" deal
- Add items to the promotion

---

## Next Steps

Once your system is running:

1. **Configure Settings**
   - Set your currency
   - Add invoice header/footer
   - Set tax rate

2. **Import Your Data**
   - Use phpMyAdmin to import CSV files
   - Or manually add items through the UI

3. **Add Users**
   - Create accounts for staff
   - Set appropriate roles (admin/manager/viewer)

4. **Customize**
   - Add your departments
   - Configure pricing rules
   - Set up customer accounts

5. **Train Staff**
   - Show them the Sales interface
   - Demonstrate clock in/out
   - Review reports together

---

## Development vs Production

### Development (Current Setup)
- XAMPP on your computer
- `http://localhost/inventory/`
- Good for testing and learning

### Production (When Ready)
- Web hosting with PHP & MySQL
- Your own domain name
- SSL certificate for security
- Regular backups

---

## Backup Your Data

**Important:** Backup regularly!

### Daily Backup
1. Open phpMyAdmin
2. Select `store_inventory` database
3. Click "Export"
4. Click "Go"
5. Save the .sql file

### Restore Backup
1. Open phpMyAdmin
2. Select `store_inventory`
3. Click "Import"
4. Choose your .sql file
5. Click "Go"

---

## Getting Help

### Check Logs
- Browser Console (F12) - frontend errors
- XAMPP Control Panel → Logs - Apache/MySQL errors
- phpMyAdmin → SQL tab - database errors

### Documentation
- `DATABASE_SETUP_GUIDE.md` - Complete database documentation
- `SIGNUP_FIX_README.md` - Authentication troubleshooting
- `README.md` - General project information

### Verify Setup
Open `http://localhost/inventory/api/setup_database.php` to see:
- Database connection status
- List of all tables
- Connection details

---

## Success Checklist

- [ ] XAMPP installed and services running
- [ ] Database created with all 19 tables
- [ ] Application accessible in browser
- [ ] First admin account created
- [ ] Can add items to inventory
- [ ] Can process sales transactions
- [ ] Can add customers
- [ ] Settings configured

**Congratulations!** Your inventory management system is now fully operational with all features integrated seamlessly.

---

## Quick Reference

| Task | URL |
|------|-----|
| Application | http://localhost/inventory/ |
| Database Setup | http://localhost/inventory/setup.html |
| phpMyAdmin | http://localhost/phpmyadmin |
| Setup Script | http://localhost/inventory/api/setup_database.php |

**Database Name:** `store_inventory`
**Default User:** `root`
**Default Password:** (empty)
**Port:** 3310 (or 3306)

---

Need help? Check the browser console (F12) for detailed error messages!
