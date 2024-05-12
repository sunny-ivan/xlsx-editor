import { useMsal } from "@azure/msal-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPreferDocument,
  hasPreferDocument,
} from "../../services/storage/prefer-document";
import FullFeaturedCrudGrid from "./table";
import { Box, Typography } from "@mui/material";
import { Table } from "../../services/workbooks/table";
import { GridColDef } from "@mui/x-data-grid";
import ErrorPage from "../error-page";

let columns: GridColDef[] = [];

let table: Table;

const handleGetColumns = () => {
  return columns;
};

function ViewTable() {
  const { instance: pca } = useMsal();
  const navigate = useNavigate();
  const [driveId, setDriveId] = useState("");
  const [itemId, setItemId] = useState("");
  const [worksheetId, setWorksheetId] = useState("");
  const [tableId, setTableId] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const pullColumns = async () => {
    setLoading(true);
    setError(null);
    table = new Table(driveId, itemId, worksheetId, tableId);
    table
      .columns()
      .then((remoteCols) => {
        const newCols: GridColDef[] = [];
        remoteCols.forEach((col) => {
          if (col && col.id && col.name) {
            return newCols.push({
              field: col.name,
              headerName: col.name,
              editable: true,
            });
          }
          return undefined;
        });

        columns = newCols;
        setError(null);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  };

  // Prevents premature loading that prevents the table position from being retrieved.
  // This can be solved if there is a setState with callback
  useEffect(() => {
    if (tableId) {
      pullColumns();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableId]);

  const AUTHENTICATION_REQUIRED_MESSAGE =
    "WorkbookTable:AuthenticationRequired";

  useEffect(() => {
    setLoading(true);
    if (!hasPreferDocument()) {
      navigate("/choose");
    }

    pca
      .initialize()
      .then(() => {
        if (pca.getAllAccounts().length <= 0) {
          navigate("/login");
          throw new Error(AUTHENTICATION_REQUIRED_MESSAGE);
        }
        const { driveId, itemId, worksheetId, tableId } = getPreferDocument();

        setDriveId(driveId);
        setItemId(itemId);
        setWorksheetId(worksheetId);
        setTableId(tableId);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box>
      {loading ? (
        <Typography>Loading...</Typography>
      ) : error === null ? (
        <FullFeaturedCrudGrid
          itemId={itemId}
          table={table}
          getColumns={handleGetColumns}
        />
      ) : (
        <ErrorPage error={error} />
      )}
    </Box>
  );
}

export default ViewTable;
