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

export interface MaterialIssue {
  id: string;
  batchId: string;
  issueDate: string;
  bobbinsIssued: number;
  grossWeight: number;
  crateWeight: number;
  bobbinWeight: number;
  netWeight: number;
  issuedTo: string;
  status: string; // 'Active' | 'Closed'
  remarks: string;
}

export interface JobCard {
  id: string;
  issueId: string;
  cardDate: string;
  sareeDesign: string;
  preparationType: string; // 'Body warp' | 'Border warp'
  loomNo: string;
  operatorName: string;
  ends: number;
  lengthMeters: number;
  warpWidth?: number; // Added field
  status: string; // 'In progress' | 'Pending Warp' | 'Needs Review' | 'Completed'
  wastage?: number;
  leftoverZari?: number;
}

export interface WarpingLog {
  id: string;
  jobCardId: string;
  startWeight: number;
  remainingWeight: number;
  netWarpWeight: number;
  wastage: number;
  operatorName: string;
  loggedAt?: string;
}

export interface Reconciliation {
  id?: string;
  jobCardId: string;
  issuedWeight: number;
  netUsedWeight: number;
  wastageWeight: number;
  lossPercentage: number;
  status: string; // 'Within tolerance' | 'Minor deviation' | 'Needs investigation'
}

function mapRowToMaterialIssue(row: any): MaterialIssue {
  return {
    id: row.id,
    batchId: row.batch_id,
    issueDate: row.issue_date,
    bobbinsIssued: Number(row.bobbins_issued),
    grossWeight: Number(row.gross_weight_g),
    crateWeight: Number(row.crate_weight_g),
    bobbinWeight: Number(row.bobbin_weight_g),
    netWeight: Number(row.net_weight_g),
    issuedTo: row.issued_to,
    status: row.status,
    remarks: row.remarks || "",
  };
}

function mapRowToJobCard(row: any): JobCard {
  return {
    id: row.id,
    issueId: row.issue_id,
    cardDate: row.card_date,
    sareeDesign: row.saree_design,
    preparationType: row.preparation_type,
    loomNo: row.loom_no,
    operatorName: row.operator_name,
    ends: Number(row.ends),
    lengthMeters: Number(row.length_meters),
    warpWidth: row.warp_width ? Number(row.warp_width) : undefined,
    status: row.status,
    wastage: row.wastage_g ? Number(row.wastage_g) : undefined,
    leftoverZari: row.leftover_zari_g ? Number(row.leftover_zari_g) : undefined,
  };
}

function mapRowToWarpingLog(row: any): WarpingLog {
  return {
    id: row.id,
    jobCardId: row.job_card_id,
    startWeight: Number(row.start_weight_g),
    remainingWeight: Number(row.remaining_weight_g),
    netWarpWeight: Number(row.net_warp_weight_g),
    wastage: Number(row.wastage_g),
    operatorName: row.operator_name,
    loggedAt: row.logged_at,
  };
}

function mapRowToReconciliation(row: any): Reconciliation {
  return {
    id: row.id,
    jobCardId: row.job_card_id,
    issuedWeight: Number(row.issued_weight_g),
    netUsedWeight: Number(row.net_used_weight_g),
    wastageWeight: Number(row.wastage_weight_g),
    lossPercentage: Number(row.loss_percentage),
    status: row.status,
  };
}

export async function getMaterialIssues(fallbackData: MaterialIssue[]): Promise<MaterialIssue[]> {
  if (!getIsSupabaseConfigured()) return fallbackData;
  try {
    const { data, error } = await supabase
      .from("material_issues")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching material_issues:", error.message);
      return fallbackData;
    }
    if (data) return data.map(mapRowToMaterialIssue);
  } catch (err) {
    console.error("Supabase issues request failed:", err);
  }
  return fallbackData;
}

export async function saveMaterialIssue(issue: MaterialIssue): Promise<boolean> {
  if (!getIsSupabaseConfigured()) return false;
  try {
    const dbIssue = {
      id: issue.id,
      batch_id: issue.batchId,
      issue_date: issue.issueDate,
      bobbins_issued: issue.bobbinsIssued,
      gross_weight_g: issue.grossWeight,
      crate_weight_g: issue.crateWeight,
      bobbin_weight_g: issue.bobbinWeight,
      issued_to: issue.issuedTo,
      status: issue.status,
      remarks: issue.remarks,
    };
    const { error } = await supabase.from("material_issues").insert(dbIssue);
    if (error) {
      console.error("Failed to save material_issue:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Supabase material_issue insert failed:", err);
    return false;
  }
}

export async function getJobCards(fallbackData: JobCard[]): Promise<JobCard[]> {
  if (!getIsSupabaseConfigured()) return fallbackData;
  try {
    const { data, error } = await supabase
      .from("job_cards")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching job_cards:", error.message);
      return fallbackData;
    }
    if (data) return data.map(mapRowToJobCard);
  } catch (err) {
    console.error("Supabase job_cards request failed:", err);
  }
  return fallbackData;
}

export async function saveJobCard(jc: JobCard): Promise<boolean> {
  if (!getIsSupabaseConfigured()) return false;
  try {
    const dbJc = {
      id: jc.id,
      issue_id: jc.issueId,
      card_date: jc.cardDate,
      saree_design: jc.sareeDesign,
      preparation_type: jc.preparationType,
      loom_no: jc.loomNo,
      operator_name: jc.operatorName,
      ends: jc.ends,
      length_meters: jc.lengthMeters,
      warp_width: jc.warpWidth || null,
      status: jc.status,
      wastage_g: jc.wastage || 0,
      leftover_zari_g: jc.leftoverZari || 0,
    };
    const { error } = await supabase.from("job_cards").upsert(dbJc);
    if (error) {
      console.error("Failed to save job_card:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Supabase job_card insert failed:", err);
    return false;
  }
}

export async function getWarpingLogs(fallbackData: WarpingLog[]): Promise<WarpingLog[]> {
  if (!getIsSupabaseConfigured()) return fallbackData;
  try {
    const { data, error } = await supabase
      .from("warping_logs")
      .select("*")
      .order("logged_at", { ascending: false });
    if (error) {
      console.error("Error fetching warping_logs:", error.message);
      return fallbackData;
    }
    if (data) return data.map(mapRowToWarpingLog);
  } catch (err) {
    console.error("Supabase warping_logs request failed:", err);
  }
  return fallbackData;
}

export async function saveWarpingLog(log: WarpingLog): Promise<boolean> {
  if (!getIsSupabaseConfigured()) return false;
  try {
    const startW = log.startWeight > 0 ? log.startWeight : (log.netWarpWeight || 0);
    const remW = Math.max(0, startW - (log.netWarpWeight || 0));
    const dbLog = {
      id: log.id,
      job_card_id: log.jobCardId,
      start_weight_g: startW,
      remaining_weight_g: remW,
      wastage_g: log.wastage || 0,
      operator_name: log.operatorName,
    };
    const { error } = await supabase.from("warping_logs").insert(dbLog);
    if (error) {
      console.error("Failed to save warping_log:", error.message);
      return false;
    }
    
    // Also update the job card status to Needs Review for final wastage inputs
    await supabase.from("job_cards").update({ status: "Needs Review" }).eq("id", log.jobCardId);
    
    return true;
  } catch (err) {
    console.error("Supabase warping_log insert failed:", err);
    return false;
  }
}

export async function updateJobCardCompletion(id: string, wastage: number, leftoverZari: number): Promise<boolean> {
  if (!getIsSupabaseConfigured()) return false;
  try {
    const { error } = await supabase
      .from("job_cards")
      .update({
        wastage_g: wastage,
        leftover_zari_g: leftoverZari,
        status: "Completed"
      })
      .eq("id", id);
    if (error) {
      console.error("Failed to complete job_card:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Supabase job_card update failed:", err);
    return false;
  }
}

export async function getReconciliations(fallbackData: Reconciliation[]): Promise<Reconciliation[]> {
  if (!getIsSupabaseConfigured()) return fallbackData;
  try {
    const { data, error } = await supabase
      .from("reconciliations")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching reconciliations:", error.message);
      return fallbackData;
    }
    if (data) return data.map(mapRowToReconciliation);
  } catch (err) {
    console.error("Supabase reconciliations request failed:", err);
  }
  return fallbackData;
}

export async function saveReconciliation(recon: Reconciliation): Promise<boolean> {
  if (!getIsSupabaseConfigured()) return false;
  try {
    const dbRecon = {
      job_card_id: recon.jobCardId,
      issued_weight_g: recon.issuedWeight,
      net_used_weight_g: recon.netUsedWeight,
      wastage_weight_g: recon.wastageWeight,
      loss_percentage: recon.lossPercentage,
      status: recon.status,
    };
    const { error } = await supabase.from("reconciliations").insert(dbRecon);
    if (error) {
      console.error("Failed to save reconciliation:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Supabase reconciliation insert failed:", err);
    return false;
  }
}
