# Complete Database Setup Guide

## Overview
This guide will help you set up the complete database for your Inventory Management System. The system includes 19 interconnected tables that handle everything from inventory to sales, customers, employees, and pricing rules.

## Prerequisites
- XAMPP installed and running
- Apache and MySQL services started in XAMPP Control Panel
- phpMyAdmin accessible at http://localhost/phpmyadmin

## Quick Setup (Recommended)

### Method 1: Using phpMyAdmin (Easiest)
1. Open phpMyAdmin: http://localhost/phpmyadmin
2. Click on "Import" tab
3. Click "Choose File" and select `complete_database_setup.sql`
4. Click "Go" at the bottom
5. Wait for the success message

### Method 2: Using SQL Tab
1. Open phpMyAdmin: http://localhost/phpmyadmin
2. Click on "SQL" tab at the top
3. Open `complete_database_setup.sql` in a text editor
4. Copy ALL the SQL content
5. Paste it into the SQL tab
6. Click "Go"

### Method 3: Using MySQL Command Line
```bash
mysql -u root -p < complete_database_setup.sql
```
(Enter your MySQL password when prompted, or press Enter if no password)

## Database Configuration

The application is configured to connect to:
- **Host**: localhost
- **Port**: 3310 (configured in `api/db.php`)
- **Database**: store_inventory
- **User**: root
- **Password**: (empty by default)

If your MySQL port is different, update `/api/db.php` line 16:
```php
$port = getenv('DB_PORT') ?: '3306'; // Change to your port
```

## Database Structure

### Core Tables

#### 1. **users** - User Authentication
Stores user accounts with roles and permissions.
- Roles: admin, manager, viewer
- Handles authentication and subscription status
- Tracks trial/payment status

#### 2. **items** - Product Inventory
Main inventory table for all products.
- SKU, name, prices, stock levels
- Linked to departments
- Stock alert levels for low inventory warnings

#### 3. **transactions** - Sales & Purchases
Records all inventory movements.
- Types: sale, purchase, opening stock
- Batch IDs for grouped transactions
- Links to items

#### 4. **departments** - Product Categories
Organize items into departments/categories.
- Used for reporting and organization
- Can be assigned to items

#### 5. **customers** - Customer Management
Store customer information.
- Contact details, addresses
- Customer numbers for easy reference
- Used for sales and backorders

#### 6. **vendors** - Supplier Management
Manage your suppliers/vendors.
- Company details, contacts
- Purchase order delivery preferences
- Payment terms and commission rates

### Employee Management

#### 7. **employees** - Staff Records
Track employee information.
- Roles: Manager, Cashier, Staff
- PIN codes for quick login
- Hourly rates for payroll

#### 8. **time_entries** - Time Clock
Employee clock in/out records.
- Clock in, clock out, break start, break end
- Timestamps for payroll calculation

### Advanced Features

#### 9. **kits** - Product Bundles
Create product bundles/packages.
- Group multiple items together
- Set bundle pricing

#### 10. **kit_components** - Bundle Items
Items that make up each kit.
- Links kits to items
- Quantity of each item in the kit

#### 11. **backorders** - Customer Orders
Track items ordered but out of stock.
- Links to customers and items
- Status: pending, fulfilled, cancelled
- Order dates for fulfillment tracking

#### 12. **styles** - Product Variants
Manage product variations.
- Base items with variants
- Size, color, style variations

#### 13. **style_variants** - Variant Options
Define variant attributes.
- Variant names and values
- SKU modifiers for variants

### Pricing & Promotions

#### 14. **mix_match_groups** - Pricing Rules
Create special pricing rules.
- Quantity discounts (Buy 3 for $10)
- BOGO deals
- Date-based promotions

#### 15. **mix_match_items** - Promotion Items
Items included in pricing rules.
- Links items to promotions
- Multiple items can share a promotion

#### 16. **customer_item_prices** - Custom Pricing
Set special prices for specific customers.
- Customer-specific pricing
- Overrides regular item prices
- Wholesale/VIP pricing

### Settings & Configuration

#### 17. **settings** - Application Settings
Global system settings.
- Currency, locale, date format
- Invoice settings and templates
- Tax rates
- Subscription details

#### 18. **payment_methods** - Payment Options
Store accepted payment methods.
- Credit cards, PayPal
- Last 4 digits for security
- Default payment method

#### 19. **settlements** - Financial Records
Track financial settlements and reconciliations.
- Settlement dates and amounts
- Status: Pending or Settled
- Notes for accounting

## Verification

After running the setup, verify everything is created:

1. Open phpMyAdmin
2. Click on "store_inventory" database on the left
3. You should see 19 tables
4. Click on "users" table and verify columns exist

## Default Data

The setup script includes:
- Default settings row (id=1) with USD, en-US locale, starter plan
- All tables are empty and ready for your data

## Testing the Setup

1. Make sure XAMPP (Apache + MySQL) is running
2. Visit your application
3. Try to register a new account
4. The signup should work without errors
5. You should be logged in automatically

## Common Issues

### Issue: "Table already exists"
**Solution**: The script uses `IF NOT EXISTS`, so it's safe to run multiple times. Existing tables won't be affected.

### Issue: "Can't connect to MySQL server"
**Solution**:
- Check XAMPP Control Panel - MySQL should be green/running
- Verify port in `api/db.php` matches your MySQL port
- Default is 3310, might be 3306 on some systems

### Issue: "Access denied for user"
**Solution**:
- Check username/password in `api/db.php`
- Default XAMPP MySQL has user: root, password: (empty)

### Issue: "Foreign key constraint fails"
**Solution**:
- This script creates tables in the correct order
- If you're modifying, ensure parent tables exist before child tables

## Security Notes

1. **Change default MySQL password**: Use a strong password in production
2. **Update .env file**: Never commit database credentials to git
3. **Enable SSL**: For production deployments
4. **Limit user permissions**: Don't use root in production

## Next Steps

After database setup:
1. Register your first admin account
2. Go to Settings and configure your store details
3. Add departments for your products
4. Start adding items to inventory
5. Add customers and vendors
6. Begin processing transactions

## Backup Recommendations

Regular backups are essential:
1. **Daily**: Use phpMyAdmin Export feature
2. **Weekly**: Full database dump
3. **Before updates**: Always backup before schema changes

### How to Backup:
1. Open phpMyAdmin
2. Select "store_inventory" database
3. Click "Export" tab
4. Choose "Quick" method
5. Click "Go" to download SQL file

### How to Restore:
1. Open phpMyAdmin
2. Select "store_inventory" database
3. Click "Import" tab
4. Choose your backup file
5. Click "Go"

## Maintenance

### Optimize Tables (Run Monthly)
```sql
OPTIMIZE TABLE items, transactions, customers, vendors;
```

### Check Table Health
```sql
CHECK TABLE items, transactions, customers, vendors;
```

### View Table Sizes
```sql
SELECT
    table_name AS 'Table',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'store_inventory'
ORDER BY (data_length + index_length) DESC;
```

## Support

If you encounter issues:
1. Check XAMPP is running (Apache + MySQL both green)
2. Verify database connection in `api/db.php`
3. Check browser console (F12) for error messages
4. Review phpMyAdmin SQL tab for detailed error messages

## Database Schema Diagram

```
users
  └─> subscription info

items ───> departments
  ├───> transactions
  ├───> kit_components ───> kits
  ├───> backorders ───> customers
  ├───> style_variants ───> styles
  ├───> mix_match_items ───> mix_match_groups
  └───> customer_item_prices ───> customers

employees
  └───> time_entries

vendors
customers
settings (singleton)
payment_methods
settlements
```

## Performance Tips

1. **Indexes**: Already created on frequently queried columns
2. **Regular cleanup**: Delete old transactions after archiving
3. **Optimize queries**: Use JOINs instead of multiple queries
4. **Connection pooling**: Reuse database connections
5. **Cache frequent queries**: Consider caching settings

## Migration from Existing Data

If you have existing data in spreadsheets:
1. Export to CSV format
2. Use phpMyAdmin Import feature
3. Map columns correctly
4. Test with small dataset first

---

**Setup Complete!** Your database is now ready for seamless integration with all application features.
