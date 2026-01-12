import { supabase } from './supabase';
import {
  Item,
  Transaction,
  UserSettings,
  Department,
  Customer,
  Vendor,
  Employee,
  TimeEntry,
  Kit,
  BackOrder,
  Style,
  PricingRule,
  CustomerPrice,
  Settlement,
  User
} from '../types';

export const supabaseApi = {
  async getItems(): Promise<Item[]> {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('date_added', { ascending: false });

    if (error) throw error;

    return (data || []).map(item => ({
      id: item.id,
      sku: item.sku,
      name: item.name,
      stock: item.stock,
      unitCost: parseFloat(item.unit_cost),
      sellingPrice: parseFloat(item.selling_price),
      stockAlertLevel: item.stock_alert_level,
      remarks: item.remarks,
      dateAdded: item.date_added
    }));
  },

  async createItem(item: Item): Promise<void> {
    const { error } = await supabase
      .from('items')
      .insert({
        id: item.id,
        sku: item.sku,
        name: item.name,
        stock: item.stock,
        unit_cost: item.unitCost,
        selling_price: item.sellingPrice,
        stock_alert_level: item.stockAlertLevel,
        remarks: item.remarks
      });

    if (error) throw error;
  },

  async updateItem(item: Item): Promise<void> {
    const { error } = await supabase
      .from('items')
      .update({
        sku: item.sku,
        name: item.name,
        stock: item.stock,
        unit_cost: item.unitCost,
        selling_price: item.sellingPrice,
        stock_alert_level: item.stockAlertLevel,
        remarks: item.remarks
      })
      .eq('id', item.id);

    if (error) throw error;
  },

  async deleteItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getTransactions(): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;

    return (data || []).map(t => ({
      id: t.id,
      batchId: t.batch_id,
      date: t.date,
      type: t.type,
      itemId: t.item_id,
      quantity: t.quantity,
      unitPrice: parseFloat(t.unit_price),
      remarks: t.remarks
    }));
  },

  async createTransaction(transaction: Transaction): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .insert({
        id: transaction.id,
        batch_id: transaction.batchId,
        date: transaction.date,
        type: transaction.type,
        item_id: transaction.itemId,
        quantity: transaction.quantity,
        unit_price: transaction.unitPrice,
        remarks: transaction.remarks
      });

    if (error) throw error;
  },

  async deleteTransaction(id: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getSettings(): Promise<UserSettings> {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return {
        currency: 'USD',
        locale: 'en-US',
        dateFormat: 'MM/DD/YYYY',
        email: '',
        subscriptionPlan: 'starter',
        billingCycle: 'monthly',
        subscriptionStatus: 'active'
      };
    }

    return {
      currency: data.currency,
      locale: data.locale,
      dateFormat: data.date_format,
      email: data.email,
      invoiceHeader: data.invoice_header,
      invoiceFooter: data.invoice_footer,
      nextInvoiceNumber: data.next_invoice_number,
      invoiceTerms: data.invoice_terms,
      taxRate: data.tax_rate ? parseFloat(data.tax_rate) : 0,
      subscriptionPlan: data.subscription_plan,
      billingCycle: data.billing_cycle,
      subscriptionStatus: data.subscription_status
    };
  },

  async updateSettings(settings: UserSettings): Promise<void> {
    const { error } = await supabase
      .from('settings')
      .update({
        currency: settings.currency,
        locale: settings.locale,
        date_format: settings.dateFormat,
        email: settings.email,
        invoice_header: settings.invoiceHeader,
        invoice_footer: settings.invoiceFooter,
        next_invoice_number: settings.nextInvoiceNumber,
        invoice_terms: settings.invoiceTerms,
        tax_rate: settings.taxRate,
        subscription_plan: settings.subscriptionPlan,
        billing_cycle: settings.billingCycle,
        subscription_status: settings.subscriptionStatus
      })
      .eq('id', 1);

    if (error) throw error;
  },

  async getDepartments(): Promise<Department[]> {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async createDepartment(dept: Department): Promise<void> {
    const { error } = await supabase
      .from('departments')
      .insert({
        id: dept.id,
        name: dept.name,
        description: dept.description
      });

    if (error) throw error;
  },

  async updateDepartment(dept: Department): Promise<void> {
    const { error } = await supabase
      .from('departments')
      .update({
        name: dept.name,
        description: dept.description
      })
      .eq('id', dept.id);

    if (error) throw error;
  },

  async deleteDepartment(id: string): Promise<void> {
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getCustomers(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('last_name, first_name');

    if (error) throw error;

    return (data || []).map(c => ({
      id: c.id,
      customerNumber: c.customer_number,
      firstName: c.first_name,
      lastName: c.last_name,
      company: c.company,
      email: c.email,
      phone: c.phone,
      address: c.address,
      city: c.city,
      state: c.state,
      zipCode: c.zip_code,
      notes: c.notes,
      dateAdded: c.date_added
    }));
  },

  async createCustomer(customer: Customer): Promise<void> {
    const { error } = await supabase
      .from('customers')
      .insert({
        id: customer.id,
        customer_number: customer.customerNumber,
        first_name: customer.firstName,
        last_name: customer.lastName,
        company: customer.company,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        state: customer.state,
        zip_code: customer.zipCode,
        notes: customer.notes
      });

    if (error) throw error;
  },

  async updateCustomer(customer: Customer): Promise<void> {
    const { error } = await supabase
      .from('customers')
      .update({
        customer_number: customer.customerNumber,
        first_name: customer.firstName,
        last_name: customer.lastName,
        company: customer.company,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        state: customer.state,
        zip_code: customer.zipCode,
        notes: customer.notes
      })
      .eq('id', customer.id);

    if (error) throw error;
  },

  async deleteCustomer(id: string): Promise<void> {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getVendors(): Promise<Vendor[]> {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .order('company_name');

    if (error) throw error;

    return (data || []).map(v => ({
      id: v.id,
      vendorNumber: v.vendor_number,
      companyName: v.company_name,
      poDeliveryMethod: v.po_delivery_method,
      terms: v.terms,
      flatRentRate: v.flat_rent_rate ? parseFloat(v.flat_rent_rate) : undefined,
      taxId: v.tax_id,
      minOrder: v.min_order ? parseFloat(v.min_order) : undefined,
      commissionPercent: v.commission_percent ? parseFloat(v.commission_percent) : undefined,
      billableDepartment: v.billable_department,
      socialSecurityNumber: v.social_security_number,
      address1: v.address1,
      address2: v.address2,
      address: v.address,
      city: v.city,
      state: v.state,
      zip: v.zip,
      country: v.country,
      contactFirstName: v.contact_first_name,
      contactLastName: v.contact_last_name,
      contactPerson: v.contact_person,
      email: v.email,
      phone: v.phone,
      fax: v.fax,
      website: v.website
    }));
  },

  async createVendor(vendor: Vendor): Promise<void> {
    const { error } = await supabase
      .from('vendors')
      .insert({
        id: vendor.id,
        vendor_number: vendor.vendorNumber,
        company_name: vendor.companyName,
        po_delivery_method: vendor.poDeliveryMethod,
        terms: vendor.terms,
        flat_rent_rate: vendor.flatRentRate,
        tax_id: vendor.taxId,
        min_order: vendor.minOrder,
        commission_percent: vendor.commissionPercent,
        billable_department: vendor.billableDepartment,
        social_security_number: vendor.socialSecurityNumber,
        address1: vendor.address1,
        address2: vendor.address2,
        address: vendor.address,
        city: vendor.city,
        state: vendor.state,
        zip: vendor.zip,
        country: vendor.country,
        contact_first_name: vendor.contactFirstName,
        contact_last_name: vendor.contactLastName,
        contact_person: vendor.contactPerson,
        email: vendor.email,
        phone: vendor.phone,
        fax: vendor.fax,
        website: vendor.website
      });

    if (error) throw error;
  },

  async updateVendor(vendor: Vendor): Promise<void> {
    const { error } = await supabase
      .from('vendors')
      .update({
        vendor_number: vendor.vendorNumber,
        company_name: vendor.companyName,
        po_delivery_method: vendor.poDeliveryMethod,
        terms: vendor.terms,
        flat_rent_rate: vendor.flatRentRate,
        tax_id: vendor.taxId,
        min_order: vendor.minOrder,
        commission_percent: vendor.commissionPercent,
        billable_department: vendor.billableDepartment,
        social_security_number: vendor.socialSecurityNumber,
        address1: vendor.address1,
        address2: vendor.address2,
        address: vendor.address,
        city: vendor.city,
        state: vendor.state,
        zip: vendor.zip,
        country: vendor.country,
        contact_first_name: vendor.contactFirstName,
        contact_last_name: vendor.contactLastName,
        contact_person: vendor.contactPerson,
        email: vendor.email,
        phone: vendor.phone,
        fax: vendor.fax,
        website: vendor.website
      })
      .eq('id', vendor.id);

    if (error) throw error;
  },

  async deleteVendor(id: string): Promise<void> {
    const { error } = await supabase
      .from('vendors')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getEmployees(): Promise<Employee[]> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('last_name, first_name');

    if (error) throw error;

    return (data || []).map(e => ({
      id: e.id,
      firstName: e.first_name,
      lastName: e.last_name,
      email: e.email,
      phone: e.phone,
      address: e.address,
      role: e.role,
      pinCode: e.pin_code,
      hourlyRate: e.hourly_rate ? parseFloat(e.hourly_rate) : undefined,
      startDate: e.start_date,
      isActive: e.is_active
    }));
  },

  async createEmployee(employee: Employee): Promise<void> {
    const { error } = await supabase
      .from('employees')
      .insert({
        id: employee.id,
        first_name: employee.firstName,
        last_name: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        address: employee.address,
        role: employee.role,
        pin_code: employee.pinCode,
        hourly_rate: employee.hourlyRate,
        start_date: employee.startDate,
        is_active: employee.isActive
      });

    if (error) throw error;
  },

  async updateEmployee(employee: Employee): Promise<void> {
    const { error } = await supabase
      .from('employees')
      .update({
        first_name: employee.firstName,
        last_name: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        address: employee.address,
        role: employee.role,
        pin_code: employee.pinCode,
        hourly_rate: employee.hourlyRate,
        start_date: employee.startDate,
        is_active: employee.isActive
      })
      .eq('id', employee.id);

    if (error) throw error;
  },

  async deleteEmployee(id: string): Promise<void> {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getTimeEntries(employeeId?: string): Promise<TimeEntry[]> {
    let query = supabase
      .from('time_entries')
      .select('*, employees!inner(first_name, last_name)')
      .order('timestamp', { ascending: false });

    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map(t => ({
      id: t.id,
      employeeId: t.employee_id,
      action: t.action,
      timestamp: t.timestamp
    }));
  },

  async addTimeEntry(employeeId: string, action: 'clock_in' | 'clock_out' | 'break_start' | 'break_end', timestamp?: string): Promise<void> {
    const { error } = await supabase
      .from('time_entries')
      .insert({
        employee_id: employeeId,
        action,
        timestamp: timestamp || new Date().toISOString()
      });

    if (error) throw error;
  },

  async updateTimeEntry(entry: TimeEntry): Promise<void> {
    const { error } = await supabase
      .from('time_entries')
      .update({
        employee_id: entry.employeeId,
        action: entry.action,
        timestamp: entry.timestamp
      })
      .eq('id', entry.id);

    if (error) throw error;
  },

  async deleteTimeEntry(id: number): Promise<void> {
    const { error } = await supabase
      .from('time_entries')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getKits(): Promise<Kit[]> {
    const { data: kitsData, error: kitsError } = await supabase
      .from('kits')
      .select('*')
      .order('name');

    if (kitsError) throw kitsError;

    const { data: componentsData, error: componentsError } = await supabase
      .from('kit_components')
      .select('*, items(name, sku)');

    if (componentsError) throw componentsError;

    return (kitsData || []).map(k => ({
      id: k.id,
      name: k.name,
      description: k.description,
      price: k.price ? parseFloat(k.price) : undefined,
      components: (componentsData || [])
        .filter(c => c.kit_id === k.id)
        .map(c => ({
          id: c.id,
          kitId: c.kit_id,
          itemId: c.item_id,
          quantity: c.quantity
        }))
    }));
  },

  async createKit(kit: Kit): Promise<void> {
    const { error: kitError } = await supabase
      .from('kits')
      .insert({
        id: kit.id,
        name: kit.name,
        description: kit.description,
        price: kit.price
      });

    if (kitError) throw kitError;

    if (kit.components && kit.components.length > 0) {
      const { error: componentsError } = await supabase
        .from('kit_components')
        .insert(
          kit.components.map(c => ({
            kit_id: kit.id,
            item_id: c.itemId,
            quantity: c.quantity
          }))
        );

      if (componentsError) throw componentsError;
    }
  },

  async updateKit(kit: Kit): Promise<void> {
    const { error: kitError } = await supabase
      .from('kits')
      .update({
        name: kit.name,
        description: kit.description,
        price: kit.price
      })
      .eq('id', kit.id);

    if (kitError) throw kitError;

    await supabase.from('kit_components').delete().eq('kit_id', kit.id);

    if (kit.components && kit.components.length > 0) {
      const { error: componentsError } = await supabase
        .from('kit_components')
        .insert(
          kit.components.map(c => ({
            kit_id: kit.id,
            item_id: c.itemId,
            quantity: c.quantity
          }))
        );

      if (componentsError) throw componentsError;
    }
  },

  async deleteKit(id: string): Promise<void> {
    await supabase.from('kit_components').delete().eq('kit_id', id);

    const { error } = await supabase
      .from('kits')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getBackOrders(): Promise<BackOrder[]> {
    const { data, error } = await supabase
      .from('backorders')
      .select(`
        *,
        items(name, sku),
        customers(first_name, last_name, company)
      `)
      .order('order_date', { ascending: false });

    if (error) throw error;

    return (data || []).map(b => ({
      id: b.id,
      customerId: b.customer_id,
      itemId: b.item_id,
      quantity: b.quantity,
      orderDate: b.order_date,
      status: b.status,
      itemName: b.items?.name,
      sku: b.items?.sku,
      firstName: b.customers?.first_name,
      lastName: b.customers?.last_name,
      company: b.customers?.company
    }));
  },

  async createBackOrder(backOrder: BackOrder): Promise<void> {
    const { error } = await supabase
      .from('backorders')
      .insert({
        id: backOrder.id,
        customer_id: backOrder.customerId,
        item_id: backOrder.itemId,
        quantity: backOrder.quantity,
        order_date: backOrder.orderDate,
        status: backOrder.status
      });

    if (error) throw error;
  },

  async updateBackOrder(backOrder: BackOrder): Promise<void> {
    const { error } = await supabase
      .from('backorders')
      .update({
        customer_id: backOrder.customerId,
        item_id: backOrder.itemId,
        quantity: backOrder.quantity,
        order_date: backOrder.orderDate,
        status: backOrder.status
      })
      .eq('id', backOrder.id);

    if (error) throw error;
  },

  async deleteBackOrder(id: string): Promise<void> {
    const { error } = await supabase
      .from('backorders')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getStyles(): Promise<Style[]> {
    const { data: stylesData, error: stylesError } = await supabase
      .from('styles')
      .select('*, items(name)')
      .order('name');

    if (stylesError) throw stylesError;

    const { data: variantsData, error: variantsError } = await supabase
      .from('style_variants')
      .select('*');

    if (variantsError) throw variantsError;

    return (stylesData || []).map(s => ({
      id: s.id,
      name: s.name,
      baseItemId: s.base_item_id,
      baseItemName: s.items?.name,
      variants: (variantsData || [])
        .filter(v => v.style_id === s.id)
        .map(v => ({
          id: v.id,
          styleId: v.style_id,
          variantName: v.variant_name,
          variantValue: v.variant_value,
          skuModifier: v.sku_modifier
        }))
    }));
  },

  async createStyle(style: Style): Promise<void> {
    const { error: styleError } = await supabase
      .from('styles')
      .insert({
        id: style.id,
        name: style.name,
        base_item_id: style.baseItemId
      });

    if (styleError) throw styleError;

    if (style.variants && style.variants.length > 0) {
      const { error: variantsError } = await supabase
        .from('style_variants')
        .insert(
          style.variants.map(v => ({
            style_id: style.id,
            variant_name: v.variantName,
            variant_value: v.variantValue,
            sku_modifier: v.skuModifier
          }))
        );

      if (variantsError) throw variantsError;
    }
  },

  async updateStyle(style: Style): Promise<void> {
    const { error: styleError } = await supabase
      .from('styles')
      .update({
        name: style.name,
        base_item_id: style.baseItemId
      })
      .eq('id', style.id);

    if (styleError) throw styleError;

    await supabase.from('style_variants').delete().eq('style_id', style.id);

    if (style.variants && style.variants.length > 0) {
      const { error: variantsError } = await supabase
        .from('style_variants')
        .insert(
          style.variants.map(v => ({
            style_id: style.id,
            variant_name: v.variantName,
            variant_value: v.variantValue,
            sku_modifier: v.skuModifier
          }))
        );

      if (variantsError) throw variantsError;
    }
  },

  async deleteStyle(id: string): Promise<void> {
    await supabase.from('style_variants').delete().eq('style_id', id);

    const { error } = await supabase
      .from('styles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getPricingRules(): Promise<PricingRule[]> {
    const { data: groupsData, error: groupsError } = await supabase
      .from('mix_match_groups')
      .select('*')
      .order('name');

    if (groupsError) throw groupsError;

    const { data: itemsData, error: itemsError } = await supabase
      .from('mix_match_items')
      .select('*, items(name, sku, selling_price)');

    if (itemsError) throw itemsError;

    return (groupsData || []).map(g => ({
      id: g.id,
      name: g.name,
      type: g.type,
      quantityNeeded: g.quantity_needed,
      discountAmount: parseFloat(g.discount_amount),
      discountType: g.discount_type,
      startDate: g.start_date,
      endDate: g.end_date,
      items: (itemsData || [])
        .filter(i => i.group_id === g.id)
        .map(i => ({
          id: i.id,
          groupId: i.group_id,
          itemId: i.item_id,
          itemName: i.items?.name,
          sku: i.items?.sku,
          price: i.items?.selling_price ? parseFloat(i.items.selling_price) : undefined
        }))
    }));
  },

  async createPricingRule(rule: PricingRule): Promise<void> {
    const { error: ruleError } = await supabase
      .from('mix_match_groups')
      .insert({
        id: rule.id,
        name: rule.name,
        type: rule.type,
        quantity_needed: rule.quantityNeeded,
        discount_amount: rule.discountAmount,
        discount_type: rule.discountType,
        start_date: rule.startDate,
        end_date: rule.endDate
      });

    if (ruleError) throw ruleError;

    if (rule.items && rule.items.length > 0) {
      const { error: itemsError } = await supabase
        .from('mix_match_items')
        .insert(
          rule.items.map(i => ({
            group_id: rule.id,
            item_id: i.itemId
          }))
        );

      if (itemsError) throw itemsError;
    }
  },

  async updatePricingRule(rule: PricingRule): Promise<void> {
    const { error: ruleError } = await supabase
      .from('mix_match_groups')
      .update({
        name: rule.name,
        type: rule.type,
        quantity_needed: rule.quantityNeeded,
        discount_amount: rule.discountAmount,
        discount_type: rule.discountType,
        start_date: rule.startDate,
        end_date: rule.endDate
      })
      .eq('id', rule.id);

    if (ruleError) throw ruleError;

    await supabase.from('mix_match_items').delete().eq('group_id', rule.id);

    if (rule.items && rule.items.length > 0) {
      const { error: itemsError } = await supabase
        .from('mix_match_items')
        .insert(
          rule.items.map(i => ({
            group_id: rule.id,
            item_id: i.itemId
          }))
        );

      if (itemsError) throw itemsError;
    }
  },

  async deletePricingRule(id: string): Promise<void> {
    await supabase.from('mix_match_items').delete().eq('group_id', id);

    const { error } = await supabase
      .from('mix_match_groups')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getCustomerPrices(): Promise<CustomerPrice[]> {
    const { data, error } = await supabase
      .from('customer_item_prices')
      .select(`
        *,
        customers(first_name, last_name, company),
        items(name, sku, selling_price)
      `);

    if (error) throw error;

    return (data || []).map(cp => ({
      id: cp.id,
      customerId: cp.customer_id,
      itemId: cp.item_id,
      price: parseFloat(cp.price),
      firstName: cp.customers?.first_name,
      lastName: cp.customers?.last_name,
      company: cp.customers?.company,
      itemName: cp.items?.name,
      sku: cp.items?.sku,
      regularPrice: cp.items?.selling_price ? parseFloat(cp.items.selling_price) : undefined
    }));
  },

  async createCustomerPrice(cp: CustomerPrice): Promise<void> {
    const { error } = await supabase
      .from('customer_item_prices')
      .insert({
        customer_id: cp.customerId,
        item_id: cp.itemId,
        price: cp.price
      });

    if (error) throw error;
  },

  async updateCustomerPrice(cp: CustomerPrice): Promise<void> {
    const { error } = await supabase
      .from('customer_item_prices')
      .update({
        price: cp.price
      })
      .eq('id', cp.id);

    if (error) throw error;
  },

  async deleteCustomerPrice(id: number): Promise<void> {
    const { error } = await supabase
      .from('customer_item_prices')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getSettlements(): Promise<Settlement[]> {
    const { data, error } = await supabase
      .from('settlements')
      .select('*')
      .order('settlement_date', { ascending: false });

    if (error) throw error;

    return (data || []).map(s => ({
      id: s.id,
      settlementDate: s.settlement_date,
      totalAmount: parseFloat(s.total_amount),
      status: s.status,
      notes: s.notes
    }));
  },

  async createSettlement(settlement: Settlement): Promise<void> {
    const { error } = await supabase
      .from('settlements')
      .insert({
        settlement_date: settlement.settlementDate,
        total_amount: settlement.totalAmount,
        status: settlement.status,
        notes: settlement.notes
      });

    if (error) throw error;
  },

  async updateSettlement(settlement: Settlement): Promise<void> {
    const { error } = await supabase
      .from('settlements')
      .update({
        settlement_date: settlement.settlementDate,
        total_amount: settlement.totalAmount,
        status: settlement.status,
        notes: settlement.notes
      })
      .eq('id', settlement.id);

    if (error) throw error;
  },

  async deleteSettlement(id: number): Promise<void> {
    const { error } = await supabase
      .from('settlements')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async bulkUpdatePrices(updates: { id: string; price: number }[]): Promise<void> {
    for (const update of updates) {
      const { error } = await supabase
        .from('items')
        .update({ selling_price: update.price })
        .eq('id', update.id);

      if (error) throw error;
    }
  },

  async getPaymentMethods(): Promise<any[]> {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async addPaymentMethod(method: any): Promise<void> {
    if (method.is_default) {
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .neq('id', method.id);
    }

    const { error } = await supabase
      .from('payment_methods')
      .insert({
        id: method.id,
        type: method.type,
        provider: method.provider,
        last4: method.last4,
        expiry_month: method.expiry_month,
        expiry_year: method.expiry_year,
        brand: method.brand,
        is_default: method.is_default
      });

    if (error) throw error;
  },

  async deletePaymentMethod(id: string): Promise<void> {
    const { error } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
