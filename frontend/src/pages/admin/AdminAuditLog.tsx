import React, { useState } from "react";
import { Box, Typography, Chip, CircularProgress, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { useAdminAuditLog } from "../../hooks/useAdmin";
import AdminLayout from "../../components/admin/AdminLayout";
import { Pagination } from "@mui/material";


const ENTITIES = ["", "Product", "Order", "User"];

const AdminAuditLog: React.FC = () => {
  const [entity, setEntity] = useState("");
  const [page, setPage] = useState(1);

  const { data: logRes, isLoading: loading } = useAdminAuditLog({ page, limit: 20, entity: entity || undefined });
  const logs = logRes?.data || [];
  const meta = logRes?.meta || { total: 0, totalPages: 1 };

  return (
    <AdminLayout>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Typography variant="h4" sx={{ fontFamily: '"Prosto One", sans-serif', fontWeight: 400 }}>Audit Log</Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Entity</InputLabel>
          <Select value={entity} label="Entity" onChange={e => { setEntity(e.target.value); setPage(1); }}>
            {ENTITIES.map(e => <MenuItem key={e} value={e}>{e || "All"}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      {loading ? <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box> : (
        <>
          <Box sx={{ overflowX: "auto", border: "1px solid var(--color-outline)" }}>
            <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
              <Box component="thead" sx={{ bgcolor: "var(--color-bg-variant)" }}>
                <Box component="tr">
                  {["Time", "Admin", "Action", "Entity", "Note"].map(h => (
                    <Box key={h} component="th" sx={{ p: 2, textAlign: "left", fontFamily: "Montserrat", fontSize: "12px", fontWeight: 600, color: "text.secondary", borderBottom: "1px solid var(--color-outline)" }}>{h}</Box>
                  ))}
                </Box>
              </Box>
              <Box component="tbody">
                {logs.length === 0 && <Box component="tr"><Box component="td" colSpan={5} sx={{ p: 4, textAlign: "center", fontFamily: "Montserrat", color: "text.secondary" }}>No audit entries.</Box></Box>}
                {logs.map(log => (
                  <Box component="tr" key={log._id} sx={{ "&:hover": { bgcolor: "var(--color-bg-variant)" }, borderBottom: "1px solid var(--color-outline)" }}>
                    <Box component="td" sx={{ p: 2, fontFamily: "Montserrat", fontSize: "12px", color: "text.secondary", whiteSpace: "nowrap" }}>{new Date(log.createdAt).toLocaleString()}</Box>
                    <Box component="td" sx={{ p: 2, fontFamily: "Montserrat", fontSize: "13px" }}>{log.adminId?.name || "—"}</Box>
                    <Box component="td" sx={{ p: 2 }}>
                      <Chip label={log.action} size="small" variant="outlined" sx={{ fontFamily: "Montserrat", fontSize: "11px" }} />
                    </Box>
                    <Box component="td" sx={{ p: 2, fontFamily: "Montserrat", fontSize: "13px", color: "text.secondary" }}>{log.entity}</Box>
                    <Box component="td" sx={{ p: 2, fontFamily: "Montserrat", fontSize: "13px", maxWidth: 300 }}>{log.note || "—"}</Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
          <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography sx={{ fontFamily: "Montserrat", fontSize: "14px", color: "text.secondary" }}>
              Total: {meta.total} entries
            </Typography>
            <Pagination 
              count={meta.totalPages} 
              page={page} 
              onChange={(_, v) => setPage(v)} 
              shape="rounded"
              color="primary"
            />
          </Box>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminAuditLog;
