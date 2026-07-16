import { supabase, getIsSupabaseConfigured } from "./supabaseClient";

export interface Purchase {
  id: string;
  vendor: string;
  marks: number;
  rate: number;
  gst: number;
  total: number;
  batch: string;
  date: string;
  status: string; // 'Pending' | 'On hold' | 'Recorded'
  invoice: string;
  itemName: string;
  itemId: string;
  freight: number;
  remarks: string;
  vendorPhone?: string;
  vendorGst?: string;
  vendorPan?: string;
  vendorEmail?: string;
  vendorAddress?: string;
}

/**
 * Maps database row format to frontend Purchase interface format
 */
function mapRowToPurchase(row: any): Purchase {
  return {
    id: row.id,
    vendor: row.suppliers?.name || "Unknown Supplier",
    marks: row.marks,
    rate: Number(row.rate),
    gst: Number(row.gst_rate),
    total: Number(row.total_amount),
    batch: row.batch_id,
    date: row.created_at ? row.created_at.split("T")[0] : row.date,
    status: row.status,
    invoice: row.invoice_no,
    itemName: row.item_name,
    itemId: row.item_id,
    freight: Number(row.freight),
    remarks: row.remarks || "",
  };
}

/**
 * Fetches purchases from Supabase if configured; otherwise returns localStorage fallback
 */
export async function getPurchases(fallbackData: Purchase[]): Promise<Purchase[]> {
  if (!getIsSupabaseConfigured()) {
    console.log("Supabase is not configured. Using localStorage data.");
    return fallbackData;
  }

  try {
    const { data, error } = await supabase
      .from("purchases")
      .select("*, suppliers(name)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching from Supabase:", error.message);
      return fallbackData;
    }

    if (data) {
      return data.map(mapRowToPurchase);
    }
  } catch (err) {
    console.error("Supabase request failed:", err);
  }
  return fallbackData;
}

/**
 * Inserts a new purchase. Automatically resolves or creates the supplier by name.
 */
export async function savePurchase(purchase: Purchase): Promise<boolean> {
  if (!getIsSupabaseConfigured()) {
    console.log("Supabase not configured. Purchase saved locally.");
    return false;
  }

  try {
    // 1. Resolve or create supplier
    let supplierId = null;
    const { data: supplierData, error: supplierSelectError } = await supabase
      .from("suppliers")
      .select("id")
      .eq("name", purchase.vendor)
      .maybeSingle();

    if (supplierSelectError) {
      console.error("Supplier lookup error:", supplierSelectError.message);
    }

    if (supplierData) {
      supplierId = supplierData.id;
    } else {
      // Create new supplier if it does not exist
      const { data: newSupplier, error: supplierInsertError } = await supabase
        .from("suppliers")
        .insert({ 
          name: purchase.vendor,
          phone: purchase.vendorPhone || null,
          gst_no: purchase.vendorGst || null,
          pan_no: purchase.vendorPan || null,
          address: purchase.vendorAddress || null,
          email: purchase.vendorEmail || null
        })
        .select("id")
        .single();

      if (supplierInsertError) {
        console.error("Failed to create supplier:", supplierInsertError.message);
        return false;
      }
      supplierId = newSupplier.id;
    }

    // 2. Insert the purchase
    const dbPurchase = {
      id: purchase.id,
      supplier_id: supplierId,
      item_name: purchase.itemName,
      item_id: purchase.itemId,
      invoice_no: purchase.invoice,
      batch_id: purchase.batch,
      marks: purchase.marks,
      rate: purchase.rate,
      gst_rate: purchase.gst,
      freight: purchase.freight,
      status: purchase.status,
      remarks: purchase.remarks,
      created_at: new Date(purchase.date).toISOString(),
    };

    const { error: purchaseError } = await supabase.from("purchases").insert(dbPurchase);

    if (purchaseError) {
      console.error("Failed to save purchase:", purchaseError.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Supabase insert transaction failed:", err);
    return false;
  }
}

/**
 * Updates status and freight amount in Supabase
 */
export async function updatePurchaseStatus(
  id: string,
  newStatus: string,
  freightAmt: number = 0
): Promise<boolean> {
  if (!getIsSupabaseConfigured()) {
    console.log("Supabase not configured. Status updated locally.");
    return false;
  }

  try {
    const { error } = await supabase
      .from("purchases")
      .update({ status: newStatus, freight: freightAmt })
      .eq("id", id);

    if (error) {
      console.error("Failed to update status on Supabase:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Supabase update failed:", err);
    return false;
  }
}
